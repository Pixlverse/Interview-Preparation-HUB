// Cloud & DevOps — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'cloud-devops',
  title: 'Cloud & DevOps',
  icon: '☁️',
  description: 'How your Node/React apps run in production: AWS and GCP services, Docker, Kubernetes, CI/CD, safe deployments, and monitoring — explained simply.',
  definitionTitle: 'What are Cloud and DevOps?',
  definition: `**Cloud computing** means renting computing resources — servers, storage, databases, networking — from providers like **AWS** or **Google Cloud (GCP)** over the internet, and paying for what you use, instead of buying your own hardware.

**DevOps** is a set of practices that joins **development** and **operations**, so code can be built, tested, shipped and monitored quickly and reliably. The tools include **Docker** (containers), **CI/CD** (automatic build-test-deploy pipelines like GitHub Actions), **Kubernetes**, Infrastructure as Code (Terraform), and logging and monitoring.

**One-line answer:** "Cloud is on-demand, pay-as-you-go infrastructure from providers like AWS and GCP, and DevOps is the culture and tooling — containers, CI/CD, IaC and monitoring — for shipping and running software reliably."`,
  topics: [
    {
      id: 'cloud-fundamentals',
      title: 'Cloud Basics: IaaS, PaaS, SaaS, Regions and Availability Zones',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'The cloud is renting computers and services by the hour. Know the service models, regions, AZs and the shared responsibility model.',
      what: `**Cloud computing** means you rent computers, storage and ready-made services from a provider (AWS, GCP, Azure) over the internet, and pay only for what you use.

There are three main service models:
- **IaaS** (Infrastructure as a Service): you rent raw virtual machines. Example: AWS EC2. You manage the OS, Node version, patches.
- **PaaS** (Platform as a Service): you give your code or container, the platform runs it. Example: Cloud Run, Elastic Beanstalk, Heroku.
- **SaaS** (Software as a Service): a finished product you just use. Example: Gmail, Stripe dashboard.

A **region** is a geographic area (like \`ap-south-1\` in Mumbai). Each region has several **Availability Zones (AZs)** — separate data centers with their own power and network.

#### Deeper version
- **Shared responsibility model:** the provider secures the cloud itself (buildings, hardware, hypervisor). You secure what you put **in** the cloud (your code, IAM permissions, data, open ports). The more managed the service, the less you manage.
- **High availability** means running in at least two AZs, so one data center failure does not take you down.
- **Serverless** is a step beyond PaaS: no servers to think about at all, scale to zero, pay per request (Lambda, Cloud Run).
- **Vertical scaling** = bigger machine. **Horizontal scaling** = more machines behind a load balancer. The cloud makes horizontal scaling easy.`,
      why: `Before the cloud, companies bought physical servers, waited weeks, and paid for peak capacity all year. The cloud lets you start in minutes, scale up on a busy day and down at night, and use managed services (databases, queues, CDNs) instead of building them yourself.`,
      analogy: `IaaS is renting an empty flat: you buy the furniture and fix the taps. PaaS is a furnished flat: just move in with your bags (your code). SaaS is a hotel room: everything is done, you just use it. Regions are cities; AZs are separate buildings in the same city, so a fire in one building does not stop you.`,
      code: [
        {
          title: 'See regions and AZs with the AWS CLI',
          lang: 'bash',
          code: `# Which region is my CLI using?
aws configure get region            # e.g. ap-south-1

# List the Availability Zones in that region
aws ec2 describe-availability-zones --query "AvailabilityZones[].ZoneName"
# ["ap-south-1a", "ap-south-1b", "ap-south-1c"]

# Run any command in a different region
aws s3 ls --region us-east-1`,
        },
      ],
      output: `The first command prints your default region. The second lists the AZs inside it — usually 3 or more. If you spread your servers or database replicas across \`ap-south-1a\` and \`ap-south-1b\`, losing one data center does not take your app offline. The last line shows that most AWS commands are region-specific: resources in one region are not visible from another (except global services like IAM and CloudFront).`,
      questions: [
        {
          q: 'What is the difference between IaaS, PaaS and SaaS?',
          a: 'IaaS gives you virtual machines and you manage the OS (EC2). PaaS runs your code or container and manages the servers (Cloud Run, Beanstalk). SaaS is a finished product you just use (Gmail).',
        },
        {
          q: 'What is the difference between a region and an Availability Zone?',
          a: 'A region is a geographic area. An AZ is one or more isolated data centers inside a region. You deploy across multiple AZs for high availability and across regions for disaster recovery or lower latency for far-away users.',
        },
        {
          q: 'What is the shared responsibility model?',
          a: 'The cloud provider secures the physical infrastructure. The customer secures their own data, IAM permissions, network rules and application code.',
        },
        {
          q: 'Vertical vs horizontal scaling?',
          a: 'Vertical means a bigger machine (more CPU/RAM); it has a limit and often needs a restart. Horizontal means more machines behind a load balancer; it needs the app to be stateless.',
        },
      ],
      spoken: `"The cloud is renting compute, storage and managed services and paying for what you use. There are three models: IaaS like EC2 where I manage the OS, PaaS like Cloud Run where I just ship a container, and SaaS which is a finished product. AWS is split into regions, and each region has multiple Availability Zones, which are separate data centers. For high availability I run in at least two AZs. Security follows the shared responsibility model: AWS secures the hardware, and I secure my IAM, network rules, data and code."`,
      mistakes: [
        'Thinking one AZ is "highly available". A single AZ is a single point of failure; use at least two.',
        'Assuming the cloud provider is responsible for your security. An open S3 bucket or an admin IAM key in GitHub is your fault, not AWS\'s.',
        'Forgetting that most resources are regional. Looking for your Lambda in the wrong region is a classic "it disappeared" moment.',
        'Follow-up trap: "Is serverless the same as PaaS?" Close, but serverless also scales to zero and bills per request or per millisecond, and you never pick a server size or count.',
      ],
      takeaway: 'Cloud = rent instead of buy; pick the most managed service that fits, and always spread across multiple AZs.',
    },
    {
      id: 'iam-basics',
      title: 'IAM Basics: Users, Roles, Policies and Least Privilege',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'IAM decides who can do what on which AWS resource. Use roles over long-lived keys, and give the smallest permissions possible.',
      what: `**IAM** (Identity and Access Management) is the AWS security system that answers: **who** can do **what** on **which resource**.

- **User:** a person or app with long-term credentials (password or access keys).
- **Group:** a set of users that share permissions (e.g. "developers").
- **Role:** an identity with **no** long-term keys. Something "assumes" the role and gets **temporary** credentials. Lambda functions, EC2 servers and CI pipelines use roles.
- **Policy:** a JSON document listing what is allowed or denied. You attach it to a user, group or role.

**Least privilege** means giving only the exact permissions needed — nothing more.

#### Deeper version
- A policy statement has \`Effect\` (Allow/Deny), \`Action\` (like \`s3:GetObject\`), \`Resource\` (an ARN — Amazon Resource Name) and an optional \`Condition\`.
- Evaluation rule: everything is **denied by default**. An explicit **Allow** opens it. An explicit **Deny** always wins over any Allow.
- **Identity-based policies** attach to users/roles. **Resource-based policies** attach to a resource (like an S3 bucket policy) and can allow other accounts.
- A role has a **trust policy** (who may assume it, e.g. \`lambda.amazonaws.com\`) and **permission policies** (what it may do).
- Credentials are temporary via **STS** (Security Token Service). GitHub Actions can assume a role using **OIDC**, so you store no AWS keys in GitHub at all.`,
      why: `Without IAM, any leaked key could delete your whole account. IAM lets you give a Lambda function permission to read **one** bucket and write to **one** DynamoDB table — so if the function is hacked, the damage is small. Roles remove the need to store secret keys in code or env files.`,
      analogy: `IAM is the key-card system of an office building. A **user** is an employee with a permanent card. A **role** is a visitor badge: you get it at the desk, it works for a few hours, then it expires. A **policy** is the list of doors a card can open. Least privilege means the intern's card opens the kitchen and their floor — not the server room.`,
      code: [
        {
          title: 'Least-privilege policy for a Lambda that reads uploads',
          lang: 'json',
          code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadUploadsOnly",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::my-app-uploads/*"
    },
    {
      "Sid": "WriteOrdersTable",
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:GetItem"],
      "Resource": "arn:aws:dynamodb:ap-south-1:123456789012:table/Orders"
    }
  ]
}`,
        },
        {
          title: 'Trust policy: who can assume this role',
          lang: 'json',
          code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}`,
        },
      ],
      output: `The first policy lets the function read objects only from the \`my-app-uploads\` bucket and only read/write items in the \`Orders\` table. Trying \`s3:DeleteObject\` or reading another bucket returns **AccessDenied**, because anything not allowed is denied by default.

The second document is the role's **trust policy**: it says only the Lambda service may assume this role. When Lambda runs, AWS gives it short-lived credentials automatically — your code never sees an access key, and the AWS SDK picks them up by itself.`,
      questions: [
        {
          q: 'What is the difference between an IAM user and an IAM role?',
          a: 'A user has long-term credentials and usually represents a person. A role has no permanent keys; it is assumed by a service, app or person and gives temporary credentials. Prefer roles for anything running in AWS.',
        },
        {
          q: 'If one policy allows an action and another denies it, what happens?',
          a: 'An explicit Deny always wins. The order is: default deny, explicit allow opens access, explicit deny overrides everything.',
        },
        {
          q: 'What is least privilege and how do you apply it?',
          a: 'Give only the permissions needed. Use specific actions instead of `s3:*`, specific resource ARNs instead of `*`, separate roles per service, and review with IAM Access Analyzer or last-accessed data.',
        },
        {
          q: 'How should a CI pipeline get AWS access?',
          a: 'Best practice is OIDC: GitHub Actions assumes an IAM role and gets temporary credentials. No long-lived access keys are stored as secrets.',
        },
      ],
      spoken: `"IAM controls who can do what on which AWS resource. Users are long-term identities, mostly for people. Roles have no permanent keys — a service like Lambda or EC2 assumes the role and gets temporary credentials, so I never put access keys in code. Permissions come from JSON policies with effect, action, resource and optional conditions. Everything is denied by default, an allow opens it, and an explicit deny always wins. I follow least privilege: one role per service, specific actions, specific ARNs, and OIDC for GitHub Actions instead of stored keys."`,
      mistakes: [
        'Using the root account for daily work. Lock it with MFA and use IAM users/SSO and roles instead.',
        'Writing `"Action": "*"` and `"Resource": "*"` "just to make it work". This is the opposite of least privilege and is a big audit red flag.',
        'Committing access keys to Git or `.env` files. Use roles, OIDC and a secrets manager.',
        'Follow-up trap: "Your Lambda gets AccessDenied but the policy looks right — what do you check?" The resource ARN (bucket ARN vs `bucket/*`), an explicit Deny somewhere (SCP, bucket policy, permission boundary), KMS key permissions for encrypted data, and the region/account in the ARN.',
      ],
      takeaway: 'Roles over keys, deny by default, explicit deny wins, and grant only the exact actions on the exact resources.',
    },
    {
      id: 'ec2',
      title: 'EC2: Virtual Servers',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'EC2 gives you virtual machines in AWS. You choose size, OS and network, and you manage everything on the machine.',
      what: `**EC2** (Elastic Compute Cloud) lets you rent **virtual machines** (called **instances**) in AWS.

You choose:
- An **AMI** (Amazon Machine Image) — the OS template, like Ubuntu or Amazon Linux.
- An **instance type** — the size, like \`t3.micro\` (small) or \`m6i.large\` (bigger).
- A **security group** — a firewall that says which ports are open.
- A **key pair** — for SSH login.

After that it is your server: you install Node, run your app, apply OS updates.

#### Deeper version
- **Pricing models:** On-Demand (pay per second, flexible), Reserved Instances / Savings Plans (commit 1-3 years, big discount), Spot (spare capacity, up to ~90% cheaper, but AWS can take it back with a 2-minute warning).
- **Storage:** EBS volumes are network disks that survive a stop/start. Instance store is local and is lost when the instance stops.
- **User data** is a script that runs on first boot — useful to install and start your app.
- For production you rarely run one instance. You use an **Auto Scaling Group** behind a **load balancer**, so instances are replaced when they fail.
- An instance should get AWS access through an **instance profile** (an IAM role), not keys on disk.`,
      why: `EC2 gives full control: any OS, any runtime, long-running processes, WebSockets, background workers, GPU machines. It is the base building block that many other AWS services run on. You use it when serverless limits (timeouts, cold starts) do not fit.`,
      analogy: `EC2 is renting a car. You choose the model (instance type) and you drive it, refuel it and keep it clean (patches, monitoring). Lambda is like taking a taxi: you just say where to go and pay per trip.`,
      code: [
        {
          title: 'User data script: set up a Node app on first boot',
          lang: 'bash',
          code: `#!/bin/bash
# Runs once as root when the instance first starts (Amazon Linux 2023)
dnf install -y nodejs git
git clone https://github.com/acme/orders-api.git /opt/app
cd /opt/app
npm ci --omit=dev
npm install -g pm2
# Start the app and make it restart on reboot
PORT=3000 pm2 start server.js --name orders-api
pm2 startup systemd -u root --hp /root
pm2 save`,
        },
        {
          title: 'Launch an instance with the CLI',
          lang: 'bash',
          code: `aws ec2 run-instances --image-id ami-0abcdef1234567890 --instance-type t3.micro --key-name my-key --security-group-ids sg-0123456789abcdef0 --iam-instance-profile Name=orders-api-role --user-data file://setup.sh --count 1`,
        },
      ],
      output: `The CLI starts one \`t3.micro\` instance with the chosen image, firewall and IAM role. On first boot, the user data script installs Node and git, clones the app, installs production dependencies and starts it with **pm2** (a Node process manager that restarts the app if it crashes). \`pm2 startup\` and \`pm2 save\` make the app start again after a reboot. The app now listens on port 3000 — the security group must allow that port (or better, only allow traffic from a load balancer).`,
      questions: [
        {
          q: 'When would you choose EC2 over Lambda?',
          a: 'For long-running processes, WebSockets, steady high traffic (cheaper per request), jobs over 15 minutes, special OS needs, or GPUs. Lambda is better for spiky, event-driven, short tasks.',
        },
        {
          q: 'What are Spot instances and when are they safe to use?',
          a: 'Spare EC2 capacity at a large discount that AWS can reclaim with a 2-minute notice. Use them for stateless, fault-tolerant work like batch jobs, CI runners or extra workers — not your only database.',
        },
        {
          q: 'What is the difference between stopping and terminating an instance?',
          a: 'Stopping shuts it down; EBS data stays and you can start it again (you pay for storage). Terminating deletes the instance, and the root EBS volume is deleted by default.',
        },
        {
          q: 'How does an app on EC2 get AWS credentials safely?',
          a: 'Attach an IAM role through an instance profile. The SDK reads temporary credentials from the instance metadata service. Never store access keys on the server.',
        },
      ],
      spoken: `"EC2 is AWS's virtual machine service. I pick an AMI for the OS, an instance type for size, a security group as the firewall, and attach an IAM role so the app gets temporary credentials. I'm responsible for everything on the box: runtime, patches, process management with something like pm2 or systemd. In production I don't run a single instance — I use an Auto Scaling Group across two AZs behind a load balancer. For cost I use Savings Plans for steady load and Spot for fault-tolerant workers."`,
      mistakes: [
        'Opening SSH (port 22) to `0.0.0.0/0`. Restrict it to your IP, or use SSM Session Manager and keep port 22 closed.',
        'Storing user uploads or state on the instance disk. Instances are replaceable; put files in S3 and data in a database.',
        'Running one instance with no auto scaling and calling it production.',
        'Follow-up trap: "Your instance\'s public IP changed after a restart — why?" Normal public IPs change on stop/start. Use an Elastic IP, or better, put it behind a load balancer and DNS.',
      ],
      takeaway: 'EC2 is full control and full responsibility — use roles, auto scaling and multiple AZs, and keep instances stateless.',
    },
    {
      id: 's3-presigned-urls',
      title: 'S3 and Presigned URLs',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'S3 stores files (objects) in buckets. Presigned URLs let browsers upload or download directly to S3 for a short time, without your server in the middle.',
      what: `**S3** (Simple Storage Service) stores files. Each file is an **object** inside a **bucket**, found by its **key** (like \`avatars/user-42.png\`). It is cheap, very durable, and scales without limits.

A **presigned URL** is a normal S3 link with a temporary signature added. Anyone who has the link can do **one** action (like upload or download one file) until it expires. Your server creates the link using its own permissions, and the browser uses it directly.

#### Deeper version
- The signature is made with the signer's credentials. The URL can never do more than the signer is allowed to do, and it stops working when the credentials it was signed with expire (for example, a Lambda role's temporary credentials), even if the expiry time is longer.
- **Upload flow:** client asks your API for a URL → API checks auth, picks the key, signs a \`PutObject\` URL → client \`PUT\`s the file straight to S3 → client tells the API "done" (or S3 sends an event to Lambda).
- Use a **presigned POST** if you need to limit file size or content type with policy conditions.
- Buckets should **block public access**. Serve public files through CloudFront with Origin Access Control instead.
- **Storage classes** (Standard, Infrequent Access, Glacier) and **lifecycle rules** move old files to cheaper storage automatically.
- The browser needs a **CORS** rule on the bucket to \`PUT\` from your domain.`,
      why: `Uploading big files through your Node server wastes memory, bandwidth and time, and can hit request size limits (API Gateway has a 10 MB payload limit; Lambda has its own limit). With presigned URLs the file goes straight from the browser to S3. Your server only signs a small URL, and the bucket stays private.`,
      analogy: `A presigned URL is like a one-time parking pass. The building manager (your server) writes a pass for spot #42 valid for 5 minutes. The driver (the browser) shows it at the gate (S3) and parks. The driver never gets the master key, and after 5 minutes the pass is useless.`,
      code: [
        {
          title: 'Node API: create a presigned upload URL (AWS SDK v3)',
          lang: 'javascript',
          code: `import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';

const s3 = new S3Client({ region: 'ap-south-1' });

// POST /uploads/url  -> { url, key }
export async function createUploadUrl(req, res) {
  const { contentType } = req.body;
  if (!['image/png', 'image/jpeg'].includes(contentType)) {
    return res.status(400).json({ error: 'Only PNG or JPEG allowed' });
  }
  // The server chooses the key, never the client
  const key = \`avatars/\${req.user.id}/\${crypto.randomUUID()}\`;
  const command = new PutObjectCommand({
    Bucket: 'my-app-uploads',
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
  res.json({ url, key });
}`,
        },
        {
          title: 'React: upload the file straight to S3',
          lang: 'javascript',
          code: `async function uploadAvatar(file) {
  // 1. Ask our API for a signed URL
  const res = await fetch('/uploads/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType: file.type }),
  });
  const { url, key } = await res.json();

  // 2. PUT the file directly to S3 (Content-Type must match what was signed)
  await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });

  // 3. Tell our API the upload is finished
  await fetch('/me/avatar', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
}`,
        },
      ],
      output: `The API checks the file type, builds a safe key under the user's folder, and returns a URL valid for 300 seconds. The browser then sends the file bytes straight to S3 — your Node server never touches them. If someone reuses the URL after 5 minutes, S3 answers **403 AccessDenied** (expired request). If the browser sends a different \`Content-Type\` than the one signed, S3 rejects it with a signature mismatch. Finally the API saves the \`key\` on the user record.`,
      questions: [
        {
          q: 'What is a presigned URL and why use it?',
          a: 'A temporary, signed S3 link that allows one specific action on one object until it expires. It lets clients upload/download directly to a private bucket without your server handling the file and without sharing AWS credentials.',
        },
        {
          q: 'How do you limit the file size for direct uploads?',
          a: 'A presigned PUT URL cannot enforce a size range. Use a presigned POST with a `content-length-range` condition, or validate after upload with an S3 event and delete bad files.',
        },
        {
          q: 'How do you serve private files to logged-in users?',
          a: 'Generate a short-lived presigned GET URL after checking permissions, or use CloudFront signed URLs/cookies for many files with caching.',
        },
        {
          q: 'How do you react when a file is uploaded?',
          a: 'Configure an S3 event notification (to Lambda, SQS or EventBridge) on `ObjectCreated`, e.g. to create thumbnails or scan the file.',
        },
      ],
      spoken: `"S3 is object storage: files live in buckets under keys. For uploads I don't stream files through my Node server. Instead the client asks my API for a presigned URL; the API checks auth, picks the key itself, and signs a PutObject URL that expires in a few minutes. The browser uploads directly to S3, then tells the API the key. The bucket stays private with public access blocked, I add a CORS rule for my domain, and if I need size limits I use a presigned POST with conditions. S3 events can trigger a Lambda for thumbnails or virus scanning."`,
      mistakes: [
        'Letting the client choose the S3 key. A user could overwrite someone else\'s file; always build the key on the server.',
        'Forgetting the bucket CORS rule, so the browser `PUT` fails with a CORS error even though the URL is valid.',
        'Making the bucket public to "fix" access errors. Keep it private and use presigned URLs or CloudFront.',
        'Follow-up trap: "The presigned URL expires earlier than the expiresIn you set — why?" It was signed with temporary credentials (e.g. a role session) that expired first. The URL is only valid while the signing credentials are valid.',
      ],
      takeaway: 'Keep buckets private and let clients talk to S3 directly through short-lived presigned URLs that your server creates.',
    },
    {
      id: 'rds',
      title: 'RDS: Managed Relational Databases',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'RDS runs Postgres/MySQL for you: backups, patches, failover. Know Multi-AZ vs read replicas and connection limits from Lambda.',
      what: `**RDS** (Relational Database Service) is a managed SQL database. You pick the engine (PostgreSQL, MySQL, MariaDB, SQL Server, Oracle, or **Aurora**, AWS's own cloud-native engine) and AWS handles the boring work: backups, OS patches, storage and failover.

You still design tables, write queries, add indexes and choose the instance size.

#### Deeper version
- **Multi-AZ:** a standby copy in another AZ, kept in sync. If the primary fails, AWS switches DNS to the standby (usually within a minute or two). It is for **availability**, not for reading.
- **Read replicas:** async copies you **can** read from. They scale reads (reports, dashboards). Because they are async, data can be slightly behind (**replication lag**).
- **Backups:** automated daily snapshots plus transaction logs give **point-in-time restore** within the retention window.
- **Connections:** each Postgres connection costs memory. Many Lambdas each opening connections can exhaust the database. **RDS Proxy** pools connections in front of the database.
- Put RDS in **private subnets**, allow access only from your app's security group, and enable encryption at rest.`,
      why: `Running your own database on EC2 means you do backups, replication, failover and patching yourself — and get woken at 3 a.m. RDS turns that into checkboxes, so a small team can run a reliable SQL database.`,
      analogy: `RDS is like a car lease with full maintenance. You still drive (queries, schema), but the company does the oil changes (patches), keeps a spare car ready (Multi-AZ) and records every trip (backups).`,
      code: [
        {
          title: 'Connect from Node with a pool (pg)',
          lang: 'javascript',
          code: `import pg from 'pg';

// Create the pool ONCE per process (outside request handlers / Lambda handler)
const pool = new pg.Pool({
  host: process.env.DB_HOST,       // RDS endpoint or RDS Proxy endpoint
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'orders',
  max: 5,                          // keep small, especially on Lambda
  ssl: { rejectUnauthorized: true },
});

export async function getOrder(id) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  return rows[0] ?? null;
}`,
        },
        {
          title: 'Create a read replica',
          lang: 'bash',
          code: `aws rds create-db-instance-read-replica --db-instance-identifier orders-db-replica-1 --source-db-instance-identifier orders-db --db-instance-class db.t4g.medium`,
        },
      ],
      output: `The pool opens at most 5 connections and reuses them across queries. Using \`$1\` placeholders keeps the query safe from SQL injection. Because the pool is created outside the handler, a warm Lambda or a long-running server reuses it instead of reconnecting each request.

The CLI command creates an async copy of \`orders-db\`. Your app can send heavy read queries (reports) to the replica's endpoint while writes still go to the primary.`,
      questions: [
        {
          q: 'What is the difference between Multi-AZ and read replicas?',
          a: 'Multi-AZ is a synchronous standby for automatic failover; you do not read from it (in the classic setup). Read replicas are asynchronous copies used to scale reads and may lag slightly behind.',
        },
        {
          q: 'Why can Lambda + RDS cause problems?',
          a: 'Each concurrent Lambda environment may open its own connections. A traffic spike can create hundreds of connections and exhaust the database. Use RDS Proxy, small pools, and create the pool outside the handler.',
        },
        {
          q: 'RDS vs DynamoDB — how do you choose?',
          a: 'RDS for relational data, joins, transactions and flexible queries. DynamoDB for known access patterns at huge scale with single-digit millisecond latency and no connection management.',
        },
      ],
      spoken: `"RDS is managed SQL — Postgres or MySQL — where AWS handles backups, patching and failover. I enable Multi-AZ in production for availability; that's a synchronous standby that takes over automatically. If reads are heavy, I add read replicas, keeping in mind they're asynchronous, so there can be lag. I keep the database in private subnets and only allow my app's security group. With Lambda I'm careful about connections: I create the pool outside the handler, keep it small, and put RDS Proxy in front so spikes don't exhaust the database."`,
      mistakes: [
        'Thinking Multi-AZ doubles read capacity. In the classic setup the standby is not readable; use read replicas for reads.',
        'Reading your own write from a replica right after writing and getting old data because of replication lag.',
        'Putting the database in a public subnet with a public endpoint.',
        'Follow-up trap: "Error: too many connections during a traffic spike — fix?" Add RDS Proxy or a pooler, lower pool size per instance, reuse the pool across invocations, and limit Lambda concurrency.',
      ],
      takeaway: 'RDS = managed SQL; Multi-AZ for failover, replicas for reads, and pool your connections.',
    },
    {
      id: 'cloudfront-cdn',
      title: 'CloudFront and CDNs',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'A CDN caches your content in edge locations near users, so pages and files load faster and your origin gets less traffic.',
      what: `A **CDN** (Content Delivery Network) is a network of servers around the world, called **edge locations**. It keeps copies (a **cache**) of your files close to users.

**CloudFront** is AWS's CDN. You give it an **origin** — where the real content lives, like an S3 bucket or your API — and users hit the nearest edge. If the edge has the file, it returns it instantly (**cache hit**). If not, it fetches from the origin, stores it, then returns it (**cache miss**).

#### Deeper version
- **TTL** (time to live) is how long the edge keeps a copy. It is controlled by \`Cache-Control\` headers and CloudFront cache policies.
- **Cache key:** what makes two requests "the same" — path, and optionally some query strings, headers or cookies. Adding too much to the key lowers the hit rate.
- **Invalidation** removes files from the cache before TTL ends. Better pattern: **hashed file names** (\`app.3f9a1c.js\`) cached for a year, and \`index.html\` with a short TTL or \`no-cache\`.
- **Origin Access Control (OAC)** lets CloudFront read a private S3 bucket, so the bucket never needs to be public.
- CloudFront also gives free HTTPS at the edge (with an ACM certificate), HTTP/2 and HTTP/3, compression, WAF integration and edge functions (CloudFront Functions, Lambda@Edge).`,
      why: `A user in Sydney fetching files from a server in Mumbai waits for every round trip. A CDN serves from Sydney instead. It also protects your origin: 95% of requests may never reach your server, which saves money and survives traffic spikes.`,
      analogy: `A CDN is like a chain of local warehouses. The main factory (origin) is far away. Popular products are stocked in every city warehouse (edge), so delivery is same-day. If a city warehouse runs out, it orders from the factory once and keeps stock for the next customers.`,
      code: [
        {
          title: 'Upload a React build with the right cache headers',
          lang: 'bash',
          code: `# Hashed assets never change -> cache for 1 year
aws s3 sync dist/assets s3://my-app-web/assets --cache-control "public, max-age=31536000, immutable"

# index.html changes on every deploy -> always revalidate
aws s3 cp dist/index.html s3://my-app-web/index.html --cache-control "no-cache"

# Only needed if you change non-hashed files
aws cloudfront create-invalidation --distribution-id E1ABCDEF2GHIJ --paths "/index.html"`,
        },
        {
          title: 'Express: set Cache-Control for API responses',
          lang: 'javascript',
          code: `// Public product list: CDN may cache for 60s, serve stale while refreshing
app.get('/api/products', async (req, res) => {
  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.json(await getProducts());
});

// Per-user data must never be cached by a shared CDN
app.get('/api/me', auth, (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  res.json(req.user);
});`,
        },
      ],
      output: `JS and CSS files with hashes in their names are cached for a year, so returning users download nothing. \`index.html\` is revalidated every time, so a new deploy shows up immediately and points to the new hashed files. The invalidation clears the old \`index.html\` from all edges.

For the API, \`s-maxage=60\` lets the CDN (a shared cache) keep the product list for 60 seconds, while \`private, no-store\` makes sure one user's profile is never cached and shown to another user.`,
      questions: [
        {
          q: 'What is a cache hit vs a cache miss?',
          a: 'A hit means the edge already has the content and returns it directly. A miss means the edge fetches it from the origin first, stores it, then returns it.',
        },
        {
          q: 'How do you make sure users get the new version after a deploy?',
          a: 'Use content-hashed file names for assets with long TTLs and serve `index.html` with `no-cache` (or a short TTL). Invalidate only what is not hashed.',
        },
        {
          q: 'How do you keep the S3 bucket private behind CloudFront?',
          a: 'Use Origin Access Control: the bucket policy only allows the CloudFront distribution to read objects, and public access stays blocked.',
        },
        {
          q: 'What is the difference between max-age and s-maxage?',
          a: '`max-age` applies to all caches including the browser. `s-maxage` applies only to shared caches like CDNs and overrides `max-age` there.',
        },
      ],
      spoken: `"A CDN like CloudFront caches content at edge locations close to users. On a hit the edge answers immediately; on a miss it fetches from the origin, like S3 or my API, and stores it for the TTL. For a React app I host the build in a private S3 bucket with Origin Access Control, cache hashed assets for a year, and serve index.html with no-cache so deploys show up instantly. For APIs I use s-maxage for public data and private, no-store for anything user-specific, so we never leak one user's data to another."`,
      mistakes: [
        'Caching personalized responses at the CDN. If the cache key ignores the auth header, user A can see user B\'s data.',
        'Running a full `/*` invalidation on every deploy instead of using hashed file names.',
        'Forgetting SPA routing: deep links like `/orders/42` return 403/404 from S3. Map those errors to `/index.html` with a 200, or use a CloudFront Function.',
        'Follow-up trap: "Your CDN hit rate is low — why?" Usually too much in the cache key (all cookies, all headers, random query strings) or very short TTLs.',
      ],
      takeaway: 'Cache static assets hard with hashed names, keep HTML fresh, and never cache per-user data in a shared CDN.',
    },
    {
      id: 'dns-route53-https',
      title: 'DNS, Route 53 and HTTPS Certificates',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'DNS turns a domain name into an address. Route 53 is AWS DNS; ACM gives free TLS certificates for HTTPS on AWS load balancers and CloudFront.',
      what: `**DNS** (Domain Name System) is the internet's phone book. It turns \`api.shop.com\` into an IP address the browser can connect to.

Common **record types**:
- **A** — name to IPv4 address. **AAAA** — name to IPv6 address.
- **CNAME** — name to another name (\`www.shop.com\` → \`shop.netlify.app\`).
- **MX** — mail servers. **TXT** — text, often used to prove you own a domain.

**Route 53** is AWS's DNS service. **ACM** (AWS Certificate Manager) gives free **TLS certificates** — the thing that makes \`https://\` work.

#### Deeper version
- **TTL** on a DNS record says how long resolvers may cache it. Lower it (e.g. 60s) before a migration so changes spread fast.
- A CNAME cannot sit at the zone apex (\`shop.com\` itself). Route 53 **Alias** records solve this and can point the apex to CloudFront, a load balancer or S3.
- Route 53 **routing policies:** simple, weighted (send 10% to a new stack — useful for canaries), latency-based, failover (with health checks), geolocation.
- **TLS termination** usually happens at CloudFront or the load balancer. ACM certificates renew automatically. For CloudFront, the certificate must be created in **us-east-1**.
- HTTPS gives encryption, integrity and identity (the certificate proves the server is really \`shop.com\`).`,
      why: `Users type names, not IPs, and IPs change when you redeploy or scale. DNS lets you move infrastructure without telling users. HTTPS is required for security, SEO, cookies with the \`Secure\` flag, HTTP/2, and many browser APIs.`,
      analogy: `DNS is your phone's contact list: you tap "Mom" and the phone dials the number. If Mom changes her number, you update the contact once — you never memorize digits. The TLS certificate is like an ID card the server shows to prove it really is "Mom".`,
      code: [
        {
          title: 'Inspect DNS and certificates from the terminal',
          lang: 'bash',
          code: `# What does the name resolve to?
dig +short api.shop.com            # 13.234.10.20
dig +short www.shop.com CNAME      # d111111abcdef8.cloudfront.net.

# Check the TLS certificate the server presents
openssl s_client -connect api.shop.com:443 -servername api.shop.com < /dev/null 2>/dev/null | openssl x509 -noout -subject -dates

# Request a free certificate in ACM (validated by a DNS record)
aws acm request-certificate --domain-name shop.com --subject-alternative-names "*.shop.com" --validation-method DNS --region us-east-1`,
        },
      ],
      output: `\`dig\` shows that \`api.shop.com\` points to an IP, while \`www\` is a CNAME to a CloudFront domain. The \`openssl\` command prints who the certificate is for and its valid-from and valid-until dates — handy when debugging "certificate expired" errors. The ACM request creates a certificate for \`shop.com\` and all subdomains; ACM gives you a CNAME record to add in Route 53, and once it sees that record the certificate is issued and later renewed automatically.`,
      questions: [
        {
          q: 'What is the difference between an A record and a CNAME?',
          a: 'An A record maps a name to an IP address. A CNAME maps a name to another name, which is then resolved. A CNAME cannot be used at the root domain; Route 53 Alias records fill that gap.',
        },
        {
          q: 'Why lower the DNS TTL before a migration?',
          a: 'Resolvers cache records for the TTL. A low TTL means the switch to the new address reaches users in seconds instead of hours.',
        },
        {
          q: 'Where is TLS usually terminated in AWS?',
          a: 'At CloudFront or the Application Load Balancer, using an ACM certificate. Traffic behind it can be plain HTTP inside the VPC or re-encrypted if compliance needs it.',
        },
      ],
      spoken: `"DNS maps names to addresses: A records to IPs, CNAMEs to other names, and in Route 53 I use Alias records to point the root domain at CloudFront or a load balancer. TTL controls caching, so I lower it before migrations. For HTTPS I use ACM — free certificates that renew automatically — and terminate TLS at CloudFront or the ALB. One gotcha I remember is that CloudFront certificates must be in us-east-1. Route 53 also has weighted and failover routing, which I can use for canary releases and disaster recovery."`,
      mistakes: [
        'Trying to put a CNAME on the root domain. Use an Alias record (Route 53) or your DNS provider\'s ALIAS/ANAME feature.',
        'Creating the ACM certificate for CloudFront in your app region instead of us-east-1.',
        'Changing DNS during a migration with a 24-hour TTL and wondering why half the users still hit the old server.',
        'Follow-up trap: "What happens when you type a URL in the browser?" Cached DNS lookup, then resolver lookup, TCP connect, TLS handshake (certificate check), HTTP request, response, render.',
      ],
      takeaway: 'DNS maps names to addresses, TTL controls how fast changes spread, and ACM + CloudFront/ALB give you managed HTTPS.',
    },
    {
      id: 'docker-basics',
      title: 'Docker: Image vs Container and the Dockerfile',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'An image is a read-only package of your app and its environment; a container is a running instance of that image. A Dockerfile is the recipe.',
      what: `**Docker** packages your app with everything it needs (Node version, OS libraries, code, dependencies) so it runs the same on your laptop, CI and production.

- **Image:** a read-only template — a snapshot of the app and its environment. Built once, stored in a **registry** (Docker Hub, AWS ECR, GCP Artifact Registry).
- **Container:** a running instance of an image. You can start many containers from one image. Each has its own process, filesystem layer and network.
- **Dockerfile:** a text file with step-by-step instructions to build the image.

#### Deeper version
- A container is **not** a virtual machine. It shares the host's Linux kernel and is isolated with **namespaces** (what it can see) and **cgroups** (how much CPU/RAM it can use). That is why it starts in milliseconds and is much lighter than a VM.
- An image is made of **layers**. Each instruction (\`RUN\`, \`COPY\`) adds a layer. Layers are cached and shared between images.
- A container adds a thin **writable layer** on top. When the container is removed, that layer is gone — so data must live in volumes or external storage.
- \`CMD\` sets the default command; \`ENTRYPOINT\` sets a fixed executable. \`EXPOSE\` only documents a port; you still publish it with \`-p\`.`,
      why: `"It works on my machine" bugs come from different Node versions, OS libraries and env setups. Docker makes the environment part of the artifact. The same image moves from CI to staging to prod, and platforms like ECS, Kubernetes and Cloud Run all run containers.`,
      analogy: `An image is a recipe printed in a cookbook plus all ingredients frozen in a box. A container is the actual meal cooked from it. You can cook ten meals from the same box (ten containers), and if you throw a meal away, the box is unchanged.`,
      code: [
        {
          title: 'A simple Dockerfile for a Node/Express API',
          lang: 'dockerfile',
          code: `# 1. Start from an official, small Node image
FROM node:20-alpine

# 2. All next commands run inside /app
WORKDIR /app

# 3. Copy only package files first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# 4. Copy the rest of the source code
COPY . .

# 5. Run as the non-root "node" user that the image provides
USER node
ENV NODE_ENV=production
EXPOSE 3000

# 6. Default command when a container starts
CMD ["node", "server.js"]`,
        },
        {
          title: 'Build, run and inspect',
          lang: 'bash',
          code: `docker build -t orders-api:1.0 .            # build an image from the Dockerfile
docker images                                # list images
docker run -d --name api -p 8080:3000 -e DB_URL=mongodb://host.docker.internal:27017/shop orders-api:1.0
docker ps                                    # list running containers
docker logs -f api                           # follow logs
docker exec -it api sh                       # open a shell inside the container
docker stop api && docker rm api             # stop and delete the container (image stays)`,
        },
      ],
      output: `\`docker build\` runs each Dockerfile step and produces the image \`orders-api:1.0\`. \`docker run -d\` starts a container in the background; \`-p 8080:3000\` maps port 8080 on your machine to port 3000 inside the container, so \`http://localhost:8080\` reaches the app. \`-e\` passes an environment variable. \`docker ps\` shows it running, and \`docker logs -f\` streams what the app prints to stdout. Removing the container does not remove the image — you can start a fresh container from it any time.`,
      questions: [
        {
          q: 'What is the difference between an image and a container?',
          a: 'An image is a read-only, layered template. A container is a running instance of an image with its own writable layer. One image can run as many containers.',
        },
        {
          q: 'How is a container different from a VM?',
          a: 'A VM virtualizes hardware and runs a full guest OS. A container shares the host kernel and isolates processes with namespaces and cgroups, so it is smaller and starts much faster.',
        },
        {
          q: 'What is the difference between CMD and ENTRYPOINT?',
          a: '`ENTRYPOINT` is the fixed program to run; `CMD` provides default arguments (or the default command if there is no ENTRYPOINT). Arguments to `docker run` replace `CMD` but not `ENTRYPOINT`.',
        },
        {
          q: 'What does EXPOSE do?',
          a: 'It only documents which port the app listens on. To reach it from the host you must publish it with `-p host:container`.',
        },
      ],
      spoken: `"Docker packages my app and its whole environment so it runs the same everywhere. An image is the read-only, layered template built from a Dockerfile; a container is a running instance of it with its own writable layer, and I can run many containers from one image. Unlike a VM, a container shares the host kernel, so it's light and starts fast. My Node Dockerfiles use a small base like node alpine, copy package files first for caching, run npm ci, copy the code, switch to a non-root user, and start with CMD node server.js."`,
      mistakes: [
        'Saving uploads or data inside the container filesystem. It disappears when the container is removed; use volumes, S3 or a database.',
        'Using `localhost` inside a container to reach a database on the host or in another container. Inside a container, localhost is the container itself; use the service name or `host.docker.internal`.',
        'Running as root and using the `latest` tag in production. Pin versions and use a non-root user.',
        'Follow-up trap: "Why use `npm ci` instead of `npm install` in Docker?" `npm ci` installs exactly what is in the lockfile, fails if it is out of sync, and is faster and reproducible.',
      ],
      takeaway: 'Image = the frozen package, container = a running copy; build once, run the same image everywhere.',
    },
    {
      id: 'environment-management',
      title: 'Environment Management: dev, staging, prod and Config',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Keep one codebase and one build, and change behavior per environment only through config (env variables and secrets).',
      what: `An **environment** is a separate copy of your system for a purpose:
- **dev** — for developers, often local or shared, can break.
- **staging** — a copy of production for final testing. Same setup, fake or masked data.
- **prod** (production) — real users and real money.

**Config** is everything that changes between environments: database URLs, API keys, feature flags, log level. The rule: **code stays the same, config changes**. Config usually comes from **environment variables**.

#### Deeper version
- **Build once, deploy many:** the same Docker image (or build artifact) is promoted from staging to prod. Only the config differs. Rebuilding per environment can sneak in differences.
- Validate config at startup (with \`zod\` or similar) and **fail fast** if something is missing.
- **Secrets** (passwords, Stripe keys) go in a secrets manager, not in \`.env\` files in Git.
- **Frontend gotcha:** in React/Vite/Next.js, \`VITE_*\` or \`NEXT_PUBLIC_*\` variables are baked into the JS at **build** time and are visible to everyone. Never put secrets there.
- Use separate cloud accounts or projects per environment (AWS Organizations / GCP projects) so a mistake in dev cannot touch prod.
- Keep staging close to prod (same infra code, smaller sizes) — this is **dev/prod parity**.`,
      why: `Testing on production breaks things for real users. Hard-coding URLs and keys means editing code to deploy, and leaks secrets. Clean environment separation lets you test safely, deploy the exact same artifact, and rotate secrets without code changes.`,
      analogy: `Think of a theater. **dev** is the practice room, **staging** is the dress rehearsal on the real stage with the real lights, and **prod** is opening night. The script (code) is the same every time — only the audience and the props (config) change.`,
      code: [
        {
          title: 'Validate config once at startup (Node + zod)',
          lang: 'javascript',
          code: `// config.js
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().default(3000),
  MONGO_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid config:', parsed.error.flatten().fieldErrors);
  process.exit(1); // fail fast instead of crashing later at 2 a.m.
}

export const config = parsed.data;`,
        },
        {
          title: 'Same image, different config per environment',
          lang: 'bash',
          code: `# Build ONCE, tag with the git commit
docker build -t orders-api:3f9a1c2 .

# Staging
docker run -d --env-file staging.env orders-api:3f9a1c2

# Production: same image, different values (secrets injected by the platform)
docker run -d -e NODE_ENV=production -e LOG_LEVEL=warn -e MONGO_URL="$PROD_MONGO_URL" -e STRIPE_SECRET_KEY="$STRIPE_KEY" orders-api:3f9a1c2`,
        },
      ],
      output: `At startup, \`config.js\` checks every variable. If \`MONGO_URL\` is missing or \`STRIPE_SECRET_KEY\` does not start with \`sk_\`, the app prints exactly which fields are wrong and exits — the deploy fails at once instead of breaking later. \`z.coerce.number()\` turns the string \`"3000"\` into a number.

In the bash example the image \`orders-api:3f9a1c2\` is built one time. Staging and production run the very same bytes; only the environment variables are different.`,
      questions: [
        {
          q: 'How do you manage config across environments?',
          a: 'Code reads config from environment variables, validated at startup. Non-secret values live in the deploy config per environment; secrets come from a secrets manager. The same build artifact is promoted through environments.',
        },
        {
          q: 'Why build once and promote, instead of building for each environment?',
          a: 'Rebuilding can pick up different dependencies or code. Promoting the same image guarantees that what you tested in staging is exactly what runs in prod.',
        },
        {
          q: 'Can you put an API secret in a NEXT_PUBLIC_ or VITE_ variable?',
          a: 'No. Those are inlined into the browser bundle at build time and anyone can read them. Keep secrets on the server.',
        },
        {
          q: 'What makes a good staging environment?',
          a: 'Same infrastructure code and versions as prod, smaller sizes, realistic but non-sensitive data, and the same deploy pipeline.',
        },
      ],
      spoken: `"I keep one codebase and one build artifact, and change behavior only through config. Usually I have dev, staging and prod, ideally in separate cloud accounts. The app reads environment variables and validates them at startup with zod, so a missing value fails the deploy immediately. Secrets like Stripe keys come from Secrets Manager, never from Git. I build the Docker image once, tag it with the commit SHA, test it in staging, then promote the same image to prod. On the frontend I remember that public env variables are baked into the bundle, so no secrets there."`,
      mistakes: [
        'Committing `.env` files with real secrets to Git. Add them to `.gitignore` and use a secrets manager.',
        'Sprinkling `if (process.env.NODE_ENV === "production")` all over the code instead of using config values and feature flags.',
        'Having a staging that is very different from prod (different DB version, no CDN), so it does not catch real problems.',
        'Follow-up trap: "Why does changing an env variable not change my deployed React app?" Frontend env vars are inlined at build time; you must rebuild, or load runtime config from an endpoint.',
      ],
      takeaway: 'Build once, promote the same artifact, and let validated env config and a secrets manager handle the differences.',
    },
    {
      id: 'lambda-basics-layers',
      title: 'AWS Lambda Basics and Layers',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Lambda runs your function when an event happens, scales automatically, and bills per millisecond. Layers share code and libraries between functions.',
      what: `**AWS Lambda** runs a function when an **event** happens — an HTTP request, a file upload to S3, a message in a queue, a schedule. You upload code; AWS runs it, scales it, and you pay only while it runs.

A Lambda has:
- A **handler** — the function AWS calls with \`(event, context)\`.
- **Memory** (128 MB to 10 GB). CPU grows with memory.
- A **timeout** — maximum 15 minutes.
- An **execution role** — the IAM role that gives it permissions.

A **layer** is a zip of shared code or libraries (like \`sharp\` or your own utils) that many functions can use.

#### Deeper version
- Each request runs in an **execution environment** (a small micro-VM). After a request, AWS keeps it **warm** for a while and reuses it. Code **outside** the handler (DB clients, SDK clients) runs once per environment, so put expensive setup there.
- One environment handles **one request at a time**. More concurrent requests = more environments.
- **Layers:** up to 5 per function. The function plus all layers must fit the unzipped size limit (250 MB). For Node, files go under \`nodejs/node_modules\` inside the layer zip. Layers are versioned and immutable.
- For bigger needs, deploy Lambda as a **container image** (up to 10 GB).
- Invocation types: **synchronous** (API Gateway waits for the answer), **asynchronous** (S3, SNS — Lambda retries on failure), and **poll-based** (SQS, Kinesis — Lambda reads batches).
- \`/tmp\` gives scratch disk space (512 MB by default, configurable up to 10 GB).`,
      why: `No servers to patch, automatic scaling from zero to thousands of requests, and no cost when idle. It is perfect for webhooks (Stripe), image processing, cron jobs, queue workers and spiky APIs.`,
      analogy: `Lambda is like hiring a chef per order instead of employing a full kitchen staff. When an order arrives, a chef appears, cooks, and leaves. If 100 orders come at once, 100 chefs appear. A chef who just finished may stay a few minutes in case another order comes (warm start). A layer is the shared spice rack every chef can use.`,
      code: [
        {
          title: 'Node.js Lambda handler with setup outside the handler',
          lang: 'javascript',
          code: `// index.mjs
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

// Runs ONCE per execution environment (cold start), reused on warm calls
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event, context) => {
  // API Gateway HTTP API (payload v2) event
  const id = event.pathParameters?.id;
  if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'id required' }) };

  const { Item } = await db.send(new GetCommand({ TableName: process.env.TABLE, Key: { pk: id } }));
  console.log(JSON.stringify({ requestId: context.awsRequestId, id, found: !!Item }));

  return {
    statusCode: Item ? 200 : 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Item ?? { error: 'Not found' }),
  };
};`,
        },
        {
          title: 'Build and attach a layer',
          lang: 'bash',
          code: `# A Node layer must have this folder structure: nodejs/node_modules/...
mkdir -p layer/nodejs && cd layer/nodejs
npm init -y && npm install dayjs
cd .. && zip -r dayjs-layer.zip nodejs

aws lambda publish-layer-version --layer-name dayjs --zip-file fileb://dayjs-layer.zip --compatible-runtimes nodejs20.x

# Attach version 1 of the layer to a function
aws lambda update-function-configuration --function-name get-order --layers arn:aws:lambda:ap-south-1:123456789012:layer:dayjs:1`,
        },
      ],
      output: `On the first request, AWS creates an environment, loads the code and creates the DynamoDB client (cold start). Then it calls \`handler\`. On later requests to the same warm environment, only \`handler\` runs, so it is faster. The function returns \`200\` with the item, \`404\` if missing, or \`400\` if no id. The log line goes to CloudWatch Logs with the request id.

The layer commands publish \`dayjs\` as layer version 1. After attaching it, \`import dayjs from 'dayjs'\` works in the function without bundling it, because Lambda puts the layer's \`nodejs/node_modules\` on the module path.`,
      questions: [
        {
          q: 'What are the main Lambda limits?',
          a: '15-minute timeout, 128 MB to 10 GB memory, 250 MB unzipped deployment size (zip, including layers) or 10 GB for container images, and request/response payload limits (6 MB for synchronous calls).',
        },
        {
          q: 'What are Lambda layers used for?',
          a: 'Sharing libraries, binaries or common code across many functions, keeping deployment packages small, and updating shared code in one place. A function can use up to 5 layers.',
        },
        {
          q: 'Why initialize clients outside the handler?',
          a: 'Code outside the handler runs once per execution environment and is reused on warm invocations. This avoids reconnecting to databases and recreating SDK clients on every request.',
        },
        {
          q: 'What happens when an async Lambda invocation fails?',
          a: 'Lambda retries it (twice by default) and can send the failed event to a dead-letter queue or an on-failure destination.',
        },
      ],
      spoken: `"Lambda runs my code in response to events — API requests, S3 uploads, SQS messages or schedules — and scales automatically, billing per millisecond. The handler receives the event and context. Each execution environment handles one request at a time and is reused while warm, so I create DB and SDK clients outside the handler. Memory also controls CPU, and the timeout maxes out at 15 minutes, so long jobs go elsewhere. I use layers to share libraries or common utils across functions — for Node they go under nodejs/node_modules — or I just bundle with esbuild, which is often simpler."`,
      mistakes: [
        'Creating a new DB connection inside the handler on every call, which is slow and can exhaust the database.',
        'Using layers for everything. Bundling with esbuild is often simpler; layers add versioning overhead and are not a dependency manager.',
        'Leaving the default 3-second timeout for a function that calls slow APIs, and getting random timeouts.',
        'Follow-up trap: "Can you store state between invocations?" Only as a cache in memory or `/tmp` of a warm environment — it may vanish any time and is not shared between environments. Real state goes to a database.',
      ],
      takeaway: 'Lambda = event in, function runs, pay per ms; set up clients outside the handler and keep functions small and focused.',
    },
    {
      id: 'api-gateway',
      title: 'API Gateway',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'API Gateway is the managed front door for your APIs: routing, auth, throttling, CORS, and integration with Lambda or other backends.',
      what: `**API Gateway** is a managed service that receives HTTP requests and forwards them to a backend — usually a Lambda function, but also HTTP services or other AWS services.

It gives you, without writing code:
- **Routing** (\`GET /orders/{id}\` → a Lambda).
- **Auth** (JWT authorizers, Cognito, IAM, or a custom Lambda authorizer).
- **Throttling** (rate limits) and **CORS**.
- **Stages** like \`dev\` and \`prod\`, and custom domains.

#### Deeper version
- Three flavors: **HTTP API** (newer, cheaper, faster, built-in JWT auth — good default), **REST API** (older, more features: API keys and usage plans, request validation, caching, WAF), and **WebSocket API** (two-way real-time).
- **Lambda proxy integration** passes the whole request to Lambda as the \`event\` and expects \`{ statusCode, headers, body }\` back.
- Hard limits to remember: the integration timeout (historically 29 seconds for REST APIs — check current docs, as AWS has made it raisable in some cases) and a 10 MB payload limit. Big files go through S3 presigned URLs.
- Throttling uses a **token bucket** (rate + burst). Clients over the limit get **429 Too Many Requests**.
- A **Lambda authorizer** runs your own auth code and returns allow/deny; results can be cached to save cost and latency.`,
      why: `Without it, you would need a server just to receive requests, check tokens, apply rate limits and route traffic. API Gateway does all that, scales automatically, and lets a pure serverless backend expose a clean HTTPS API.`,
      analogy: `API Gateway is the reception desk of a big office. Visitors (requests) arrive, the receptionist checks their ID (auth), stops people who keep coming too often (throttling), and sends each visitor to the right department (Lambda) based on what they ask for (the route).`,
      code: [
        {
          title: 'HTTP API + Lambda with JWT auth (AWS SAM template)',
          lang: 'yaml',
          code: `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  OrdersApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowOrigins: ['https://shop.com']
        AllowMethods: [GET, POST]
        AllowHeaders: [Authorization, Content-Type]
      Auth:
        DefaultAuthorizer: JwtAuth
        Authorizers:
          JwtAuth:
            IdentitySource: $request.header.Authorization
            JwtConfiguration:
              issuer: https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_AbC123
              audience: [my-app-client-id]

  GetOrderFn:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: nodejs20.x
      Handler: index.handler
      CodeUri: src/
      Events:
        GetOrder:
          Type: HttpApi
          Properties:
            ApiId: !Ref OrdersApi
            Path: /orders/{id}
            Method: GET`,
        },
        {
          title: 'Reading the request inside the Lambda',
          lang: 'javascript',
          code: `export const handler = async (event) => {
  const id = event.pathParameters.id;                     // from /orders/{id}
  const userId = event.requestContext.authorizer.jwt.claims.sub; // verified by API Gateway
  const page = Number(event.queryStringParameters?.page ?? 1);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, userId, page }),
  };
};`,
        },
      ],
      output: `Deploying the template creates an HTTPS endpoint. A request \`GET /orders/42?page=2\` with a valid JWT reaches the Lambda; without a token, or with an expired one, API Gateway answers **401** and the Lambda never runs (you do not pay for it). CORS preflight requests from \`https://shop.com\` are answered automatically. Inside the function, the path param, query string and verified token claims are all on the \`event\` object, and the function returns \`{"id":"42","userId":"...","page":2}\`.`,
      questions: [
        {
          q: 'HTTP API vs REST API in API Gateway?',
          a: 'HTTP API is cheaper, faster and simpler, with built-in JWT auth — the default for most new Lambda APIs. REST API has more features like API keys and usage plans, request validation, response caching and direct WAF integration.',
        },
        {
          q: 'How do you secure an API Gateway endpoint?',
          a: 'JWT/Cognito authorizers, IAM auth for service-to-service calls, Lambda authorizers for custom logic, throttling, WAF rules, and least-privilege roles on the backend.',
        },
        {
          q: 'How do you handle a request that takes longer than the API Gateway timeout?',
          a: 'Make it asynchronous: return 202 with a job id, push the work to SQS or Step Functions, and let the client poll or receive a webhook/WebSocket update.',
        },
        {
          q: 'What does a 429 from API Gateway mean?',
          a: 'The client hit the throttling limit (rate or burst). Clients should retry with exponential backoff.',
        },
      ],
      spoken: `"API Gateway is the managed front door for my APIs. It handles routing, auth, throttling, CORS and custom domains, and forwards requests to Lambda or HTTP backends. For new Lambda APIs I usually pick the HTTP API flavor because it's cheaper and has built-in JWT auth; I use the REST API when I need usage plans, API keys or request validation. With proxy integration the whole request arrives as the event and I return statusCode, headers and body. For long jobs I return 202 and process asynchronously, because of the gateway timeout."`,
      mistakes: [
        'Returning a plain object instead of `{ statusCode, body }` with a string body from a proxy-integrated Lambda, which gives a 502 "Malformed Lambda proxy response".',
        'Forgetting CORS headers on error responses, so the browser shows a CORS error instead of the real error.',
        'Uploading large files through API Gateway instead of S3 presigned URLs.',
        'Follow-up trap: "You get a 502 from API Gateway — where do you look?" The Lambda logs in CloudWatch: an unhandled exception, a timeout, or a malformed response shape.',
      ],
      takeaway: 'API Gateway handles the HTTP plumbing — auth, limits, CORS, routing — so your Lambdas only contain business logic.',
    },
    {
      id: 'dynamodb-basics',
      title: 'DynamoDB Basics: Partition and Sort Keys',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'DynamoDB is a serverless key-value/document database. You design tables around your access patterns using a partition key and an optional sort key.',
      what: `**DynamoDB** is AWS's fully managed NoSQL database. It is very fast (single-digit milliseconds) at any scale, and there is no server or connection pool to manage.

Every table needs a **primary key**:
- **Partition key (PK):** decides which internal partition (storage node) holds the item. \`GetItem\` by PK is super fast.
- **Sort key (SK)** (optional): items with the same PK are stored together, sorted by SK. You can \`Query\` a PK and filter SK ranges (\`begins_with\`, \`between\`, \`>\`).

#### Deeper version
- **Query** uses keys and is efficient. **Scan** reads the whole table and is slow and expensive — avoid it in hot paths.
- **Design for access patterns first.** List your queries, then shape keys. **Single-table design** stores several entity types in one table with keys like \`PK=USER#42\`, \`SK=ORDER#2024-05-01\`.
- **GSI** (Global Secondary Index): another PK/SK pair for a different access pattern (e.g. orders by status). GSIs are eventually consistent. **LSI** shares the PK with a different SK and must be created with the table.
- **Hot partitions:** if most traffic hits one PK (e.g. \`status=PENDING\`), you hit throughput limits. Choose high-cardinality keys.
- **Capacity:** on-demand (pay per request) or provisioned (with auto scaling). Item size max is 400 KB.
- Reads are eventually consistent by default; you can ask for strongly consistent reads on the table (not on GSIs). Conditional writes and transactions exist for correctness.
- **DynamoDB Streams** emit item changes to Lambda for event-driven work. **TTL** auto-deletes expired items.`,
      why: `It never needs connection pooling, scales automatically, and pairs perfectly with Lambda. You trade flexible queries (no joins, limited filtering) for predictable speed at any size.`,
      analogy: `Think of a library with many shelves. The **partition key** is the shelf label ("User 42") — the librarian walks straight to that shelf. The **sort key** is the order of books on that shelf (by date), so "all of User 42's orders from May" is one quick sweep. A **Scan** is walking through every shelf in the library.`,
      code: [
        {
          title: 'One table, user and orders (single-table style)',
          lang: 'javascript',
          code: `import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TableName = 'Shop';

// Save an order: PK groups by user, SK sorts by date
await db.send(new PutCommand({
  TableName,
  Item: { PK: 'USER#42', SK: 'ORDER#2024-05-03#o-981', total: 1299, status: 'PAID' },
  ConditionExpression: 'attribute_not_exists(PK)', // do not overwrite an existing item
}));

// All orders of user 42 in May 2024, newest first
const { Items } = await db.send(new QueryCommand({
  TableName,
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
  ExpressionAttributeValues: { ':pk': 'USER#42', ':prefix': 'ORDER#2024-05' },
  ScanIndexForward: false, // descending by sort key
}));
console.log(Items.length, Items[0]?.SK);`,
        },
      ],
      output: `The \`PutCommand\` stores the order under the user's partition. The condition makes the write fail with \`ConditionalCheckFailedException\` if that exact key already exists, which prevents accidental overwrites.

The \`QueryCommand\` goes straight to partition \`USER#42\` and reads only sort keys starting with \`ORDER#2024-05\`, newest first because \`ScanIndexForward: false\`. It prints the count and the newest order's key, e.g. \`1 ORDER#2024-05-03#o-981\`. No table scan happens, so it stays fast even with billions of items.`,
      questions: [
        {
          q: 'What is the difference between a partition key and a sort key?',
          a: 'The partition key decides where an item is stored and must be given exactly in a Query. The sort key orders items within a partition and allows range conditions like `begins_with` or `between`.',
        },
        {
          q: 'Query vs Scan?',
          a: 'Query reads items of one partition key, optionally with a sort key condition — efficient. Scan reads every item in the table and then filters — slow and costly at scale.',
        },
        {
          q: 'What is a GSI and when do you need one?',
          a: 'A Global Secondary Index is an alternate key for a different access pattern, like finding orders by status or by email. It is updated asynchronously, so reads on it are eventually consistent.',
        },
        {
          q: 'What is a hot partition?',
          a: 'When a large share of traffic goes to one partition key value, it can be throttled. Fix it with higher-cardinality keys or write sharding (adding a suffix like `#1..#10`).',
        },
      ],
      spoken: `"DynamoDB is a serverless NoSQL database with consistent millisecond latency. Each item is found by its primary key: the partition key decides where the item lives, and the optional sort key orders items inside that partition, so I can query ranges like all orders for a user in a month. I design keys from access patterns first, often with single-table design, and add GSIs for other patterns. I avoid scans in hot paths and watch for hot partitions by choosing high-cardinality keys. It pairs well with Lambda because there's no connection pooling."`,
      mistakes: [
        'Designing tables like SQL tables first and discovering later that your queries need scans.',
        'Using `FilterExpression` and thinking it reduces cost. Filters run after the read, so you still pay for all items read.',
        'Choosing a low-cardinality partition key like `status` or `country` and creating hot partitions.',
        'Follow-up trap: "Can you do joins in DynamoDB?" No. You pre-join by storing related items under the same partition key (single-table design) or denormalize data.',
      ],
      takeaway: 'In DynamoDB you design keys for your queries: partition key to find the group, sort key to slice it — and avoid scans.',
    },
    {
      id: 'sqs-sns-eventbridge',
      title: 'SQS vs SNS vs EventBridge (and Fan-out)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'SQS is a queue (one consumer group pulls work), SNS is pub/sub (push to many), EventBridge is an event bus with content-based routing rules.',
      what: `All three move messages between parts of your system so they do not call each other directly (**decoupling**).

- **SQS** (Simple Queue Service): a **queue**. Producers put messages in; workers **pull** them out and process them. Each message is handled by **one** consumer. Great for background jobs.
- **SNS** (Simple Notification Service): **pub/sub**. You publish to a **topic** and SNS **pushes** a copy to every subscriber (SQS queues, Lambdas, HTTP endpoints, email, SMS).
- **EventBridge**: an **event bus**. Services send events; **rules** match events by their content (e.g. \`detail-type = "OrderPlaced"\` and \`amount > 1000\`) and route them to targets. It also receives events from AWS services and SaaS partners, and has a scheduler.

**Fan-out** means one event goes to many consumers. The classic pattern is **SNS → many SQS queues**: each service gets its own queue, so each can process at its own pace and retry on its own.

#### Deeper version
- **SQS Standard:** almost unlimited throughput, **at-least-once** delivery, best-effort ordering. **SQS FIFO:** strict order per **message group**, deduplication, lower throughput.
- **Visibility timeout:** when a worker receives a message, it is hidden for N seconds. If not deleted in time, it reappears and another worker gets it. Set it longer than your processing time (for Lambda, AWS recommends at least 6x the function timeout).
- **DLQ** (dead-letter queue): after \`maxReceiveCount\` failures, the message moves to a DLQ so a "poison" message does not block or loop forever.
- Because delivery is at-least-once, consumers must be **idempotent** (processing twice has the same effect as once), e.g. store processed message ids.
- **When to use which:** one job, one worker group, buffer load → SQS. Same message to several services, simple → SNS + SQS. Many event types, filtering by content, cross-account, SaaS or schedules → EventBridge. SNS also supports message filtering, but EventBridge rules are richer.`,
      why: `If your order API directly calls the email service, the inventory service and analytics, one slow or failing service breaks checkout. With messaging, the API publishes "OrderPlaced" and returns fast. Each service handles it independently, failures are retried, and traffic spikes are buffered in the queue instead of crashing workers.`,
      analogy: `**SQS** is a ticket queue at a deli: each ticket is served by one clerk, and tickets wait if all clerks are busy. **SNS** is a group WhatsApp message: everyone in the group gets a copy instantly. **EventBridge** is a smart mail room: it reads each letter and sends it only to the departments whose rules match ("all invoices over 1,000 go to Finance").`,
      code: [
        {
          title: 'Producer: send a job to SQS and publish an event to EventBridge',
          lang: 'javascript',
          code: `import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const sqs = new SQSClient({});
const eb = new EventBridgeClient({});

export async function onOrderPlaced(order) {
  // 1. A job for exactly one worker: generate the invoice PDF
  await sqs.send(new SendMessageCommand({
    QueueUrl: process.env.INVOICE_QUEUE_URL,
    MessageBody: JSON.stringify({ orderId: order.id }),
  }));

  // 2. A business event; any number of rules can react to it
  await eb.send(new PutEventsCommand({
    Entries: [{
      EventBusName: 'shop-bus',
      Source: 'shop.orders',
      DetailType: 'OrderPlaced',
      Detail: JSON.stringify({ orderId: order.id, amount: order.total }),
    }],
  }));
}`,
        },
        {
          title: 'Consumer: SQS-triggered Lambda with partial batch failures',
          lang: 'javascript',
          code: `// Requires "ReportBatchItemFailures" enabled on the event source mapping
export const handler = async (event) => {
  const batchItemFailures = [];

  for (const record of event.Records) {
    try {
      const { orderId } = JSON.parse(record.body);
      // Idempotent: skip if this order's invoice already exists
      await createInvoiceIfMissing(orderId);
    } catch (err) {
      console.error('Failed', record.messageId, err);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }
  // Only failed messages go back to the queue; the rest are deleted
  return { batchItemFailures };
};`,
        },
      ],
      output: `When an order is placed, one message lands in the invoice queue and one event goes to the \`shop-bus\`. The invoice Lambda receives messages in batches. Successful ones are deleted; failed ones are listed in \`batchItemFailures\` and become visible again after the visibility timeout, to be retried. After too many failures they move to the DLQ.

Meanwhile EventBridge rules can send the same \`OrderPlaced\` event to an email Lambda, an analytics queue, and — only when \`amount > 1000\` — a fraud-check function. The order API does not know or care how many consumers exist.`,
      questions: [
        {
          q: 'When would you use SQS vs SNS vs EventBridge?',
          a: 'SQS for work queues where one consumer handles each message and you want buffering and retries. SNS to push the same message to many subscribers quickly. EventBridge for event-driven architectures with content-based routing, many event types, AWS/SaaS events and schedules.',
        },
        {
          q: 'What is the fan-out pattern?',
          a: 'One message is delivered to many independent consumers. Commonly SNS topic → several SQS queues (or EventBridge → several targets), so each service processes and retries independently.',
        },
        {
          q: 'What is a visibility timeout?',
          a: 'The time a received SQS message stays hidden from other consumers. If the consumer does not delete it before the timeout, it becomes visible again and is redelivered.',
        },
        {
          q: 'Why must SQS consumers be idempotent?',
          a: 'Standard queues deliver at least once, so a message can arrive twice (e.g. after a timeout or retry). Processing it twice must not double-charge or double-send.',
        },
        {
          q: 'Standard vs FIFO queue?',
          a: 'Standard: very high throughput, at-least-once, best-effort order. FIFO: exactly-once processing within a dedup window and strict ordering per message group, with lower throughput.',
        },
      ],
      spoken: `"All three decouple services. SQS is a queue: producers push, consumers pull, and each message is processed by one consumer — perfect for background jobs and smoothing spikes. SNS is pub/sub: one publish pushes copies to many subscribers. EventBridge is an event bus where rules route events by content and it also handles AWS events and schedules. For fan-out I'd use SNS or EventBridge feeding a separate SQS queue per service, so each one retries independently. I always add a DLQ, set the visibility timeout above processing time, and make consumers idempotent because delivery is at least once."`,
      mistakes: [
        'Visibility timeout shorter than processing time, so the same message is processed twice by two workers.',
        'No dead-letter queue, so one bad message is retried forever and costs money.',
        'Assuming exactly-once delivery with Standard SQS and charging a customer twice.',
        'Follow-up trap: "In an SQS-Lambda batch of 10, one message fails — what happens?" Without partial batch responses, the whole batch is retried, including the 9 that succeeded. Enable `ReportBatchItemFailures` and return only the failed ids.',
      ],
      takeaway: 'Queue for work (SQS), broadcast for copies (SNS), bus for routing by content (EventBridge) — and always DLQ + idempotency.',
    },
    {
      id: 'cloudwatch',
      title: 'CloudWatch: Logs, Metrics and Alarms',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'CloudWatch collects logs and metrics from AWS services and your apps, and fires alarms when something crosses a threshold.',
      what: `**CloudWatch** is AWS's built-in monitoring service. It has three main parts:

- **Logs:** text your app prints (\`console.log\`) is collected in **log groups** (one per Lambda, for example) and **log streams**.
- **Metrics:** numbers over time — CPU %, Lambda errors, API latency, queue length. AWS services publish many metrics automatically.
- **Alarms:** watch a metric and act when it crosses a threshold — send an SNS notification (Slack, email, PagerDuty) or trigger auto scaling.

#### Deeper version
- **Logs Insights** lets you query logs with a SQL-like language. It works best with **structured JSON logs**.
- **Custom metrics:** publish your own numbers (orders per minute). The cheapest way from Lambda is the **Embedded Metric Format (EMF)** — a special JSON log line that CloudWatch turns into a metric without an API call.
- **Metric filters** turn log patterns (like \`"level":"error"\`) into metrics you can alarm on.
- Alarm on **percentiles** (p95/p99 latency), not just averages — averages hide slow requests.
- Set **log retention** (the default is "never expire", which keeps costing money).
- **X-Ray** (or OpenTelemetry) adds distributed **tracing** — following one request across API Gateway, Lambda and DynamoDB.
- Important Lambda metrics: \`Errors\`, \`Throttles\`, \`Duration\`, \`ConcurrentExecutions\`, and for SQS sources \`ApproximateAgeOfOldestMessage\`.`,
      why: `You cannot fix what you cannot see. When checkout fails at midnight, logs tell you what happened, metrics tell you how bad and since when, and alarms wake you up before customers complain.`,
      analogy: `CloudWatch is the dashboard and black box of a car. **Metrics** are the gauges (speed, fuel, temperature). **Logs** are the trip recorder that writes down every event. **Alarms** are the warning lights that turn red when the engine is too hot.`,
      code: [
        {
          title: 'Structured logs + a custom metric with EMF from Lambda',
          lang: 'javascript',
          code: `export const handler = async (event) => {
  const start = Date.now();
  // ... process the checkout ...
  const amount = 1299;

  // Structured log line: easy to search in Logs Insights
  console.log(JSON.stringify({ level: 'info', msg: 'checkout complete', amount, path: event.rawPath }));

  // Embedded Metric Format: CloudWatch extracts "CheckoutLatency" as a metric
  console.log(JSON.stringify({
    _aws: {
      Timestamp: Date.now(),
      CloudWatchMetrics: [{
        Namespace: 'Shop',
        Dimensions: [['Service']],
        Metrics: [{ Name: 'CheckoutLatency', Unit: 'Milliseconds' }],
      }],
    },
    Service: 'checkout',
    CheckoutLatency: Date.now() - start,
  }));

  return { statusCode: 200, body: 'ok' };
};`,
        },
        {
          title: 'Logs Insights query and an alarm',
          lang: 'bash',
          code: `# Logs Insights query (paste in the console) - top errors in the last hour:
#   fields @timestamp, msg, path
#   | filter level = "error"
#   | stats count(*) as errors by msg
#   | sort errors desc

# Alarm: notify when the Lambda has 5+ errors in 5 minutes
aws cloudwatch put-metric-alarm --alarm-name checkout-errors --namespace AWS/Lambda --metric-name Errors --dimensions Name=FunctionName,Value=checkout --statistic Sum --period 300 --evaluation-periods 1 --threshold 5 --comparison-operator GreaterThanOrEqualToThreshold --alarm-actions arn:aws:sns:ap-south-1:123456789012:oncall

# Keep logs for 30 days instead of forever
aws logs put-retention-policy --log-group-name /aws/lambda/checkout --retention-in-days 30`,
        },
      ],
      output: `Every invocation writes a JSON log line you can filter by \`level\` or \`path\`, and a second EMF line that CloudWatch turns into the metric \`Shop/CheckoutLatency\` with dimension \`Service=checkout\` — you can graph its p95 and alarm on it. The Logs Insights query groups error messages and shows the most frequent first. The alarm sums Lambda errors every 5 minutes and, at 5 or more, publishes to the \`oncall\` SNS topic (which can forward to Slack or email). The retention policy deletes logs older than 30 days to control cost.`,
      questions: [
        {
          q: 'What is the difference between logs, metrics and traces?',
          a: 'Logs are detailed event records (what happened). Metrics are numeric time series (how much, how often). Traces follow one request across services (where the time went).',
        },
        {
          q: 'How do you get alerted when your Lambda starts failing?',
          a: 'Create a CloudWatch alarm on the `Errors` (or error rate) metric, and on `Throttles`, with an SNS action that notifies on-call via email, Slack or PagerDuty.',
        },
        {
          q: 'Why alarm on p99 instead of average latency?',
          a: 'Averages hide the slow tail. If 1% of users wait 8 seconds, the average may still look fine, but p99 shows the problem.',
        },
        {
          q: 'How do you create a custom metric cheaply from Lambda?',
          a: 'Use the Embedded Metric Format: print a JSON log line with the `_aws` metadata, and CloudWatch extracts the metric asynchronously with no extra API calls.',
        },
      ],
      spoken: `"CloudWatch is AWS's monitoring service with logs, metrics and alarms. My apps write structured JSON logs, which I query with Logs Insights. AWS services publish metrics automatically, like Lambda errors, throttles and duration, and I add custom business metrics using the Embedded Metric Format, which is just a special log line. I set alarms on error rates, p99 latency and queue age, and route them through SNS to Slack or PagerDuty. I also set log retention, because by default logs never expire, and use X-Ray or OpenTelemetry for tracing across services."`,
      mistakes: [
        'Leaving log retention at "never expire" and paying for years of debug logs.',
        'Logging plain strings instead of JSON, which makes searching and building metrics painful.',
        'Only alarming on averages and missing slow tails or partial outages.',
        'Follow-up trap: "Your alarm never fires even though the service is down — why?" With no requests there are no data points; set "treat missing data as breaching" for that alarm, or add a synthetic health check (CloudWatch Synthetics or Route 53 health checks).',
      ],
      takeaway: 'Log in JSON, measure what matters (errors, p99, queue age), alarm on it, and set retention.',
    },
    {
      id: 'vpc-basics',
      title: 'VPC Basics: Subnets, Security Groups and NAT',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A VPC is your private network in AWS. Public subnets face the internet; private subnets hold apps and databases and reach out through a NAT gateway.',
      what: `A **VPC** (Virtual Private Cloud) is your own private network inside AWS, with an IP range like \`10.0.0.0/16\`.

- **Subnet:** a slice of the VPC's IP range in **one** AZ.
  - **Public subnet:** its route table sends internet traffic to an **Internet Gateway (IGW)**. Load balancers and NAT gateways live here.
  - **Private subnet:** no direct route from the internet. App servers and databases live here.
- **Security group (SG):** a firewall attached to a resource (EC2, RDS, Lambda in a VPC). You list what traffic is **allowed in**.
- **NAT gateway:** lets resources in private subnets make **outgoing** calls to the internet (e.g. calling the Stripe API) while staying unreachable from outside.

#### Deeper version
- **Security groups are stateful:** if a request is allowed in, the response is allowed out automatically. They only have allow rules. You can reference another SG as the source: "allow port 5432 from the app's SG".
- **NACLs** (Network ACLs) are **stateless** subnet-level firewalls with allow and deny rules and numbered order. Most teams rely on SGs and leave NACLs default.
- **CIDR:** \`/16\` = 65,536 addresses, \`/24\` = 256. AWS reserves 5 addresses per subnet.
- A typical layout: per AZ, one public subnet (ALB, NAT) and one or two private subnets (apps, DB).
- NAT gateways cost money per hour plus per GB. **VPC endpoints** let private resources reach S3, DynamoDB and other AWS services without going through NAT — cheaper and more private.
- A **Lambda in a VPC** has no internet access unless its subnet routes to a NAT gateway.`,
      why: `You do not want your database reachable from the internet. A VPC lets you put only the load balancer in public, keep apps and data in private subnets, and control every allowed connection with security groups. This limits the blast radius if something is compromised.`,
      analogy: `A VPC is a gated housing society. **Public subnets** are the front lobby where visitors are allowed. **Private subnets** are the apartments — no visitor walks in directly. **Security groups** are the door locks on each apartment with a guest list. The **NAT gateway** is the society's delivery desk: residents can order things from outside, but outsiders cannot walk in through it.`,
      code: [
        {
          title: 'Security groups: only the ALB reaches the app, only the app reaches the DB',
          lang: 'bash',
          code: `# ALB: open to the world on 443
aws ec2 authorize-security-group-ingress --group-id sg-alb --protocol tcp --port 443 --cidr 0.0.0.0/0

# App: only accepts port 3000 from the ALB's security group
aws ec2 authorize-security-group-ingress --group-id sg-app --protocol tcp --port 3000 --source-group sg-alb

# Database: only accepts Postgres from the app's security group
aws ec2 authorize-security-group-ingress --group-id sg-db --protocol tcp --port 5432 --source-group sg-app`,
        },
        {
          title: 'Typical layout (two AZs)',
          lang: 'text',
          code: `VPC 10.0.0.0/16
├── AZ a
│   ├── public-a   10.0.1.0/24   -> ALB, NAT gateway      (route 0.0.0.0/0 -> IGW)
│   └── private-a  10.0.11.0/24  -> app servers, RDS      (route 0.0.0.0/0 -> NAT)
└── AZ b
    ├── public-b   10.0.2.0/24   -> ALB, NAT gateway
    └── private-b  10.0.12.0/24  -> app servers, RDS standby`,
        },
      ],
      output: `Traffic flows Internet → ALB (443) → app (3000) → database (5432). Each security group only trusts the group in front of it, so even if someone learns the database's private IP, they cannot connect from anywhere except the app servers. App servers in private subnets can still call Stripe because their route table sends internet-bound traffic to the NAT gateway, but nobody on the internet can start a connection to them. Using two AZs means one data center outage does not take down the ALB, apps or database.`,
      questions: [
        {
          q: 'What makes a subnet public or private?',
          a: 'Its route table. A public subnet has a route to an Internet Gateway. A private subnet does not; it may route outbound traffic to a NAT gateway.',
        },
        {
          q: 'Security group vs NACL?',
          a: 'Security groups attach to resources, are stateful and only allow. NACLs attach to subnets, are stateless, have allow and deny rules, and are evaluated in rule-number order.',
        },
        {
          q: 'Why does my Lambda in a VPC time out calling an external API?',
          a: 'Lambdas in a VPC do not get public IPs. The subnet needs a route to a NAT gateway (or use VPC endpoints for AWS services). Without it, outbound calls hang until timeout.',
        },
        {
          q: 'What is a NAT gateway for?',
          a: 'It lets resources in private subnets start outbound internet connections (updates, third-party APIs) while blocking inbound connections from the internet.',
        },
      ],
      spoken: `"A VPC is my private network in AWS. I split it into subnets per AZ: public subnets with a route to the internet gateway for the load balancer and NAT gateways, and private subnets for app servers and databases. Security groups are stateful firewalls on each resource; I chain them so the ALB accepts 443 from anywhere, the app only accepts traffic from the ALB's group, and the database only from the app's group. Private resources call out through NAT, and I use VPC endpoints for S3 and DynamoDB to save NAT costs."`,
      mistakes: [
        'Putting RDS in a public subnet "for easy access" from a laptop. Use a bastion, SSM or a VPN instead.',
        'Allowing database ports from `0.0.0.0/0` or from the whole VPC CIDR instead of from the app\'s security group.',
        'Putting Lambda in a VPC without a NAT and wondering why it cannot reach Stripe or OpenAI.',
        'Follow-up trap: "Why is our NAT gateway bill so high?" Large traffic to S3 or other AWS services going through NAT. Add gateway endpoints for S3/DynamoDB and check for chatty traffic.',
      ],
      takeaway: 'Public subnets for the front door, private subnets for everything else, security groups that trust only the layer in front.',
    },
    {
      id: 'secrets-manager-parameter-store',
      title: 'Secrets Manager vs Parameter Store',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Both store config securely. Secrets Manager adds automatic rotation and cross-account sharing for a price; Parameter Store is cheaper and great for config and simple secrets.',
      what: `Never put passwords or API keys in code or Git. AWS gives two places to store them:

- **Secrets Manager:** made for secrets like DB passwords and API keys. It encrypts them with KMS, supports **automatic rotation**, and charges per secret per month plus per API call.
- **SSM Parameter Store:** a key-value store for config (\`/shop/prod/LOG_LEVEL\`) and secrets (\`SecureString\`, encrypted with KMS). The standard tier is free, with no built-in rotation.

Your app reads them at startup (or the platform injects them as env variables), using an IAM role to get access.

#### Deeper version
- **Rotation:** Secrets Manager can run a rotation Lambda on a schedule. For RDS it has ready-made rotation that changes the password in the database and in the secret together. Apps must re-fetch the secret (or retry on auth failure) to pick up the new value.
- Parameter Store supports **hierarchies** (\`/shop/prod/*\`) and \`GetParametersByPath\`, which is handy for loading all config of one environment.
- Both are controlled by IAM: give the app's role \`secretsmanager:GetSecretValue\` on **only** its secret ARNs (and \`kms:Decrypt\` if you use a customer-managed key).
- **Cache** secrets in memory (the AWS Parameters and Secrets Lambda Extension or a simple TTL cache) to avoid latency and API costs on every request.
- ECS task definitions can inject secrets from either service as env variables at container start.
- **GCP equivalent:** Secret Manager. Kubernetes has Secrets (base64, not encrypted by default — enable encryption at rest or use an external secrets operator).`,
      why: `Secrets in \`.env\` files get committed, copied to laptops and leaked in screenshots. A central secret store gives encryption, access control, audit logs (who read what, via CloudTrail), and rotation without redeploying code.`,
      analogy: `Parameter Store is a labeled filing cabinet with a lock — cheap and good for most documents. Secrets Manager is a bank locker with a guard who also changes the lock combination every 30 days and tells the owners — more service, more cost.`,
      code: [
        {
          title: 'Load a secret once and cache it (Node, AWS SDK v3)',
          lang: 'javascript',
          code: `import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const sm = new SecretsManagerClient({});
const ssm = new SSMClient({});
let cached; // reused while the process / Lambda environment is warm
let cachedAt = 0;

export async function getConfig() {
  if (cached && Date.now() - cachedAt < 5 * 60 * 1000) return cached; // 5-min cache

  const secret = await sm.send(new GetSecretValueCommand({ SecretId: 'prod/shop/stripe' }));
  const logLevel = await ssm.send(new GetParameterCommand({ Name: '/shop/prod/LOG_LEVEL' }));

  cached = {
    stripeKey: JSON.parse(secret.SecretString).STRIPE_SECRET_KEY,
    logLevel: logLevel.Parameter.Value,
  };
  cachedAt = Date.now();
  return cached;
}`,
        },
        {
          title: 'Create them from the CLI',
          lang: 'bash',
          code: `aws secretsmanager create-secret --name prod/shop/stripe --secret-string '{"STRIPE_SECRET_KEY":"sk_live_xxx"}'

aws ssm put-parameter --name /shop/prod/LOG_LEVEL --type String --value warn
aws ssm put-parameter --name /shop/prod/OPENAI_API_KEY --type SecureString --value "sk-xxx"`,
        },
      ],
      output: `The first call to \`getConfig()\` fetches the Stripe key from Secrets Manager and the log level from Parameter Store, then caches both for 5 minutes. Later calls return the cached object instantly with no API call. After a rotation, the new value is picked up within 5 minutes. If the role lacks permission, the SDK throws \`AccessDeniedException\` — which is exactly what least privilege should do for other apps.`,
      questions: [
        {
          q: 'Secrets Manager or Parameter Store — which do you choose?',
          a: 'Secrets Manager for credentials that need automatic rotation (DB passwords) or cross-account sharing. Parameter Store for general config and simple secrets where low cost matters. Many teams use both.',
        },
        {
          q: 'How does your app get secrets in production?',
          a: 'Through its IAM role: either the platform injects them as env variables at start (ECS, Cloud Run, Kubernetes external secrets) or the app fetches and caches them with the SDK.',
        },
        {
          q: 'How do you handle secret rotation without downtime?',
          a: 'Use the rotation process that keeps the old value valid until the new one is set (Secrets Manager uses staging labels like AWSCURRENT and AWSPREVIOUS), cache with a short TTL, and on an auth error re-fetch the secret and retry once.',
        },
      ],
      spoken: `"I never keep secrets in code or Git. On AWS I use Secrets Manager for credentials that need rotation, like database passwords — it can rotate them automatically with a Lambda. For general config and simpler secrets I use Parameter Store, which is cheaper and supports SecureString and path hierarchies like /shop/prod. Access is controlled by IAM, so each service's role can read only its own secrets, and everything is audited in CloudTrail. In the app I fetch once and cache with a short TTL so I don't call the API on every request and still pick up rotations."`,
      mistakes: [
        'Fetching the secret on every request — slow, costly, and can hit API rate limits.',
        'Giving the app `secretsmanager:GetSecretValue` on `*`, so any compromised service can read every secret.',
        'Printing config objects with secrets to logs during debugging.',
        'Follow-up trap: "Are Kubernetes Secrets secure?" By default they are only base64-encoded in etcd. Enable encryption at rest, restrict RBAC, or use an external secrets operator linked to Secrets Manager.',
      ],
      takeaway: 'Secrets live in a managed store, are read through IAM roles, cached briefly, and rotated — never in Git.',
    },
    {
      id: 'load-balancing-autoscaling',
      title: 'Load Balancers and Auto Scaling',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'A load balancer spreads traffic across healthy servers; auto scaling adds or removes servers based on load. Together they give availability and elasticity.',
      what: `A **load balancer** sits in front of many copies of your app and spreads requests between them. It only sends traffic to **healthy** targets (it checks a health endpoint).

**Auto scaling** watches a metric (like CPU) and automatically adds servers when load goes up and removes them when it goes down.

On AWS:
- **ALB** (Application Load Balancer): works at **layer 7** (HTTP). Can route by path (\`/api/*\`) or host (\`admin.shop.com\`), supports WebSockets and HTTPS.
- **NLB** (Network Load Balancer): works at **layer 4** (TCP/UDP). Very fast, static IPs, for non-HTTP or extreme throughput.
- **Auto Scaling Group (ASG):** keeps a min/max/desired number of EC2 instances and replaces unhealthy ones.

#### Deeper version
- **Target tracking** scaling is the easiest: "keep average CPU at 50%" or "keep 1,000 requests per target". **Step scaling** and **scheduled scaling** (scale up every weekday at 9 a.m.) also exist.
- **Stateless apps** are required: if sessions live in server memory, users get logged out when they hit another server. Store sessions in Redis or use JWTs. **Sticky sessions** exist but hurt load spreading.
- **Connection draining** (deregistration delay) lets in-flight requests finish before a target is removed — your app should handle \`SIGTERM\` gracefully.
- **Algorithms:** round robin (default on ALB), least outstanding requests, and hash-based for NLB.
- Containers on ECS/Kubernetes scale the same way: services add tasks/pods; the cluster adds nodes.
- Scaling takes time (booting instances). Keep some headroom, or use warm pools / predictive scaling for known spikes.`,
      why: `One server is a single point of failure and has a capacity limit. A load balancer plus auto scaling gives high availability (a dead server is skipped and replaced) and elasticity (pay for 2 servers at night, 20 on sale day).`,
      analogy: `A load balancer is the person at a supermarket who points each customer to the shortest open checkout lane. Auto scaling is the manager who opens more lanes when the queue gets long and closes them when the store is quiet. A broken till is skipped (health check).`,
      code: [
        {
          title: 'Graceful shutdown so draining works (Express)',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();

app.get('/health', (req, res) => res.status(200).send('ok')); // used by the ALB
app.get('/api/products', (req, res) => res.json([{ id: 1, name: 'Shoes' }]));

const server = app.listen(3000, () => console.log('listening on 3000'));

// The platform sends SIGTERM before removing this instance/container
process.on('SIGTERM', () => {
  console.log('SIGTERM: stop accepting new connections, finish in-flight requests');
  server.close(() => {
    console.log('closed cleanly');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 25_000).unref(); // hard stop if something hangs
});`,
        },
        {
          title: 'Target tracking: keep CPU around 50%',
          lang: 'bash',
          code: `aws autoscaling put-scaling-policy --auto-scaling-group-name orders-asg --policy-name cpu50 --policy-type TargetTrackingScaling --target-tracking-configuration '{"PredefinedMetricSpecification":{"PredefinedMetricType":"ASGAverageCPUUtilization"},"TargetValue":50.0}'`,
        },
      ],
      output: `The ALB calls \`/health\` on each instance every few seconds; instances that fail are taken out of rotation. When CPU across the group goes above ~50%, the ASG launches more instances; when it drops, it terminates some. Before an instance is removed, it gets \`SIGTERM\`: the server stops taking new connections, finishes current requests, logs "closed cleanly" and exits, so users do not see errors during scale-in or deploys.`,
      questions: [
        {
          q: 'ALB vs NLB?',
          a: 'ALB is layer 7: HTTP-aware, path/host routing, good for web apps and APIs. NLB is layer 4: TCP/UDP, ultra-low latency, static IPs, millions of requests per second.',
        },
        {
          q: 'Why must apps behind a load balancer be stateless?',
          a: 'Consecutive requests from the same user may hit different servers. State in local memory (sessions, uploads) would be missing. Keep state in Redis, a database, S3 or a JWT.',
        },
        {
          q: 'What is connection draining?',
          a: 'When a target is removed, the load balancer stops sending new requests but waits (up to the deregistration delay) for in-flight ones to finish. The app should close gracefully on SIGTERM.',
        },
        {
          q: 'Horizontal vs vertical scaling — which do you prefer and why?',
          a: 'Horizontal: add more instances behind a load balancer. It has no hard ceiling, gives redundancy and can scale automatically. Vertical (bigger instance) is simpler but has a limit and a single point of failure.',
        },
      ],
      spoken: `"A load balancer spreads traffic across multiple copies of my app and only sends it to targets passing health checks. On AWS I use an ALB for HTTP because it can route by path or host, and an NLB for raw TCP or static IPs. Auto scaling adds or removes instances or containers based on a metric, usually target tracking like 50% CPU or requests per target. For this to work the app must be stateless — sessions in Redis or JWTs — and it must shut down gracefully on SIGTERM so connection draining finishes in-flight requests."`,
      mistakes: [
        'Storing sessions in server memory and then adding a second instance — users get randomly logged out.',
        'A health check that hits the database on every call; a DB blip marks every instance unhealthy at once and takes the whole site down.',
        'Ignoring SIGTERM, so every deploy or scale-in drops in-flight requests with 502s.',
        'Follow-up trap: "Traffic spikes in 30 seconds but scaling takes 3 minutes — what do you do?" Keep headroom (lower target), scheduled or predictive scaling for known events, warm pools, faster boot (containers, smaller images), and queue work that can wait.',
      ],
      takeaway: 'Load balancer for spreading and health, auto scaling for elasticity — and stateless apps with graceful shutdown make both work.',
    },
    {
      id: 'serverless-pros-cons',
      title: 'Serverless: Pros and Cons',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Serverless means no servers to manage, automatic scaling and pay-per-use — at the cost of cold starts, limits, vendor lock-in and harder local debugging.',
      what: `**Serverless** does not mean "no servers". It means **you** do not manage them. You write functions or containers, and the cloud runs, scales and patches everything. Examples: AWS Lambda, API Gateway, DynamoDB, S3, Cloud Run, Vercel functions.

**Pros:**
- No servers to patch or size.
- Scales automatically, including **to zero** — no traffic, (almost) no bill.
- Pay per request / per millisecond.
- Fast to build event-driven systems (S3 upload → Lambda → queue).

**Cons:**
- **Cold starts** add latency for the first request after idle.
- **Limits:** max run time (Lambda 15 min), payload sizes, memory.
- **Cost at steady high load** can be higher than containers or VMs.
- **Vendor lock-in** — your code depends on AWS events and services.
- Harder **local testing and debugging** across many small functions.

#### Deeper version
- **Database connections:** many short-lived instances can exhaust a SQL database — use RDS Proxy or serverless-friendly DBs (DynamoDB, Aurora Serverless, MongoDB Atlas with care for connection reuse).
- **Statelessness:** no in-memory sessions, no local file storage that lasts.
- **Observability:** one request may cross many functions — you need structured logs and tracing.
- **Concurrency limits:** an account has a regional concurrency quota; a runaway function can starve others.
- **Cost crossover:** a rough rule — spiky or low traffic → serverless wins; constant high traffic → containers or EC2 often cheaper. Always estimate with real numbers.
- Container-based serverless (Cloud Run, Fargate) reduces some cons: Cloud Run allows longer request timeouts than Lambda (up to 60 minutes at the time of writing — check current docs), one instance can handle many requests at once, and you can run the same container locally with Docker.`,
      why: `Interviewers ask this to see if you can pick the right tool. Many startups start serverless for speed and low cost, then move hot paths to containers when traffic becomes steady. Knowing the trade-offs shows real-world judgment.`,
      analogy: `Serverless is like Uber versus owning a car. For occasional trips it is cheaper and you never service the engine. But if you drive 8 hours every day, owning (or leasing) a car is cheaper, and you are never stuck waiting for a ride to arrive (cold start).`,
      code: [
        {
          title: 'Rough cost comparison (back-of-the-envelope)',
          lang: 'javascript',
          code: `// Rough Lambda cost estimate. Prices are examples - check current AWS pricing for your region.
const PRICE_PER_GB_SECOND = 0.0000166667;
const PRICE_PER_MILLION_REQUESTS = 0.20;

function lambdaMonthlyCost({ requestsPerMonth, avgMs, memoryMb }) {
  const gbSeconds = requestsPerMonth * (avgMs / 1000) * (memoryMb / 1024);
  const compute = gbSeconds * PRICE_PER_GB_SECOND;
  const requests = (requestsPerMonth / 1_000_000) * PRICE_PER_MILLION_REQUESTS;
  return Math.round((compute + requests) * 100) / 100;
}

console.log(lambdaMonthlyCost({ requestsPerMonth: 1_000_000, avgMs: 120, memoryMb: 512 }));   // small app
console.log(lambdaMonthlyCost({ requestsPerMonth: 500_000_000, avgMs: 120, memoryMb: 512 })); // busy API`,
        },
      ],
      output: `The first line prints about \`1.2\` dollars per month for 1 million requests — tiny, and zero when idle (ignoring the free tier). The second prints about \`600\` dollars per month for 500 million requests. At that steady volume, a few always-on containers might cost less. This is the typical serverless trade-off: amazing for low or spiky traffic, worth re-checking for constant heavy traffic. (API Gateway, data transfer and logs add more cost in real life.)`,
      questions: [
        {
          q: 'What are the pros and cons of serverless?',
          a: 'Pros: no server management, auto scaling to zero, pay-per-use, fast development. Cons: cold starts, execution limits, vendor lock-in, harder debugging, connection management, and higher cost at steady high load.',
        },
        {
          q: 'When would you NOT use Lambda?',
          a: 'Long-running jobs over 15 minutes, persistent WebSocket servers, steady high traffic where containers are cheaper, very latency-sensitive paths that cannot tolerate cold starts, or workloads needing special hardware.',
        },
        {
          q: 'How do you reduce vendor lock-in with serverless?',
          a: 'Keep business logic in plain modules separate from the handler (hexagonal style), use standard protocols, containers (Cloud Run/Fargate), and IaC. Accept some lock-in where the managed service saves real effort.',
        },
      ],
      spoken: `"Serverless means I don't manage servers — the platform scales and patches for me and I pay per use, even scaling to zero. That's great for spiky traffic, webhooks, event-driven pipelines and small teams. The trade-offs are cold starts, limits like Lambda's 15-minute timeout, vendor lock-in, harder local debugging, and database connection issues with SQL. At steady high traffic it can cost more than containers. So I usually start serverless for speed, keep business logic separate from handlers, and move hot paths to containers if the numbers say so."`,
      mistakes: [
        'Saying "serverless means there are no servers". There are servers; you just do not manage them.',
        'Assuming serverless is always cheaper. Run the numbers for your traffic pattern.',
        'Splitting every tiny function into its own Lambda, creating a hard-to-debug "nano-service" mess.',
        'Follow-up trap: "How do you test Lambdas locally?" Keep logic in plain functions with unit tests, call the handler with sample events, and use tools like SAM CLI (`sam local invoke`) or LocalStack for integration tests.',
      ],
      takeaway: 'Serverless trades control for speed and zero ops — great for spiky and event-driven work; check limits and cost for steady heavy loads.',
    },
    {
      id: 'docker-volumes-networks',
      title: 'Docker Volumes and Networks',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Volumes keep data alive after a container is removed; networks let containers find each other by name.',
      what: `A container's own filesystem is temporary. When you remove the container, its data is gone. **Volumes** fix this.

- **Named volume:** storage managed by Docker (\`mongo-data\`). Best for database data.
- **Bind mount:** maps a folder from your machine into the container (\`./src:/app/src\`). Best for live code reload in development.
- **tmpfs:** in-memory only, for temporary secrets or scratch files.

**Networks** connect containers. On a **user-defined bridge network**, containers can reach each other **by name** — the \`api\` container can connect to \`mongodb://mongo:27017\`.

#### Deeper version
- Docker has a built-in **DNS server** for user-defined networks. The default \`bridge\` network does **not** give name resolution — always create your own network (Compose does this for you).
- Network drivers: \`bridge\` (single host, default), \`host\` (share the host's network stack, Linux only, no isolation), \`none\`, and \`overlay\` (multi-host, used by Swarm).
- \`-p 8080:3000\` publishes a port to the **host**. Containers on the same network talk on the **container port** directly and do not need \`-p\`.
- Volumes outlive containers. \`docker compose down\` keeps named volumes; \`down -v\` deletes them.
- In production on Kubernetes, the same ideas become **PersistentVolumes/PersistentVolumeClaims** and **Services** — but most teams use managed databases instead of containers with volumes.`,
      why: `Without volumes, restarting a MongoDB container wipes your data. Without networks, you would hard-code IP addresses that change every time. Volumes and networks let you run a full local stack (API + DB + Redis) that behaves like production.`,
      analogy: `A container is a hotel room: when you check out, housekeeping clears everything. A **volume** is a storage locker in the basement — your things stay there between stays. A **network** is the hotel's internal phone system: you dial "room service" by name, not by a number that changes daily.`,
      code: [
        {
          title: 'Network + named volume by hand',
          lang: 'bash',
          code: `# 1. Create a network so containers can find each other by name
docker network create shop-net

# 2. MongoDB with a named volume for its data
docker run -d --name mongo --network shop-net -v mongo-data:/data/db mongo:7

# 3. The API reaches Mongo by its container name "mongo"
docker run -d --name api --network shop-net -p 8080:3000 -e MONGO_URL=mongodb://mongo:27017/shop orders-api:1.0

# 4. Data survives removing the container
docker rm -f mongo
docker run -d --name mongo --network shop-net -v mongo-data:/data/db mongo:7   # same data is back

docker volume ls
docker network inspect shop-net`,
        },
        {
          title: 'Bind mount for live reload in development',
          lang: 'bash',
          code: `# Mount the local src folder; nodemon restarts on every save
docker run --rm -it -p 3000:3000 -v "$(pwd)/src:/app/src" orders-api:dev npx nodemon src/server.js`,
        },
      ],
      output: `The API connects to \`mongo:27017\` because Docker's DNS on \`shop-net\` resolves the name \`mongo\` to that container's IP. Only the API publishes a port (8080 on your machine); Mongo is reachable only inside the network, which is safer. After \`docker rm -f mongo\` and starting a new Mongo container with the same \`mongo-data\` volume, all collections are still there. In the dev example, editing a file in \`./src\` on your laptop instantly changes it inside the container, and nodemon restarts the server.`,
      questions: [
        {
          q: 'Volume vs bind mount?',
          a: 'A named volume is managed by Docker and is best for persistent data like databases. A bind mount maps a specific host path and is best for development (live code). Bind mounts depend on the host folder structure.',
        },
        {
          q: 'How do two containers talk to each other?',
          a: 'Put them on the same user-defined network and use the container (or Compose service) name as the hostname, with the container\'s internal port.',
        },
        {
          q: 'Why can my container not reach "localhost:27017" where Mongo runs in another container?',
          a: 'Inside a container, localhost is the container itself. Use the other container\'s name on a shared network, e.g. `mongo:27017`.',
        },
      ],
      spoken: `"Containers are ephemeral, so anything written inside them disappears when they're removed. For persistent data like a local Mongo I use named volumes, which Docker manages and which survive container restarts. For development I use bind mounts so code changes on my laptop show up instantly in the container. For networking I create a user-defined bridge network — Compose does this automatically — so containers find each other by name through Docker's DNS, like mongodb://mongo:27017. I only publish ports to the host for services I need to reach from outside."`,
      mistakes: [
        'Using the default bridge network and expecting name resolution to work.',
        'Running `docker compose down -v` and deleting the local database by accident.',
        'Publishing the database port to the host (or to the internet on a server) when only the API needs it.',
        'Follow-up trap: "Should you run your production database in Docker with a volume?" It is possible, but managed databases (Atlas, RDS) handle backups, replication and failover for you; most teams prefer them.',
      ],
      takeaway: 'Volumes keep data, networks give names — containers talk by service name, not localhost.',
    },
    {
      id: 'docker-compose',
      title: 'Docker Compose',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Docker Compose defines and runs a multi-container app (API, DB, cache) from one YAML file with one command.',
      what: `**Docker Compose** lets you describe several containers in one file, \`compose.yaml\` (older name: \`docker-compose.yml\`), and start them all with \`docker compose up\`.

For each **service** you set: the image or build folder, ports, environment variables, volumes, and dependencies. Compose creates a shared network automatically, so services reach each other by service name.

#### Deeper version
- \`depends_on\` only controls **start order** by default. To wait until a database is actually ready, add a \`healthcheck\` to it and use \`condition: service_healthy\`.
- **Override files:** \`compose.yaml\` for the base, \`compose.override.yaml\` (loaded automatically) for dev tweaks like bind mounts, or \`-f compose.prod.yaml\` for others.
- \`.env\` next to the compose file is used for variable substitution in the YAML (\`\${MONGO_VERSION}\`). \`env_file\` passes variables into the container.
- **Profiles** let you start optional services (\`--profile tools\` for an admin UI).
- \`docker compose watch\` (newer Compose versions) can sync files or rebuild on change — check your Compose version.
- Compose is mainly for **local dev and CI** (spin up real Mongo/Redis for integration tests). Production usually uses ECS, Kubernetes or Cloud Run.`,
      why: `Without Compose, every developer runs 4-5 long \`docker run\` commands in the right order with the right flags. With Compose, a new teammate clones the repo and runs one command to get the API, MongoDB, Redis and a worker running — the same way for everyone.`,
      analogy: `Compose is the orchestra's sheet music. Each musician (service) knows their part, when to come in (depends_on), and they all play together when the conductor says "up". Without it, you would cue every musician by hand.`,
      code: [
        {
          title: 'compose.yaml for a MERN-style backend',
          lang: 'yaml',
          code: `services:
  api:
    build: .                      # build from ./Dockerfile
    ports:
      - "3000:3000"
    environment:
      MONGO_URL: mongodb://mongo:27017/shop
      REDIS_URL: redis://redis:6379
    depends_on:
      mongo:
        condition: service_healthy  # wait until Mongo answers
      redis:
        condition: service_started
    volumes:
      - ./src:/app/src            # live code in development

  worker:
    build: .
    command: ["node", "src/worker.js"]
    environment:
      REDIS_URL: redis://redis:6379
    depends_on: [redis]

  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 5s
      retries: 10

  redis:
    image: redis:7-alpine

volumes:
  mongo-data:`,
        },
        {
          title: 'Everyday commands',
          lang: 'bash',
          code: `docker compose up -d --build     # build images and start everything in the background
docker compose ps                # status of each service
docker compose logs -f api       # follow logs of one service
docker compose exec mongo mongosh   # shell into a running service
docker compose up -d --scale worker=3   # run 3 worker containers
docker compose down              # stop and remove containers + network (volumes kept)`,
        },
      ],
      output: `\`up -d --build\` builds the API image, creates a network and the \`mongo-data\` volume, starts Mongo and Redis, waits until Mongo's health check passes, then starts the API and the worker. The API reaches the database at \`mongo:27017\` and Redis at \`redis:6379\` by service name. Only the API is published on \`localhost:3000\`. \`--scale worker=3\` runs three worker containers that share the same Redis queue. \`down\` removes containers but keeps your Mongo data in the volume.`,
      questions: [
        {
          q: 'What does depends_on actually guarantee?',
          a: 'By default only start order, not readiness. Use a healthcheck on the dependency and `condition: service_healthy`, and still add retry logic in the app.',
        },
        {
          q: 'How do you use different settings for dev and prod with Compose?',
          a: 'Keep a base `compose.yaml` and add override files (`compose.override.yaml` for dev, `-f compose.prod.yaml` for others), plus `.env` / `env_file` for values.',
        },
        {
          q: 'Is Docker Compose used in production?',
          a: 'Sometimes on a single server, but it has no multi-host scheduling, self-healing across machines or rolling deploys like Kubernetes or ECS. It is mostly for local development and CI.',
        },
      ],
      spoken: `"Docker Compose lets me define a multi-container app in one YAML file — for example the API, a worker, MongoDB and Redis — and start everything with docker compose up. Compose creates a network, so services reach each other by name, and I use named volumes for database data. One thing I'm careful about is that depends_on only controls start order, so I add a healthcheck on Mongo and use service_healthy, plus retries in the app. I mostly use Compose for local development and CI integration tests; production runs on ECS, Kubernetes or Cloud Run."`,
      mistakes: [
        'Assuming `depends_on` waits for the database to be ready; the app crashes with "connection refused" on first start.',
        'Using `localhost` in connection strings instead of the service name.',
        'Committing a `.env` with real secrets that Compose reads.',
        'Follow-up trap: "Your code changes are not showing up in the container — why?" The image was not rebuilt (`--build`), or there is no bind mount, or the bind mount hides `node_modules` built inside the image (fix with an anonymous volume for `/app/node_modules`).',
      ],
      takeaway: 'Compose = one file, one command for your whole local stack; services talk by name, and healthchecks make start order reliable.',
    },
    {
      id: 'nginx-reverse-proxy',
      title: 'Nginx and Reverse Proxy',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Nginx sits in front of your Node app to handle HTTPS, static files, compression, load balancing and forwarding requests.',
      what: `**Nginx** is a fast web server. Most often it is used as a **reverse proxy**: it receives requests from users and forwards them to your app (like Node on port 3000), then sends the answer back.

- A **forward proxy** acts for the **client** (like a company proxy that hides employees' IPs).
- A **reverse proxy** acts for the **server** (users only see Nginx, never your Node process directly).

Nginx can also serve static files (your React build), terminate HTTPS, compress responses (gzip), cache, and spread traffic across several app instances (load balancing).

#### Deeper version
- Nginx uses an **event-driven, non-blocking** model (like Node), so a few worker processes handle thousands of connections.
- \`upstream\` defines a group of backends; default balancing is round robin, with options like \`least_conn\` and \`ip_hash\`.
- Pass the real client info with headers: \`X-Forwarded-For\`, \`X-Forwarded-Proto\`, \`Host\`. In Express set \`app.set('trust proxy', 1)\` so \`req.ip\` and \`req.secure\` are correct.
- **WebSockets** need \`proxy_http_version 1.1\` and the \`Upgrade\`/\`Connection\` headers.
- SPA routing: \`try_files $uri /index.html\` so deep links load the React app.
- Useful extras: \`client_max_body_size\` (upload size; default is 1 MB), \`limit_req\` for rate limiting, \`proxy_read_timeout\` for slow endpoints.
- In the cloud, an ALB, CloudFront or a Kubernetes **Ingress controller** (often Nginx-based) frequently does this job instead.`,
      why: `Node is great at app logic but you do not want it handling TLS certificates, serving gigabytes of static files, or being exposed directly. Nginx does those jobs faster, protects the app, and lets you run several Node processes behind one address.`,
      analogy: `Nginx is the receptionist at a hotel. Guests (users) talk only to the receptionist. Simple requests ("a map, please" = static files) are handled right at the desk. Complex ones are passed to the right department (your Node app), and the guest never walks into the back office.`,
      code: [
        {
          title: 'Nginx: React build + API proxy + load balancing + HTTPS',
          lang: 'nginx',
          code: `upstream api_backend {
    least_conn;                     # send to the instance with the fewest connections
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name shop.com;
    return 301 https://$host$request_uri;   # force HTTPS
}

server {
    listen 443 ssl;
    http2 on;                       # older Nginx versions use "listen 443 ssl http2;" instead
    server_name shop.com;
    ssl_certificate     /etc/letsencrypt/live/shop.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shop.com/privkey.pem;

    gzip on;
    gzip_types text/css application/javascript application/json;
    client_max_body_size 10m;

    # React build: serve files, fall back to index.html for client-side routes
    root /var/www/shop/dist;
    location / {
        try_files $uri /index.html;
    }

    # API: forward to Node
    location /api/ {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSockets (e.g. Socket.IO)
    location /socket.io/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}`,
        },
        {
          title: 'Express behind the proxy',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();

// Trust the first proxy (Nginx) so req.ip and req.protocol are the real values
app.set('trust proxy', 1);

app.get('/api/whoami', (req, res) => {
  res.json({ ip: req.ip, secure: req.secure, host: req.hostname });
});

app.listen(Number(process.env.PORT) || 3000);`,
        },
      ],
      output: `A request to \`http://shop.com\` is redirected to HTTPS. \`https://shop.com/orders/42\` has no matching file, so \`try_files\` serves \`index.html\` and React Router shows the order page. \`/api/whoami\` is forwarded to whichever Node instance has fewer connections, and because of \`trust proxy\` plus the forwarded headers it returns the user's real IP and \`secure: true\` — not \`127.0.0.1\` and \`false\`. Socket.IO connections upgrade to WebSockets correctly thanks to the \`Upgrade\` headers.`,
      questions: [
        {
          q: 'What is a reverse proxy and why use one?',
          a: 'A server that receives client requests and forwards them to backend servers. It hides the backends and handles TLS, static files, compression, caching, rate limiting and load balancing.',
        },
        {
          q: 'Forward proxy vs reverse proxy?',
          a: 'A forward proxy represents clients to the internet (hides the client). A reverse proxy represents servers to clients (hides the servers).',
        },
        {
          q: 'Why does req.ip show 127.0.0.1 in Express behind Nginx?',
          a: 'Because the connection comes from Nginx. Forward `X-Forwarded-For` in Nginx and set `app.set("trust proxy", 1)` in Express.',
        },
        {
          q: 'How do you fix 404s on page refresh for a React SPA served by Nginx?',
          a: 'Use `try_files $uri /index.html;` so unknown paths return the SPA, which then handles routing on the client.',
        },
      ],
      spoken: `"Nginx is a high-performance web server that I mostly use as a reverse proxy. Users talk to Nginx, and it forwards API requests to my Node processes, serves the React build directly, terminates HTTPS, gzips responses and can load balance across several instances with an upstream block. I always forward headers like X-Forwarded-For and Proto and set trust proxy in Express so I get the real client IP. For WebSockets I add the Upgrade headers, and for SPAs I use try_files to fall back to index.html. In AWS an ALB or CloudFront often replaces parts of this."`,
      mistakes: [
        'Forgetting `try_files` and getting 404s when refreshing a client-side route.',
        'Not setting the `Upgrade`/`Connection` headers, so WebSockets fall back to polling or fail.',
        'Uploads failing with 413 "Request Entity Too Large" because `client_max_body_size` defaults to 1 MB.',
        'Follow-up trap: "Getting 504 Gateway Timeout from Nginx — what does it mean?" Nginx reached the app but did not get a response in time (`proxy_read_timeout`, default 60s). Fix the slow endpoint or make it async; a 502 instead means the upstream is down or crashed.',
      ],
      takeaway: 'Nginx is the front desk: HTTPS, static files and routing in front, your Node app safely behind.',
    },
    {
      id: 'github-actions-basics',
      title: 'CI/CD with GitHub Actions: Workflows, Jobs and Secrets',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'CI automatically tests every change; CD automatically ships it. GitHub Actions runs workflows (YAML) made of jobs and steps on events like push and pull_request.',
      what: `**CI** (Continuous Integration) means every push or pull request is automatically built and tested. **CD** (Continuous Delivery/Deployment) means passing code is automatically prepared for release (delivery) or released (deployment).

**GitHub Actions** is GitHub's built-in CI/CD:
- **Workflow:** a YAML file in \`.github/workflows/\`. It runs on **events** (\`push\`, \`pull_request\`, \`workflow_dispatch\` for a manual button, \`schedule\` for cron).
- **Job:** a group of steps that runs on one **runner** (a fresh virtual machine like \`ubuntu-latest\`). Jobs run **in parallel** unless you add \`needs\`.
- **Step:** one command (\`run: npm test\`) or a reusable **action** (\`uses: actions/checkout@v4\`).
- **Secrets:** encrypted values (like \`NPM_TOKEN\`) set in repo/org settings, used as \`\${{ secrets.NAME }}\` and masked in logs.

#### Deeper version
- Each job gets a **clean machine** — files are not shared between jobs unless you use **artifacts** (\`upload-artifact\` / \`download-artifact\`) or caches.
- **Contexts and expressions:** \`\${{ github.sha }}\`, \`\${{ github.ref }}\`, conditions like \`if: github.ref == 'refs/heads/main'\`.
- **Environments** (\`environment: production\`) can hold their own secrets and require manual approval.
- \`permissions:\` sets what the built-in \`GITHUB_TOKEN\` can do — keep it minimal.
- **Concurrency groups** cancel older runs of the same branch.
- Secrets are **not** passed to workflows triggered by pull requests from forks (for safety).
- Pin third-party actions to a version tag or, for strict security, a full commit SHA.`,
      why: `Without CI, broken code reaches main and is found by users. Without CD, deploys are manual, slow and error-prone ("did you run the migration?"). A pipeline makes every change go through the same checks — lint, type-check, tests, build — and deploys the same way every time.`,
      analogy: `CI/CD is a car factory assembly line. Every car (commit) goes through the same stations: welding (build), quality checks (tests), paint (package), and only cars that pass every check roll out of the gate (deploy). Nobody skips a station because they are in a hurry.`,
      code: [
        {
          title: '.github/workflows/ci.yml — test every PR and push',
          lang: 'yaml',
          code: `name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true   # a new push cancels the old run

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm           # caches the npm download cache
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    services:
      mongo:                   # a real MongoDB for integration tests
        image: mongo:7
        ports: ["27017:27017"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
        env:
          MONGO_URL: mongodb://localhost:27017/test
          STRIPE_SECRET_KEY: \${{ secrets.STRIPE_TEST_KEY }}`,
        },
      ],
      output: `On every pull request and every push to \`main\`, GitHub starts two jobs in parallel on fresh Ubuntu machines. The first lints and type-checks. The second starts a MongoDB service container, installs dependencies and runs tests with the test Stripe key from secrets (printed as \`***\` if anything logs it). If any step exits with a non-zero code, the job fails and the PR shows a red ✗; with branch protection, the PR cannot be merged. Pushing again to the same branch cancels the older run thanks to \`concurrency\`.`,
      questions: [
        {
          q: 'What is the difference between CI, continuous delivery and continuous deployment?',
          a: 'CI: automatically build and test every change. Continuous delivery: every passing change is ready to release, but a human clicks deploy. Continuous deployment: every passing change goes to production automatically.',
        },
        {
          q: 'What is the difference between a workflow, a job and a step?',
          a: 'A workflow is the YAML file triggered by events. It contains jobs, which run on separate runners (in parallel by default). Each job has steps that run in order on the same machine.',
        },
        {
          q: 'How do you share files between jobs?',
          a: 'Jobs run on separate machines, so use `actions/upload-artifact` and `download-artifact` (or push an image to a registry). Use `needs:` to order them.',
        },
        {
          q: 'How do you keep secrets safe in GitHub Actions?',
          a: 'Store them as repository/environment secrets, give the workflow minimal `permissions`, use environment protection rules for prod, prefer OIDC to cloud providers instead of long-lived keys, and never echo secrets.',
        },
      ],
      spoken: `"CI means every change is automatically built and tested; CD means passing changes are automatically released or ready to release. In GitHub Actions a workflow is a YAML file triggered by events like pull_request or push. It has jobs that run in parallel on fresh runners unless I chain them with needs, and each job has steps — shell commands or reusable actions. My typical CI runs npm ci with caching, lint, type-check and tests, sometimes with a Mongo service container. Secrets live in GitHub secrets or environments, and for cloud access I prefer OIDC over stored keys."`,
      mistakes: [
        'Using `npm install` in CI instead of `npm ci`, getting different dependency versions than the lockfile.',
        'Expecting files from one job to exist in another job — each job is a fresh machine.',
        'Giving the workflow broad `GITHUB_TOKEN` permissions or long-lived cloud admin keys.',
        'Follow-up trap: "Why are secrets empty in a PR from a fork?" GitHub does not expose secrets to fork PR workflows, to stop attackers from stealing them with a malicious PR.',
      ],
      takeaway: 'Every change goes through the same automated pipeline: workflow → parallel jobs → ordered steps, with secrets kept out of code.',
    },
    {
      id: 'health-checks',
      title: 'Health Checks: Liveness vs Readiness',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Liveness asks "is the process stuck, should we restart it?"; readiness asks "can it take traffic right now?". Mixing them up causes outages.',
      what: `A **health check** is a small endpoint (like \`/health\`) that a platform calls to know how your app is doing.

- **Liveness:** "Is the app alive or stuck?" If it fails, the platform **restarts** the container. It should be very simple — "the event loop responds".
- **Readiness:** "Is the app ready to serve traffic?" If it fails, the platform **stops sending traffic** to it (but does not restart it). It can check that the DB connection is up and warm-up is done.
- **Startup** (Kubernetes): "Has the app finished starting?" It holds off the liveness check for slow-starting apps.

Load balancers (ALB target groups) do something like a readiness check — unhealthy targets get no traffic.

#### Deeper version
- **Never check external dependencies in liveness.** If MongoDB blips and every pod's liveness fails, Kubernetes restarts all of them at once — turning a small DB blip into a full outage (a **cascading failure**). Restarting your app does not fix the database.
- Readiness may check **critical** dependencies, but be careful: if every instance becomes "not ready" because of a shared dependency, there is nobody left to serve even cached pages or a friendly error. Many teams keep readiness light too and handle dependency failures in the code (timeouts, circuit breakers).
- During **graceful shutdown**, fail readiness first so traffic drains, then exit.
- Health endpoints must be fast, unauthenticated (or on an internal port), and should not be logged at full volume.
- **Deep health checks** (calling every dependency) are useful for dashboards and synthetic monitoring, not for restart decisions.`,
      why: `Platforms restart and route based on these signals. Correct checks mean a frozen process is restarted automatically and new or overloaded instances do not receive traffic before they are ready — giving zero-downtime deploys and self-healing.`,
      analogy: `Think of a restaurant cook. **Liveness** is "Is the cook conscious?" — if not, call an ambulance (restart). **Readiness** is "Is the cook ready to take orders?" — maybe they are still setting up their station, so the waiter sends orders to another cook for now. You would not call an ambulance just because the vegetable delivery is late (a dependency is down).`,
      code: [
        {
          title: 'Express: separate liveness and readiness',
          lang: 'javascript',
          code: `import express from 'express';
import mongoose from 'mongoose';

const app = express();
let shuttingDown = false;

// Liveness: only "is the process responsive?" - no DB checks here
app.get('/livez', (req, res) => res.status(200).send('ok'));

// Readiness: can this instance serve traffic right now?
app.get('/readyz', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1; // 1 = connected
  if (shuttingDown || !dbReady) return res.status(503).json({ ready: false, dbReady });
  res.status(200).json({ ready: true });
});

const server = app.listen(3000);
await mongoose.connect(process.env.MONGO_URL);

process.on('SIGTERM', () => {
  shuttingDown = true;               // 1. fail readiness -> load balancer drains us
  setTimeout(() => server.close(() => process.exit(0)), 10_000); // 2. then close
});`,
        },
        {
          title: 'Kubernetes probes using those endpoints',
          lang: 'yaml',
          code: `containers:
  - name: api
    image: myrepo/orders-api:3f9a1c2
    ports:
      - containerPort: 3000
    startupProbe:              # give a slow start up to 30 x 2s = 60s
      httpGet: { path: /livez, port: 3000 }
      periodSeconds: 2
      failureThreshold: 30
    livenessProbe:             # restart if stuck for ~30s
      httpGet: { path: /livez, port: 3000 }
      periodSeconds: 10
      failureThreshold: 3
    readinessProbe:            # remove from Service endpoints if not ready
      httpGet: { path: /readyz, port: 3000 }
      periodSeconds: 5
      failureThreshold: 2`,
        },
      ],
      output: `While the app starts, \`/readyz\` returns 503 until Mongo is connected, so Kubernetes does not send it traffic yet. The startup probe gives it up to 60 seconds before liveness checks begin. If the event loop freezes (an infinite loop), \`/livez\` stops answering and after 3 failures the container is restarted. If Mongo drops briefly, only readiness fails — pods are taken out of rotation and come back when the DB returns, with **no** restarts. On \`SIGTERM\`, readiness flips to 503 first, traffic drains for 10 seconds, then the server closes.`,
      questions: [
        {
          q: 'What is the difference between liveness and readiness probes?',
          a: 'Liveness failure means the container is restarted. Readiness failure means the pod is removed from load balancing but keeps running. Liveness detects a stuck process; readiness detects "not able to serve right now".',
        },
        {
          q: 'Should a liveness check verify the database connection?',
          a: 'No. A database outage would make every instance fail liveness and restart in a loop, which does not fix the database and makes the outage worse.',
        },
        {
          q: 'What is a startup probe for?',
          a: 'For slow-starting apps. It disables liveness and readiness checks until it succeeds, so the app is not killed while still booting.',
        },
      ],
      spoken: `"I separate liveness and readiness. Liveness answers 'is the process stuck?' — if it fails, the platform restarts the container, so I keep it trivial and never check the database there; otherwise one DB blip restarts every pod. Readiness answers 'can I serve traffic right now?' — if it fails, the instance is taken out of the load balancer but not restarted, so it can check things like the DB connection or warm-up. For slow boots I add a startup probe. During shutdown I fail readiness first so traffic drains, then close the server."`,
      mistakes: [
        'Checking the database or third-party APIs in the liveness probe and causing restart storms.',
        'Liveness timeouts too tight, so a slow GC pause or heavy request restarts healthy pods.',
        'Using the same endpoint for liveness and readiness, which removes the whole point of having two.',
        'Follow-up trap: "Pods are in CrashLoopBackOff right after deploy, but the app works locally — why?" Often the liveness probe fires before the app is ready (no startup probe or too-short initial delay), wrong port/path, or missing env config causing a crash on start.',
      ],
      takeaway: 'Liveness = restart if stuck (keep it dumb), readiness = route traffic only when able (can be smarter).',
    },
    {
      id: 'logging-monitoring',
      title: 'Logging and Monitoring (Observability)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Use structured logs, metrics and traces with correlation IDs; alert on symptoms users feel (errors, latency) using SLOs.',
      what: `**Observability** means you can understand what your system is doing from the outside. It has three pillars:

- **Logs:** detailed events — "payment failed for order 42 because card declined".
- **Metrics:** numbers over time — requests per second, error rate, p95 latency, CPU.
- **Traces:** the path of one request through many services, with timing for each step.

**Monitoring** is watching those signals and **alerting** a person when something is wrong.

#### Deeper version
- **Structured logging:** log JSON (with a library like **pino**), not free text. Include \`level\`, \`msg\`, \`requestId\`, \`userId\`, \`route\`, \`durationMs\`.
- **Correlation / request ID:** generate one per request (or read it from an incoming header), add it to every log line, and pass it to downstream calls — then you can find all logs for one request across services.
- **Log levels:** \`debug\` (dev only), \`info\` (normal events), \`warn\` (unexpected but handled), \`error\` (needs attention). Never log passwords, tokens, card data or full PII.
- **Golden signals:** latency, traffic, errors, saturation. **RED** for services: Rate, Errors, Duration.
- **SLI / SLO / SLA:** SLI = what you measure (successful requests %), SLO = your target (99.9% over 30 days), SLA = the contract with customers (with penalties). The gap is the **error budget**.
- **Alert on symptoms** (high error rate, slow checkout), not every cause (CPU at 80%), to avoid alert fatigue.
- **OpenTelemetry** is the vendor-neutral standard for traces/metrics/logs; send data to CloudWatch, Datadog, Grafana, New Relic, Sentry, etc.
- Error tracking tools (Sentry) group exceptions with stack traces and release versions.`,
      why: `In production you cannot attach a debugger. When a customer says "checkout failed at 3:15", you need to find that exact request, see which service failed and why, and know if it affects 1 user or 10,000. Good observability turns hours of guessing into minutes.`,
      analogy: `Observability is like a hospital patient's care. **Metrics** are the heart-rate monitor (numbers over time). **Logs** are the nurse's notes. **Traces** are the record of which departments the patient visited and how long each took. **Alerts** are the alarm that calls the doctor when the heart rate is dangerous — not every time the patient sneezes.`,
      code: [
        {
          title: 'Structured logs with a request ID (Express + pino)',
          lang: 'javascript',
          code: `import express from 'express';
import pino from 'pino';
import crypto from 'node:crypto';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization', 'password', 'card'], // never log secrets
});
const app = express();

// Attach a request ID and a child logger to every request
app.use((req, res, next) => {
  req.id = req.get('x-request-id') || crypto.randomUUID();
  req.log = logger.child({ requestId: req.id });
  res.set('x-request-id', req.id);
  const start = Date.now();
  res.on('finish', () => {
    req.log.info({ route: req.path, status: res.statusCode, durationMs: Date.now() - start }, 'request done');
  });
  next();
});

app.post('/api/checkout', async (req, res) => {
  req.log.info({ userId: 'u_42' }, 'checkout started');
  try {
    throw new Error('card_declined');
  } catch (err) {
    req.log.error({ err }, 'checkout failed');
    res.status(402).json({ error: 'Payment failed', requestId: req.id });
  }
});

app.listen(3000);`,
        },
      ],
      output: `Each request gets an ID (reused from \`x-request-id\` if a gateway already set one). Every log line for that request includes it, for example:

\`{"level":50,"requestId":"9b1c...","err":{"message":"card_declined",...},"msg":"checkout failed"}\`

then \`{"level":30,"requestId":"9b1c...","route":"/api/checkout","status":402,"durationMs":3,"msg":"request done"}\`. (pino uses numbers for levels: 30 = info, 50 = error.) The client receives the \`requestId\` in the response, so support can search logs for exactly that request. Authorization headers and passwords are redacted automatically.`,
      questions: [
        {
          q: 'What are the three pillars of observability?',
          a: 'Logs (detailed events), metrics (numbers over time) and traces (the path and timing of one request across services).',
        },
        {
          q: 'What is a correlation ID and why is it useful?',
          a: 'A unique ID attached to a request and passed through every service and log line. It lets you find all logs for one user request across a distributed system.',
        },
        {
          q: 'What is the difference between an SLI, SLO and SLA?',
          a: 'SLI is the measured indicator (e.g. % successful requests). SLO is the internal target (99.9%). SLA is the external promise to customers with consequences if broken.',
        },
        {
          q: 'What should you alert on?',
          a: 'User-facing symptoms: error rate, latency (p95/p99), availability and SLO burn rate. Each alert should be actionable; noisy cause-based alerts lead to alert fatigue.',
        },
      ],
      spoken: `"I think about observability as logs, metrics and traces. My Node services log structured JSON with pino, with a request ID on every line that I also pass to downstream services and return to the client, so I can follow one request end to end. I redact secrets and personal data. For metrics I track rate, errors and duration — especially p95 and p99 latency — and I alert on user-facing symptoms tied to SLOs, not on every CPU spike. For traces I use OpenTelemetry or X-Ray, and Sentry for exceptions."`,
      mistakes: [
        'Logging `console.log("here")` strings with no context — impossible to search or correlate.',
        'Logging tokens, passwords, card numbers or full request bodies with personal data.',
        'Alerting on everything until the team ignores alerts (alert fatigue).',
        'Follow-up trap: "Logs are too expensive — what do you do?" Lower default log level in prod, sample high-volume info/debug logs, drop health-check logs, set retention, and move old logs to cheap storage (S3).',
      ],
      takeaway: 'Structured logs + request IDs + RED metrics + traces, and alert only on what users actually feel.',
    },
    {
      id: 'gcp-core-services',
      title: 'GCP Essentials: Cloud Run, Pub/Sub and Cloud Storage',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Cloud Run runs containers serverlessly, Pub/Sub is managed messaging, Cloud Storage stores files — GCP\'s versions of Fargate/Lambda, SNS+SQS and S3.',
      what: `Google Cloud (GCP) has services that map closely to AWS:

- **Cloud Run:** you give it a **container image**; it runs it over HTTPS, scales from zero to many instances, and bills only while handling requests (by default). Like Lambda + Fargate combined.
- **Pub/Sub:** managed messaging. Publishers send messages to a **topic**; each **subscription** gets its own copy. Subscribers **pull** messages or Pub/Sub **pushes** them to an HTTPS endpoint (like a Cloud Run URL). Like SNS + SQS in one.
- **Cloud Storage (GCS):** object storage in **buckets**, with **signed URLs** for direct uploads/downloads. Like S3.

Everything lives inside a **project**, and permissions use **IAM** with **service accounts** (GCP's version of IAM roles for apps).

#### Deeper version
- **Cloud Run concurrency:** one instance can serve many requests at the same time (default 80, configurable up to 1,000 — check docs for current limits). This is a big difference from Lambda (one request per environment) and suits Node's async model well.
- \`--min-instances\` keeps instances warm (no cold starts, but you pay). \`--max-instances\` protects your DB from too many connections.
- Cloud Run needs your app to listen on the port in the **\`PORT\`** env variable (default 8080) and be stateless.
- **Pub/Sub delivery** is at-least-once by default — make handlers idempotent. Set an **ack deadline**, retry policy and a **dead-letter topic**. Ordering keys give per-key ordering.
- **Eventarc** routes events (GCS uploads, Pub/Sub, audit logs) to Cloud Run — similar to EventBridge.
- Other mappings: Cloud Functions ≈ Lambda, Firestore ≈ DynamoDB, Cloud SQL ≈ RDS, Secret Manager ≈ Secrets Manager, Cloud Logging/Monitoring ≈ CloudWatch, Artifact Registry ≈ ECR, GKE ≈ EKS.`,
      why: `Many companies use GCP, especially with Firebase or BigQuery. Cloud Run is one of the simplest ways to put a Node API in production: any language, any library, just a container, with serverless scaling and pricing. Knowing the AWS↔GCP mapping lets you move between clouds in interviews.`,
      analogy: `Cloud Run is a food truck rental service: you bring your own fully stocked truck (the container), and the city parks as many copies as needed where the crowds are, then removes them when the street is empty. Pub/Sub is a newspaper service: each subscriber gets their own copy of every edition. Cloud Storage is a giant self-storage warehouse.`,
      code: [
        {
          title: 'Publish and receive Pub/Sub messages (Node)',
          lang: 'javascript',
          code: `import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub(); // uses the service account credentials automatically

// Publisher: API publishes an event
export async function publishOrderPlaced(order) {
  const messageId = await pubsub.topic('order-placed').publishMessage({
    json: { orderId: order.id, total: order.total },
    attributes: { source: 'orders-api' },
  });
  console.log('published', messageId);
}

// Subscriber (pull): a worker listens on its own subscription
const sub = pubsub.subscription('order-placed-email');
sub.on('message', async (message) => {
  const data = JSON.parse(message.data.toString());
  try {
    await sendConfirmationEmail(data.orderId); // must be idempotent
    message.ack();                             // done: remove from subscription
  } catch (err) {
    console.error(err);
    message.nack();                            // redeliver later
  }
});`,
        },
        {
          title: 'Signed URL for a direct upload to Cloud Storage',
          lang: 'javascript',
          code: `import { Storage } from '@google-cloud/storage';
const storage = new Storage();

export async function getUploadUrl(userId, contentType) {
  const file = storage.bucket('shop-uploads').file(\`avatars/\${userId}.png\`);
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    contentType,
  });
  return url; // client PUTs the file to this URL
}`,
        },
      ],
      output: `\`publishOrderPlaced\` sends one message to the \`order-placed\` topic. Every subscription on that topic (email, analytics, inventory) gets its own copy — this is fan-out. The email worker receives the message, sends the email and calls \`ack()\`. If it throws, \`nack()\` makes Pub/Sub redeliver it later; after too many attempts it can go to a dead-letter topic.

The signed URL works like an S3 presigned URL: valid for 5 minutes, for one object and the given content type, so the browser can upload straight to GCS.`,
      questions: [
        {
          q: 'What is Cloud Run and how does it differ from Lambda?',
          a: 'Cloud Run runs any container over HTTP with automatic scaling to zero. Unlike Lambda, one instance can handle many concurrent requests, you deploy containers (any runtime), and request timeouts are longer.',
        },
        {
          q: 'How does Pub/Sub compare to SQS and SNS?',
          a: 'A Pub/Sub topic with multiple subscriptions gives SNS-style fan-out, and each subscription acts like a queue with acks, retries and dead-lettering — so it covers both SNS and SQS use cases.',
        },
        {
          q: 'What is a service account in GCP?',
          a: 'An identity for an app or service (not a person). You grant it IAM roles, attach it to Cloud Run or a VM, and client libraries use its credentials automatically — like an AWS IAM role.',
        },
        {
          q: 'Push vs pull subscriptions in Pub/Sub?',
          a: 'Pull: your worker asks for messages (good for long-running workers). Push: Pub/Sub sends HTTPS requests to your endpoint, like a Cloud Run service, and a 2xx response acknowledges the message.',
        },
      ],
      spoken: `"On GCP my go-to stack is Cloud Run, Pub/Sub and Cloud Storage. Cloud Run takes a container and runs it serverlessly with HTTPS, scaling to zero, and unlike Lambda one instance handles many concurrent requests, which suits Node really well. Pub/Sub is managed messaging: a topic fans out to subscriptions, each acting like its own queue, with push or pull delivery, acks, retries and dead-letter topics — so it covers SNS plus SQS. Cloud Storage is GCP's S3 with signed URLs for direct uploads. Permissions go through service accounts with least-privilege IAM roles."`,
      mistakes: [
        'Hard-coding port 3000 on Cloud Run instead of reading `process.env.PORT`; the container fails its startup check.',
        'Forgetting to `ack()` messages, so they are redelivered again and again after the ack deadline.',
        'Using the default compute service account with broad permissions instead of a dedicated, least-privilege one.',
        'Follow-up trap: "Can you run background work after sending the response on Cloud Run?" By default CPU is only allocated during requests, so background work may be paused. Use instance-based billing ("CPU always allocated"), Cloud Tasks, or Pub/Sub for that work.',
      ],
      takeaway: 'Cloud Run for containers without servers, Pub/Sub for fan-out messaging with acks, Cloud Storage for files — all secured with service accounts.',
    },
    {
      id: 'cloud-run-deploy',
      title: 'Deploying a Node Microservice to Cloud Run (Step by Step)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Containerize the app, push the image to Artifact Registry, deploy with gcloud run deploy, then wire secrets, a service account and CI.',
      what: `Deploying a Node service to Cloud Run follows these steps:

1. Make the app listen on \`process.env.PORT\` and be stateless.
2. Write a **Dockerfile**.
3. Create an **Artifact Registry** repository (where images are stored).
4. **Build and push** the image (locally with Docker, or with Cloud Build).
5. **Deploy** with \`gcloud run deploy\`, choosing region, service account, env vars, secrets and scaling limits.
6. Test the URL, then automate the same steps in **CI**.

#### Deeper version
- \`gcloud run deploy --source .\` can build from source for you (using Cloud Build and buildpacks or your Dockerfile) — fast for demos; explicit images tagged by commit are better for production.
- Each deploy creates an immutable **revision**. You can split traffic between revisions (\`--no-traffic\` + \`update-traffic --to-revisions\`) for canary releases, and roll back instantly.
- Secrets from **Secret Manager** are mounted as env vars or files with \`--set-secrets\`.
- \`--no-allow-unauthenticated\` makes the service private (callers need an identity token) — right for internal microservices.
- Connect to Cloud SQL with \`--add-cloudsql-instances\`, or to private resources through a VPC connector / Direct VPC egress.
- From GitHub Actions, use **Workload Identity Federation** (OIDC) instead of a downloaded service-account JSON key.`,
      why: `This is the standard path to production on GCP and a common "walk me through how you'd deploy" question. Cloud Run gives HTTPS, autoscaling, revisions and rollbacks without managing a cluster.`,
      analogy: `It is like publishing a book. You write it (code), print it in a standard format (Docker image), store copies in the warehouse (Artifact Registry), then tell the bookstores (Cloud Run) to stock that edition. A new edition (revision) can go to a few stores first, and if readers complain you put the old edition back.`,
      code: [
        {
          title: 'Dockerfile and app entry',
          lang: 'dockerfile',
          code: `FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
# Cloud Run sets PORT (default 8080); the app must listen on it
ENV NODE_ENV=production
CMD ["node", "server.js"]

# server.js contains:
#   app.listen(Number(process.env.PORT) || 8080, '0.0.0.0');`,
        },
        {
          title: 'One-time setup, build, push and deploy',
          lang: 'bash',
          code: `PROJECT=my-shop-prod
REGION=asia-south1
REPO=services
IMAGE=$REGION-docker.pkg.dev/$PROJECT/$REPO/orders-api:$(git rev-parse --short HEAD)

# 1. One-time: enable APIs, create the registry, a service account and a secret
gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
gcloud artifacts repositories create $REPO --repository-format=docker --location=$REGION
gcloud iam service-accounts create orders-api-sa
printf 'mongodb+srv://user:pass@cluster/shop' | gcloud secrets create MONGO_URL --data-file=-
gcloud secrets add-iam-policy-binding MONGO_URL --member="serviceAccount:orders-api-sa@$PROJECT.iam.gserviceaccount.com" --role=roles/secretmanager.secretAccessor

# 2. Build and push the image (amd64 matters if you build on an Apple Silicon Mac)
gcloud auth configure-docker $REGION-docker.pkg.dev
docker build --platform linux/amd64 -t $IMAGE .
docker push $IMAGE

# 3. Deploy
gcloud run deploy orders-api --image=$IMAGE --region=$REGION --service-account=orders-api-sa@$PROJECT.iam.gserviceaccount.com --set-env-vars=NODE_ENV=production,LOG_LEVEL=info --set-secrets=MONGO_URL=MONGO_URL:latest --min-instances=1 --max-instances=20 --concurrency=80 --memory=512Mi --allow-unauthenticated

# 4. Test
curl "$(gcloud run services describe orders-api --region=$REGION --format='value(status.url)')/health"`,
        },
      ],
      output: `After step 1 you have a Docker repository, a dedicated service account, and the Mongo URL stored in Secret Manager that only that account can read. Step 2 builds an image tagged with the current git commit and pushes it. Step 3 creates a new **revision** of \`orders-api\`, injects \`MONGO_URL\` from Secret Manager as an env variable, keeps one warm instance (fewer cold starts), and caps scaling at 20 instances to protect the database. \`gcloud\` prints a URL like \`https://orders-api-xxxx.a.run.app\`; the final \`curl\` hits \`/health\` and should print \`ok\`. Running step 3 again with an older image tag is an instant rollback.`,
      questions: [
        {
          q: 'Walk me through deploying a Node API to Cloud Run.',
          a: 'Listen on `PORT`, write a Dockerfile, push the image to Artifact Registry tagged by commit, then `gcloud run deploy` with a dedicated service account, env vars, secrets from Secret Manager and min/max instances. Automate it in CI with Workload Identity Federation.',
        },
        {
          q: 'How do you roll back a bad Cloud Run deploy?',
          a: 'Every deploy is a revision. Route 100% traffic back to the previous revision with `gcloud run services update-traffic --to-revisions=REV=100`, or redeploy the previous image tag.',
        },
        {
          q: 'How do you make a Cloud Run service private?',
          a: 'Deploy with `--no-allow-unauthenticated` and grant `roles/run.invoker` only to the caller\'s service account. Callers send a Google-signed identity token.',
        },
        {
          q: 'Why set max instances?',
          a: 'To cap cost and protect downstream systems like databases from too many connections during spikes.',
        },
      ],
      spoken: `"First I make sure the app listens on process.env.PORT and is stateless. I write a slim Node Dockerfile, build it tagged with the git SHA, and push it to Artifact Registry. Then I run gcloud run deploy with a dedicated service account, env vars, secrets mounted from Secret Manager, and scaling settings: min instances of one for latency and a max to protect the database. Each deploy creates a revision, so I can do canary traffic splits and instant rollbacks. Finally I move all of this into GitHub Actions using Workload Identity Federation instead of JSON keys."`,
      mistakes: [
        'Building the image on an Apple Silicon Mac without `--platform linux/amd64` and getting "exec format error" on Cloud Run.',
        'Putting secrets in `--set-env-vars` (visible in the console and revision history) instead of `--set-secrets`.',
        'Downloading a service-account JSON key for CI instead of using Workload Identity Federation.',
        'Follow-up trap: "The deploy fails with \'container failed to start and listen on the port\' — why?" The app listens on a hard-coded port or on `localhost` only, crashes on startup (missing env/secret), or takes too long to start.',
      ],
      takeaway: 'Container on $PORT → Artifact Registry → gcloud run deploy with a service account and Secret Manager → revisions give canaries and rollbacks.',
    },
    {
      id: 'kubernetes-core',
      title: 'Kubernetes Basics: Pod, Deployment and Service',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Kubernetes runs and heals containers across many machines. Pods run containers, Deployments manage replicas and rollouts, Services give a stable address.',
      what: `**Kubernetes** (K8s) is a system that runs containers across a group of machines (a **cluster**) and keeps them in the state you describe. You write YAML saying "I want 3 copies of this image", and K8s makes it true — and keeps it true if a container or machine dies.

- **Pod:** the smallest unit. One (sometimes more) containers that share a network and storage. Pods are temporary and get new IPs when recreated.
- **Deployment:** manages a set of identical pods (**replicas**). Handles **rolling updates** and rollbacks.
- **Service:** a stable name and IP in front of a changing set of pods, with load balancing. Other apps call \`http://orders-api\`, not pod IPs.
- **Node:** a worker machine (VM) that runs pods. **Namespace:** a folder to group resources (\`staging\`, \`prod\`).

#### Deeper version
- K8s is **declarative**: you declare the desired state, and **controllers** run a loop: observe → compare → act (reconciliation).
- The **control plane** (API server, etcd, scheduler, controller manager) decides; the **kubelet** on each node runs the pods. Managed services (EKS, GKE, AKS) run the control plane for you.
- Deployment → **ReplicaSet** → Pods. A rolling update creates a new ReplicaSet and shifts pods gradually (\`maxSurge\`, \`maxUnavailable\`).
- Service types: **ClusterIP** (internal only, default), **NodePort**, **LoadBalancer** (creates a cloud load balancer). HTTP routing from outside usually goes through an **Ingress**.
- Services find pods by **labels** (\`selector: app: orders-api\`).
- **Requests/limits:** \`requests\` reserve CPU/memory for scheduling; \`limits\` cap usage (going over the memory limit gets the container **OOMKilled**).
- **HPA** (Horizontal Pod Autoscaler) scales replicas by CPU or custom metrics.`,
      why: `When you have many services and need self-healing, rolling deploys, autoscaling and the same platform on any cloud, Kubernetes gives a standard way to do it. Many larger companies run everything on EKS or GKE, so interviewers expect the basics.`,
      analogy: `Kubernetes is an airport control tower. You tell it "I need 3 flights to Delhi every hour" (desired state). It assigns planes (pods) to runways (nodes). If a plane breaks, it brings in another. The **Service** is the flight number — passengers book "AI-101" and do not care which physical plane flies it.`,
      code: [
        {
          title: 'Deployment + Service for a Node API',
          lang: 'yaml',
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-api
spec:
  replicas: 3
  selector:
    matchLabels: { app: orders-api }
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }  # never go below 3 ready pods
  template:
    metadata:
      labels: { app: orders-api }
    spec:
      containers:
        - name: api
          image: myrepo/orders-api:3f9a1c2
          ports: [{ containerPort: 3000 }]
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits: { memory: 256Mi }
---
apiVersion: v1
kind: Service
metadata:
  name: orders-api
spec:
  type: ClusterIP
  selector: { app: orders-api }   # send traffic to pods with this label
  ports:
    - port: 80          # the Service port other apps call
      targetPort: 3000  # the container port`,
        },
        {
          title: 'Everyday kubectl commands',
          lang: 'bash',
          code: `kubectl apply -f orders-api.yaml                      # create or update
kubectl get pods -l app=orders-api                     # list pods
kubectl describe pod orders-api-7d9f8-abcde            # events: why it is not starting
kubectl logs -f deploy/orders-api                      # logs
kubectl set image deploy/orders-api api=myrepo/orders-api:9e8d7c6   # rolling update
kubectl rollout status deploy/orders-api
kubectl rollout undo deploy/orders-api                 # roll back
kubectl scale deploy/orders-api --replicas=5
kubectl port-forward svc/orders-api 8080:80            # test locally`,
        },
      ],
      output: `\`kubectl apply\` creates 3 pods running the image and a Service called \`orders-api\`. Inside the cluster, any pod can call \`http://orders-api\` (port 80), and K8s load-balances to one of the 3 pods on port 3000. If a pod crashes, the Deployment creates a new one. \`set image\` starts a rolling update: one extra new pod comes up, becomes ready, then one old pod is removed, and so on — never fewer than 3 ready pods. If the new version is bad, \`rollout undo\` goes back to the previous ReplicaSet.`,
      questions: [
        {
          q: 'What is the difference between a Pod, a Deployment and a Service?',
          a: 'A Pod runs containers and is temporary. A Deployment keeps the desired number of identical pods running and manages rolling updates. A Service gives those changing pods one stable name/IP and load-balances between them.',
        },
        {
          q: 'Why not just create pods directly?',
          a: 'A bare pod is not recreated if it dies or its node fails, and has no rolling updates. Deployments (via ReplicaSets) give self-healing, scaling and rollouts.',
        },
        {
          q: 'What are resource requests and limits?',
          a: 'Requests are what the scheduler reserves for the pod. Limits are the maximum it can use. Exceeding the memory limit kills the container (OOMKilled); exceeding the CPU limit throttles it.',
        },
        {
          q: 'ClusterIP vs NodePort vs LoadBalancer?',
          a: 'ClusterIP is internal only. NodePort opens a port on every node. LoadBalancer provisions a cloud load balancer with an external IP. For HTTP from outside, an Ingress in front of ClusterIP services is common.',
        },
      ],
      spoken: `"Kubernetes is a container orchestrator: I declare the desired state in YAML and controllers keep the cluster matching it. A pod is the smallest unit, one or more containers sharing a network, and pods are temporary. A Deployment manages identical pod replicas, heals them and does rolling updates and rollbacks. A Service gives a stable DNS name and load-balances to pods selected by labels, so other services call orders-api instead of pod IPs. I set resource requests and limits, and use an HPA for autoscaling. On cloud I'd use a managed control plane like EKS or GKE."`,
      mistakes: [
        'No resource requests/limits, so one memory-hungry pod starves others on the node.',
        'Service selector labels not matching pod labels — the Service has no endpoints and requests fail.',
        'Using `:latest` image tags, so `kubectl apply` does not trigger a rollout and you cannot tell which version runs.',
        'Follow-up trap: "A pod is in CrashLoopBackOff — how do you debug?" `kubectl describe pod` for events, `kubectl logs --previous` for the crashed container\'s logs, check env/config/secrets, probes and the OOMKilled reason.',
      ],
      takeaway: 'Pods run containers, Deployments keep the right number running and roll them out, Services give them one stable address.',
    },
    {
      id: 'twelve-factor-app',
      title: 'The Twelve-Factor App and Stateless Services',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Twelve-Factor is a checklist for cloud-ready apps: config in env, stateless processes, logs to stdout, disposable processes, dev/prod parity.',
      what: `The **Twelve-Factor App** is a famous set of 12 rules for building apps that deploy and scale well in the cloud. The most asked ones:

- **Config in the environment:** URLs and keys come from env variables, not code.
- **Stateless processes:** do not keep user data in memory or on local disk between requests. Use a DB, Redis or S3.
- **Backing services as attached resources:** the database is just a URL; swapping it needs no code change.
- **Build, release, run:** build an artifact once, combine it with config to make a release, then run it.
- **Logs as event streams:** write logs to **stdout**; the platform collects them.
- **Disposability:** start fast and shut down gracefully on \`SIGTERM\`.
- **Dev/prod parity:** keep environments as similar as possible.

#### Deeper version
The full list: 1) one codebase in version control, many deploys; 2) explicitly declared dependencies (\`package.json\` + lockfile); 3) config in env; 4) backing services as attached resources; 5) separate build/release/run stages; 6) stateless processes; 7) port binding (the app serves HTTP itself on a port); 8) concurrency by running more processes; 9) disposability; 10) dev/prod parity; 11) logs as streams; 12) admin tasks (migrations, scripts) run as one-off processes with the same code and config.

Statelessness is what makes horizontal scaling, rolling deploys and auto scaling safe: any instance can serve any request, and any instance can die at any time.`,
      why: `Platforms like Kubernetes, Cloud Run, ECS and Heroku assume these rules. If your app writes uploads to local disk or keeps sessions in memory, it breaks as soon as there are two instances or a redeploy. Following Twelve-Factor makes an app "cloud-native" by default.`,
      analogy: `A twelve-factor app is like a well-trained relief worker at a call center. Any worker can take any call because customer history is in the shared system, not in a worker's head (stateless). Instructions come from the shift sheet (config), not tattoos (hard-coded values). Workers can join or leave any shift without drama (disposability).`,
      code: [
        {
          title: 'From stateful to stateless sessions',
          lang: 'javascript',
          code: `import express from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';  // export style varies by connect-redis version
import { createClient } from 'redis';

const app = express();

// BAD (default MemoryStore): sessions live in this process only.
// With 2 instances, users get logged out randomly; a restart logs everyone out.

// GOOD: sessions live in Redis, shared by all instances
const redis = createClient({ url: process.env.REDIS_URL }); // config from env
await redis.connect();

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true, sameSite: 'lax' },
}));

app.listen(Number(process.env.PORT) || 3000); // port binding from env
console.log(JSON.stringify({ level: 'info', msg: 'started' })); // logs to stdout`,
        },
      ],
      output: `With the default memory store, a user who logs in on instance A and whose next request lands on instance B appears logged out. After the change, every instance reads sessions from the same Redis, so any instance can serve any request, deploys do not log users out, and the app can scale horizontally. Redis URL, session secret and port all come from env variables, and logs go to stdout for the platform to collect. (The exact import of \`RedisStore\` differs between \`connect-redis\` versions — check the version you install.)`,
      questions: [
        {
          q: 'What does "stateless service" mean and why does it matter?',
          a: 'The process keeps no client data between requests in memory or local disk. All state lives in external stores. Then any instance can serve any request, which makes scaling, load balancing and replacing instances safe.',
        },
        {
          q: 'Name some Twelve-Factor principles you follow.',
          a: 'Config in env vars, stateless processes, logs to stdout, graceful shutdown, build once and promote, declared dependencies with lockfiles, and dev/prod parity with Docker.',
        },
        {
          q: 'Where should an app write its logs in a container?',
          a: 'To stdout/stderr. The platform (Docker, Kubernetes, CloudWatch, Cloud Logging) collects and ships them. Writing to local files fills disks and is lost with the container.',
        },
      ],
      spoken: `"The Twelve-Factor App is a checklist for cloud-native services. The ones I apply every day are: config in environment variables, stateless processes with state in a database, Redis or S3, logs written to stdout, fast startup and graceful shutdown on SIGTERM, building once and promoting the same artifact, and dev/prod parity using Docker. Statelessness is the big one — it's what lets me run many instances behind a load balancer, autoscale and deploy without logging users out."`,
      mistakes: [
        'Using the default in-memory session store or local file uploads in production.',
        'Writing logs to files inside the container that nobody collects.',
        'Running database migrations automatically on every instance at startup, so several instances race each other; run them as a one-off release step.',
        'Follow-up trap: "Is an in-memory cache allowed in a stateless app?" Yes, as long as it is only an optimization that can be lost at any time and does not need to be consistent across instances.',
      ],
      takeaway: 'Config in env, state outside the process, logs to stdout, start fast and stop gracefully — and your app is ready to scale.',
    },
    {
      id: 'terraform-iac',
      title: 'Terraform and Infrastructure as Code',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'IaC describes your cloud resources in code files, so infrastructure is versioned, reviewed and reproducible. Terraform plans changes, then applies them.',
      what: `**Infrastructure as Code (IaC)** means you create cloud resources (buckets, databases, Lambdas, networks) by writing code files instead of clicking in the console.

**Terraform** is the most popular IaC tool. You write \`.tf\` files in **HCL** (HashiCorp Configuration Language). Then:
- \`terraform init\` — download **providers** (plugins for AWS, GCP, etc.).
- \`terraform plan\` — show what will be created, changed or destroyed.
- \`terraform apply\` — make the changes.

Terraform is **declarative**: you describe the end result; it figures out the steps.

#### Deeper version
- **State:** Terraform keeps a **state file** that maps your code to real resource IDs. In teams, store it in a **remote backend** (S3, GCS, Terraform Cloud) with **locking** so two people cannot apply at once. Older S3 setups used a DynamoDB table for locking; newer Terraform versions support S3-native locking — check the docs for your version. State can contain secrets, so encrypt it and restrict access.
- **Drift:** someone changes a resource by hand; \`plan\` shows the difference.
- **Modules** are reusable groups of resources (a "service" module used by dev, staging and prod).
- **Variables** and **outputs** pass values in and out. Separate environments with separate state (folders or workspaces).
- **Lifecycle** rules like \`prevent_destroy\` protect critical resources such as databases.
- Alternatives: **AWS CDK** (write infrastructure in TypeScript), CloudFormation/SAM, Pulumi, OpenTofu (an open-source fork of Terraform).
- In CI: run \`fmt\`, \`validate\` and \`plan\` on pull requests; \`apply\` only after review on main.`,
      why: `Clicking in the console is not repeatable, not reviewed, and nobody remembers what was changed. With IaC you can rebuild a whole environment in minutes, review infra changes in pull requests, keep staging and prod identical, and see history in Git.`,
      analogy: `IaC is an architect's blueprint instead of telling builders from memory. The blueprint is versioned, others can review it, and you can build the exact same house in another city (another region or environment). The **state file** is the builder's record of which blueprint item matches which real wall.`,
      code: [
        {
          title: 'main.tf — S3 bucket + Lambda role with remote state',
          lang: 'hcl',
          code: `terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {                       # shared, remote state
    bucket = "acme-terraform-state"
    key    = "orders/prod/terraform.tfstate"
    region = "ap-south-1"
    encrypt = true
  }
}

provider "aws" {
  region = var.region
}

variable "region" { default = "ap-south-1" }
variable "env"    { type = string }

resource "aws_s3_bucket" "uploads" {
  bucket = "acme-orders-uploads-\${var.env}"
  tags   = { env = var.env, team = "orders" }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_role" "lambda" {
  name = "orders-lambda-\${var.env}"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = "sts:AssumeRole", Principal = { Service = "lambda.amazonaws.com" } }]
  })
}

output "uploads_bucket" { value = aws_s3_bucket.uploads.bucket }`,
        },
        {
          title: 'The workflow',
          lang: 'bash',
          code: `terraform init                         # providers + remote backend
terraform fmt -check && terraform validate
terraform plan -var="env=prod" -out=plan.tfplan
# Plan: 3 to add, 0 to change, 0 to destroy.
terraform apply plan.tfplan            # applies exactly what was planned
terraform output uploads_bucket        # acme-orders-uploads-prod`,
        },
      ],
      output: `\`init\` downloads the AWS provider and connects to the S3 state backend. \`plan\` compares the code to the state and real AWS, and prints "3 to add" (bucket, public-access block, role). \`apply plan.tfplan\` creates exactly those three. Running \`plan\` again shows "No changes" — Terraform is idempotent. If someone later makes the bucket public by hand, the next \`plan\` shows that drift and \`apply\` fixes it. Note that \`\${var.env}\` here is Terraform's own interpolation, not JavaScript.`,
      questions: [
        {
          q: 'What is Infrastructure as Code and why use it?',
          a: 'Defining infrastructure in version-controlled code instead of manual clicks. It gives repeatability, code review, history, consistent environments and fast disaster recovery.',
        },
        {
          q: 'What is the Terraform state file and how do teams manage it?',
          a: 'It maps resources in code to real cloud IDs. Teams keep it in a remote, encrypted backend (S3/GCS/Terraform Cloud) with locking, and never edit it by hand or commit it to Git.',
        },
        {
          q: 'What is the difference between terraform plan and apply?',
          a: '`plan` shows the changes Terraform would make without doing them. `apply` performs them. Saving the plan with `-out` and applying that file guarantees you apply exactly what was reviewed.',
        },
        {
          q: 'Declarative vs imperative IaC?',
          a: 'Declarative (Terraform, CloudFormation): you describe the desired end state and the tool works out the steps. Imperative: you write the step-by-step commands (scripts). Declarative handles drift and re-runs safely.',
        },
      ],
      spoken: `"Infrastructure as Code means my cloud resources are defined in versioned files instead of console clicks. With Terraform I write HCL describing the desired state, run plan to preview the changes, and apply to make them. Terraform tracks reality in a state file, which in a team lives in a remote encrypted backend like S3 with locking. I use modules for reusable pieces, variables for each environment and separate state per environment. In CI, pull requests run fmt, validate and plan, and apply only runs after review. It makes environments reproducible and changes reviewable."`,
      mistakes: [
        'Keeping the state file locally or in Git — teammates overwrite each other and secrets leak.',
        'Changing resources by hand in the console after they are managed by Terraform, causing drift.',
        'Running `apply` without reading the plan and missing a "destroy" of a database (protect with `prevent_destroy`).',
        'Follow-up trap: "How do you bring an existing manually-created resource under Terraform?" Use `terraform import` (or an `import` block in newer versions), then write matching config until `plan` shows no changes.',
      ],
      takeaway: 'Infrastructure lives in code: plan, review, apply — with remote, locked, encrypted state.',
    },
    {
      id: 'lambda-concurrency-cold-starts',
      title: 'Lambda Concurrency (Reserved and Provisioned) and Cold Starts',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Concurrency = how many requests run at the same moment. Reserved concurrency caps/guarantees it; provisioned concurrency pre-warms environments to remove cold starts.',
      what: `**Concurrency** is the number of Lambda requests running **at the same moment**. Since one execution environment handles one request at a time, 50 concurrent requests need 50 environments.

A quick formula: **concurrency ≈ requests per second × average duration in seconds**. 100 req/s × 0.5 s = about 50 concurrent.

A **cold start** happens when Lambda must create a new environment: download your code, start the runtime, run your init code (outside the handler). That adds latency — often a few hundred ms for Node, more with big bundles or inside a VPC with heavy init. A **warm start** reuses an existing environment and skips all that.

Two settings control concurrency:
- **Reserved concurrency:** sets aside N from the account pool for this function **and** caps it at N. Setting it to 0 stops the function from running.
- **Provisioned concurrency:** keeps N environments **already initialized** and waiting, so those requests have no cold start. You pay for them even when idle.

#### Deeper version
- Each account has a **regional concurrency quota** (often 1,000 by default; it can be raised). All functions share it, so one runaway function can **throttle** the others. Reserved concurrency protects critical functions and also limits noisy ones.
- When the limit is hit, synchronous calls get **429 TooManyRequestsException** (throttling); async events are retried for a while; SQS messages stay in the queue.
- There is also a **scaling rate** limit: Lambda can only add new environments so fast per function. Check current docs — AWS changed this rule in recent years.
- Provisioned concurrency is set on a **version or alias**, not \`$LATEST\`, and can be auto scaled on a schedule or by utilization.
- **Reducing cold starts without paying:** smaller bundles (esbuild, tree shaking, AWS SDK v3 modular imports), lazy-load rarely used modules, fewer heavy init steps, more memory (more CPU speeds up init), and avoid giant frameworks. **SnapStart** helps by snapshotting the initialized environment; language support has expanded over time, so check whether your runtime is supported.
- Use reserved concurrency (or SQS event source **maximum concurrency**) to **protect downstream systems** like a SQL database from too many parallel connections.`,
      why: `This is where serverless meets real production: a Black Friday spike can throttle your checkout because a reporting function used up the account limit, or a cold start makes the first payment request slow. Knowing these knobs lets you guarantee capacity, protect databases and hit latency targets.`,
      analogy: `Think of a taxi company with 1,000 drivers for the whole city (the account limit). **Reserved concurrency** is saying "50 drivers belong to the airport route only — never more, never less available". **Provisioned concurrency** is paying 10 drivers to sit in running cars at the airport, engines on, so the next passengers leave instantly instead of waiting for a driver to arrive and start the car (cold start).`,
      code: [
        {
          title: 'Reserved and provisioned concurrency with the CLI',
          lang: 'bash',
          code: `# Cap the reporting function at 20 so it can never starve checkout
aws lambda put-function-concurrency --function-name nightly-report --reserved-concurrent-executions 20

# Guarantee checkout always has up to 200 available
aws lambda put-function-concurrency --function-name checkout --reserved-concurrent-executions 200

# Pre-warm 25 environments on the "live" alias to remove cold starts
aws lambda publish-version --function-name checkout
aws lambda update-alias --function-name checkout --name live --function-version 7
aws lambda put-provisioned-concurrency-config --function-name checkout --qualifier live --provisioned-concurrent-executions 25`,
        },
        {
          title: 'Keeping cold starts small in a Node handler',
          lang: 'javascript',
          code: `// Import only the client you need (SDK v3 is modular)
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// Init phase: runs once per cold start. Keep it light.
const db = new DynamoDBClient({});
let pdfLib; // heavy library, only some requests need it

export const handler = async (event) => {
  if (event.rawPath === '/invoice.pdf') {
    // Lazy-load: only pay the import cost when this path is hit
    pdfLib ??= await import('pdfkit');
    // ... build the PDF ...
  }
  return { statusCode: 200, body: 'ok' };
};`,
        },
      ],
      output: `\`nightly-report\` can now run at most 20 copies at once — even in a bug loop it cannot use the whole account pool. \`checkout\` always has 200 slots reserved for it (and cannot exceed 200; request number 201 at the same moment is throttled). On the \`live\` alias, 25 environments stay initialized: the first 25 concurrent requests never see a cold start; above that, Lambda creates normal on-demand environments that do have cold starts.

In the handler, only the small DynamoDB client loads during init. The heavy PDF library is imported the first time someone asks for a PDF, and then stays cached in that warm environment.`,
      questions: [
        {
          q: 'What is the difference between reserved and provisioned concurrency?',
          a: 'Reserved concurrency guarantees and caps how many concurrent executions a function can have, and costs nothing extra. Provisioned concurrency keeps a number of environments pre-initialized to remove cold starts, and you pay for it while it is configured.',
        },
        {
          q: 'What causes cold starts and how do you reduce them?',
          a: 'Creating a new execution environment: loading code, starting the runtime and running init code. Reduce them with smaller bundles, lazy imports, light init, more memory, provisioned concurrency, or SnapStart where supported.',
        },
        {
          q: 'How do you calculate the concurrency you need?',
          a: 'Requests per second times average duration in seconds. 200 req/s with 250 ms average needs about 50 concurrent executions.',
        },
        {
          q: 'What happens when a Lambda hits its concurrency limit?',
          a: 'Synchronous invocations are throttled with a 429 error; asynchronous ones are retried automatically for some time; SQS-triggered ones wait in the queue. The `Throttles` metric goes up.',
        },
        {
          q: 'How do you stop Lambda from overwhelming your database?',
          a: 'Cap concurrency with reserved concurrency or SQS maximum concurrency, use RDS Proxy for pooling, and buffer writes through a queue.',
        },
      ],
      spoken: `"Concurrency is how many Lambda requests run at the same time, roughly requests per second times duration. All functions in a region share an account quota, so I use reserved concurrency to both guarantee capacity for critical functions like checkout and cap noisy ones like reports — it also protects databases from too many connections. Cold starts happen when Lambda creates a new environment. I reduce them with small esbuild bundles, modular SDK imports, lazy loading and light init code. When latency really matters, I add provisioned concurrency on an alias, which keeps environments pre-warmed but costs money even when idle."`,
      mistakes: [
        'Thinking reserved concurrency removes cold starts. It does not; only provisioned concurrency (or SnapStart, where supported) pre-initializes environments.',
        'Setting provisioned concurrency on `$LATEST` — it must be on a published version or alias.',
        'Using "warm-up pings" every 5 minutes as a cold-start fix; they keep only one environment warm and do nothing for concurrent spikes.',
        'Follow-up trap: "You set reserved concurrency to 0 — what happens?" The function is throttled completely; it is a quick "kill switch" for a misbehaving function.',
      ],
      takeaway: 'Reserved concurrency = guaranteed and capped slots; provisioned concurrency = paid, pre-warmed slots with no cold start.',
    },
    {
      id: 'docker-multistage-optimization',
      title: 'Docker Multi-stage Builds, Layer Caching and Image Size',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Order Dockerfile steps so dependency layers are cached, use multi-stage builds to ship only runtime files, and pick small base images.',
      what: `**Layer caching:** each Dockerfile instruction creates a layer. Docker reuses a cached layer if the instruction and its input files did not change. **Once one layer changes, every layer after it is rebuilt.** So put things that change rarely (installing dependencies) **before** things that change often (your source code).

**Multi-stage builds:** use several \`FROM\` lines in one Dockerfile. An early "build" stage has all the tools (TypeScript, dev dependencies); the final stage copies **only** the output (\`dist\` and production \`node_modules\`). Tools and source never reach the final image.

**Small images** download faster, start faster, cost less to store and have fewer security vulnerabilities.

#### Deeper version
- **Base image choice:** \`node:20\` (Debian, large, ~1 GB), \`node:20-slim\` (smaller Debian), \`node:20-alpine\` (very small, uses musl libc — some native modules like \`sharp\` or \`bcrypt\` may need extra care), **distroless** (no shell or package manager — very secure, harder to debug).
- **.dockerignore** keeps \`node_modules\`, \`.git\`, \`.env\`, logs and test files out of the build context. Without it, \`COPY . .\` sends everything and busts the cache on every change.
- Combine related \`RUN\` steps and clean caches in the **same** layer — deleting files in a later layer does not shrink the image.
- **BuildKit cache mounts** (\`RUN --mount=type=cache,target=/root/.npm npm ci\`) keep the npm cache between builds without putting it in the image.
- Run as a **non-root user**, pin base image versions, and scan images (Docker Scout, Trivy, ECR scanning).
- In CI, reuse cache across runs with registry or GitHub Actions cache (\`docker/build-push-action\` with \`cache-from\`/\`cache-to\`).
- Use \`docker history <image>\` to see which layer is big.`,
      why: `A naive Node Dockerfile can be 1+ GB, rebuild everything on any code change, and ship your TypeScript compiler and test tools to production. Optimized builds take seconds instead of minutes, images are often 5-10x smaller, deploys and scaling are faster, and the attack surface is much smaller.`,
      analogy: `Multi-stage builds are like a restaurant kitchen and the plate. The kitchen (build stage) has knives, pans and flour everywhere. The customer only gets the finished plate (final stage) — not the whole kitchen. Layer caching is like meal prep: if the sauce recipe did not change, you reuse yesterday's sauce instead of cooking it again.`,
      code: [
        {
          title: 'Multi-stage Dockerfile for a TypeScript Node API',
          lang: 'dockerfile',
          code: `# syntax=docker/dockerfile:1

# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app
# Dependencies first: this layer is cached until package files change
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
# Source changes often -> copied after deps
COPY tsconfig.json ./
COPY src ./src
RUN npm run build            # outputs to /app/dist
RUN npm prune --omit=dev     # remove devDependencies (typescript, jest, ...)

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Copy only what is needed to run
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]`,
        },
        {
          title: '.dockerignore and checking the result',
          lang: 'bash',
          code: `# .dockerignore
cat > .dockerignore <<'EOF'
node_modules
dist
.git
.env*
coverage
*.log
Dockerfile
EOF

docker build -t orders-api:slim .
docker images orders-api        # compare sizes of tags
docker history orders-api:slim  # see the size of each layer`,
        },
      ],
      output: `The first build installs everything and compiles TypeScript. If you then change only a file in \`src/\`, Docker reuses the cached \`npm ci\` layer and only re-runs \`COPY src\`, the build and later steps — the build goes from minutes to seconds. The final image contains Alpine, Node, production \`node_modules\` and \`dist\` only: no TypeScript, no tests, no source, no npm cache. A typical result is something like 150-250 MB instead of over 1 GB for a naive \`node:20\` image (exact numbers depend on your dependencies). \`docker history\` shows which layer is biggest if you want to cut more.`,
      questions: [
        {
          q: 'How does Docker layer caching work?',
          a: 'Each instruction makes a layer. Docker reuses a layer if the instruction and its inputs are unchanged. When one layer changes, all layers after it are rebuilt, so put rarely-changing steps (dependency install) before frequently-changing ones (source code).',
        },
        {
          q: 'What is a multi-stage build and why use it?',
          a: 'A Dockerfile with several `FROM` stages. You build in a stage with all tools and copy only the final artifacts into a small runtime stage. The result is smaller, faster and more secure.',
        },
        {
          q: 'How do you reduce a Node image size?',
          a: 'Use slim/alpine/distroless bases, multi-stage builds, `npm ci --omit=dev` or `npm prune`, a good `.dockerignore`, clean up in the same `RUN` layer, and check `docker history` for big layers.',
        },
        {
          q: 'Why does deleting files in a later RUN not shrink the image?',
          a: 'Layers are stacked. The earlier layer still contains the files; the later layer just hides them. Delete in the same `RUN` that created them, or use multi-stage builds.',
        },
      ],
      spoken: `"I optimize Docker images in three ways. First, layer caching: I copy package.json and the lockfile and run npm ci before copying the source, so code changes don't reinstall dependencies. Second, multi-stage builds: a build stage with TypeScript and dev dependencies compiles the app, and the final stage copies only dist and production node_modules onto a slim or alpine base, running as a non-root user. Third, a proper .dockerignore so node_modules, .git and env files never enter the build context. That usually takes images from over a gigabyte to a couple hundred megabytes and makes builds much faster."`,
      mistakes: [
        '`COPY . .` before `npm ci`, so every code change reinstalls all dependencies.',
        'No `.dockerignore`, so local `node_modules` (built for macOS) and `.env` secrets end up in the image.',
        'Switching to Alpine and getting runtime errors from native modules compiled for glibc; test, or use `-slim`.',
        'Follow-up trap: "Can secrets passed as build ARGs leak?" Yes — build args and copied files can be seen in image history and layers. Use BuildKit secret mounts (`--mount=type=secret`) and runtime env vars instead.',
      ],
      takeaway: 'Dependencies before source for caching, build in one stage and ship only artifacts in another, and keep the base small.',
    },
    {
      id: 'github-actions-advanced',
      title: 'GitHub Actions: Matrix, Caching and a Deploy Job',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Use a matrix to test many versions in parallel, cache dependencies and Docker layers, and gate a deploy job with needs, environments and OIDC.',
      what: `Once basic CI works, three features make pipelines fast and safe:

- **Matrix:** run the same job with different values in parallel — e.g. Node 18, 20 and 22, or several OSes — from one definition.
- **Caching:** save things like the npm cache or Docker layers between runs, so installs and builds are faster.
- **Deploy job:** a job that runs only after tests pass (\`needs\`), only on \`main\`, in a protected **environment**, and authenticates to the cloud with **OIDC** instead of stored keys.

#### Deeper version
- \`strategy.matrix\` creates one job per combination; \`fail-fast: false\` lets the others finish if one fails; \`include\`/\`exclude\` add or remove combinations.
- \`actions/setup-node\` with \`cache: npm\` caches the **npm download cache** (keyed by the lockfile hash), not \`node_modules\`. \`actions/cache\` gives full control: a \`key\` (exact match) and \`restore-keys\` (fallback prefixes).
- Docker: \`docker/build-push-action\` with \`cache-from: type=gha\` and \`cache-to: type=gha,mode=max\` reuses layers across runs.
- **OIDC:** the job requests a short-lived token from GitHub (\`permissions: id-token: write\`), and AWS/GCP trusts it to assume a role. The cloud role's trust policy should restrict the repo and branch (the \`sub\` claim).
- **Environments** can require reviewers, restrict which branches deploy, and hold environment-specific secrets.
- **Concurrency** on the deploy job (\`cancel-in-progress: false\`) ensures deploys run one at a time and are not cancelled mid-way.
- Reusable workflows (\`workflow_call\`) and composite actions remove duplication across repos.
- Tag images with the **commit SHA** so you can trace and roll back exactly.`,
      why: `Testing on every supported Node version catches compatibility bugs early. Caching can cut pipeline time a lot, which keeps developers fast. A gated deploy job with OIDC means production only gets tested code, with an approval step if needed, and no long-lived cloud keys that could leak.`,
      analogy: `A matrix is like a taste test where the same recipe is cooked by three chefs at once on different stoves. Caching is keeping chopped vegetables in the fridge for tomorrow. The deploy job is the final security gate at the airport: you only reach it after check-in and baggage pass (needs), and the boarding pass (OIDC token) is valid only for this one flight.`,
      code: [
        {
          title: '.github/workflows/pipeline.yml — matrix test, build, deploy to Cloud Run',
          lang: 'yaml',
          code: `name: Pipeline
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test

  deploy:
    needs: test                                  # only after ALL matrix jobs pass
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production                      # can require manual approval
    concurrency:
      group: deploy-production
      cancel-in-progress: false                  # never cancel a running deploy
    permissions:
      contents: read
      id-token: write                            # needed for OIDC
    env:
      IMAGE: asia-south1-docker.pkg.dev/my-shop-prod/services/orders-api:\${{ github.sha }}
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2      # OIDC -> short-lived GCP credentials
        with:
          workload_identity_provider: \${{ secrets.GCP_WIF_PROVIDER }}
          service_account: deployer@my-shop-prod.iam.gserviceaccount.com
      - uses: google-github-actions/setup-gcloud@v2
      - run: gcloud auth configure-docker asia-south1-docker.pkg.dev --quiet
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: \${{ env.IMAGE }}
          cache-from: type=gha                   # reuse Docker layers from earlier runs
          cache-to: type=gha,mode=max
      - run: gcloud run deploy orders-api --image "\${{ env.IMAGE }}" --region asia-south1 --quiet`,
        },
      ],
      output: `On a pull request, three test jobs run in parallel (Node 18, 20, 22) with the npm cache restored; the deploy job is skipped because of the \`if\`. On a push to \`main\`, after all three pass, the deploy job waits for approval if the \`production\` environment requires it. It then gets short-lived GCP credentials through OIDC (no JSON key stored anywhere), builds the image reusing cached layers, pushes it tagged with the commit SHA, and deploys that exact image to Cloud Run. Two quick merges produce deploys that run one after the other, never in parallel. Rolling back means redeploying an earlier SHA tag. (Action major versions change over time — check each action's README for the current version.)`,
      questions: [
        {
          q: 'What is a matrix build?',
          a: 'One job definition that GitHub expands into parallel jobs for each combination of values, such as several Node versions or operating systems.',
        },
        {
          q: 'How do you speed up a slow GitHub Actions pipeline?',
          a: 'Cache the npm cache (setup-node `cache: npm`) and Docker layers (`type=gha`), run independent jobs in parallel, split tests across a matrix, skip unchanged paths with `paths` filters, and cancel outdated runs with `concurrency`.',
        },
        {
          q: 'How should the deploy job authenticate to AWS or GCP?',
          a: 'With OIDC: grant `id-token: write`, and let the cloud trust GitHub\'s token to assume a role (AWS `configure-aws-credentials`, GCP Workload Identity Federation), restricted to the repo and branch. No long-lived keys.',
        },
        {
          q: 'How do you make sure only tested code is deployed?',
          a: 'Make the deploy job `needs` the test jobs, run it only on main, use branch protection for required checks, and deploy the exact image built from that commit (tagged with the SHA).',
        },
      ],
      spoken: `"For a production pipeline I run tests in a matrix across the Node versions we support, in parallel, with fail-fast off so I see every failure. I cache the npm cache via setup-node and Docker layers with the GitHub Actions cache backend. The deploy job needs the test jobs, only runs on pushes to main, uses a protected production environment with optional approval, and authenticates to the cloud with OIDC so there are no stored keys. It builds an image tagged with the commit SHA, pushes it and deploys that exact image, with a concurrency group so deploys never overlap."`,
      mistakes: [
        'Caching `node_modules` directly with a weak key and getting stale or platform-mismatched dependencies; cache the npm cache keyed by the lockfile hash.',
        'Forgetting `permissions: id-token: write`, so OIDC authentication fails with a confusing error.',
        'Deploying on pull requests or from any branch because there is no `if` or environment branch rule.',
        'Follow-up trap: "Two merges land 30 seconds apart — what can go wrong?" Two deploys can race and the older one may finish last. Use a concurrency group for the deploy job and tag by SHA.',
      ],
      takeaway: 'Matrix for coverage, caches for speed, and a gated, OIDC-authenticated deploy job that ships the exact tested image.',
    },
    {
      id: 'kubernetes-config-ingress',
      title: 'Kubernetes: Ingress, ConfigMaps, Secrets and Probes',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Ingress routes outside HTTP traffic to Services; ConfigMaps and Secrets inject config; probes tell K8s when to restart or route traffic to pods.',
      what: `After pods, deployments and services, these four pieces make an app production-ready on Kubernetes:

- **Ingress:** rules that route external HTTP/HTTPS traffic to internal Services by host and path (\`api.shop.com/orders\` → \`orders-api\`). It needs an **Ingress controller** (like ingress-nginx or the AWS Load Balancer Controller) to actually work.
- **ConfigMap:** non-secret config (log level, feature flags) as key-value pairs, injected as env variables or files.
- **Secret:** sensitive values (DB passwords, API keys), injected the same way but handled more carefully.
- **Probes:** liveness, readiness and startup checks (see the Health Checks topic) that decide restarts and traffic.

#### Deeper version
- Ingress handles TLS termination with a certificate stored in a Secret (often managed automatically by **cert-manager** with Let's Encrypt). The newer **Gateway API** is the successor to Ingress with richer routing — check what your cluster supports.
- Env vars from ConfigMaps/Secrets are read **once at pod start**; changing them needs a rollout (\`kubectl rollout restart\`). Files mounted from them update automatically after a delay, but your app must re-read them.
- **Secrets are base64-encoded, not encrypted** by default. Enable encryption at rest for etcd, limit access with **RBAC**, and/or use the **External Secrets Operator** or the Secrets Store CSI driver to sync from AWS Secrets Manager / GCP Secret Manager.
- Never commit raw Secret YAML to Git; use sealed secrets or an external store.
- **HPA** works with these: scale \`orders-api\` between 3 and 20 replicas when CPU > 70%.
- A **PodDisruptionBudget** keeps a minimum of pods running during node upgrades.`,
      why: `You need a single, secure entry point for many services, a way to change config without rebuilding images, a safe way to inject secrets, and self-healing. These objects provide exactly that and are standard interview questions for anyone who has deployed to EKS or GKE.`,
      analogy: `Ingress is the building's front desk directing visitors to the right office by floor and room (host and path). A ConfigMap is the notice board with public instructions. A Secret is the locked key box at the desk. Probes are the security guard checking every hour that each office is open and the person inside is awake.`,
      code: [
        {
          title: 'ConfigMap, Secret and how the Deployment uses them',
          lang: 'yaml',
          code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: orders-config
data:
  LOG_LEVEL: info
  FEATURE_NEW_CHECKOUT: "true"
---
apiVersion: v1
kind: Secret
metadata:
  name: orders-secrets
type: Opaque
stringData:                     # written as plain text, stored base64-encoded
  MONGO_URL: mongodb+srv://user:pass@cluster/shop
---
# Inside the Deployment's container spec:
#   envFrom:
#     - configMapRef: { name: orders-config }
#     - secretRef:    { name: orders-secrets }
#   readinessProbe:
#     httpGet: { path: /readyz, port: 3000 }
#   livenessProbe:
#     httpGet: { path: /livez, port: 3000 }`,
        },
        {
          title: 'Ingress with TLS and path routing',
          lang: 'yaml',
          code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod   # auto TLS certificate
spec:
  ingressClassName: nginx
  tls:
    - hosts: [api.shop.com]
      secretName: api-shop-com-tls
  rules:
    - host: api.shop.com
      http:
        paths:
          - path: /orders
            pathType: Prefix
            backend:
              service: { name: orders-api, port: { number: 80 } }
          - path: /payments
            pathType: Prefix
            backend:
              service: { name: payments-api, port: { number: 80 } }`,
        },
      ],
      output: `Each \`orders-api\` pod starts with \`LOG_LEVEL=info\`, \`FEATURE_NEW_CHECKOUT=true\` and \`MONGO_URL\` as env variables. A request to \`https://api.shop.com/orders/42\` hits the ingress-nginx controller, which terminates TLS with the certificate cert-manager created, and forwards it to the \`orders-api\` Service on port 80; \`/payments/...\` goes to \`payments-api\`. Only pods whose readiness probe passes receive traffic, and stuck pods are restarted by the liveness probe. If you change \`LOG_LEVEL\` in the ConfigMap, run \`kubectl rollout restart deploy/orders-api\` so pods pick it up.`,
      questions: [
        {
          q: 'What is the difference between a Service and an Ingress?',
          a: 'A Service gives pods a stable internal address and load balancing (layer 4). An Ingress is layer 7 HTTP routing from outside the cluster to Services by host and path, with TLS; it needs an Ingress controller.',
        },
        {
          q: 'ConfigMap vs Secret?',
          a: 'Both store key-value config for pods. Secrets are meant for sensitive data, are base64-encoded, can be encrypted at rest and are restricted with RBAC. ConfigMaps are for non-sensitive settings.',
        },
        {
          q: 'You updated a ConfigMap but the app still uses the old value — why?',
          a: 'Env vars are read only when the pod starts. Restart the rollout, or mount the ConfigMap as a file and have the app reload it. Some teams add a config hash annotation so changes trigger a rollout automatically.',
        },
        {
          q: 'How do you manage secrets safely in Kubernetes?',
          a: 'Enable etcd encryption at rest, restrict RBAC, avoid committing Secret YAML, and sync from a cloud secret manager with External Secrets Operator or the CSI driver.',
        },
      ],
      spoken: `"To expose services I use an Ingress with an Ingress controller like ingress-nginx; it routes by host and path to ClusterIP Services and terminates TLS, usually with cert-manager. Config goes into ConfigMaps and sensitive values into Secrets, injected with envFrom or mounted as files. I remember that Secrets are only base64 by default, so I enable encryption at rest, lock down RBAC and often sync from AWS Secrets Manager with External Secrets. Env-based config needs a rollout restart to change. And every deployment gets readiness and liveness probes so traffic only reaches healthy pods."`,
      mistakes: [
        'Creating an Ingress resource with no Ingress controller installed — nothing happens.',
        'Believing base64 in Secrets is encryption and committing them to Git.',
        'Expecting ConfigMap env changes to apply to running pods without a restart.',
        'Follow-up trap: "Why do you get 503 from the Ingress for a new deployment?" The Service has no ready endpoints: wrong selector labels, wrong `targetPort`, or the readiness probe is failing.',
      ],
      takeaway: 'Ingress for the HTTP front door, ConfigMaps/Secrets for config, probes for health — and Secrets need real protection, not just base64.',
    },
    {
      id: 'blue-green-canary',
      title: 'Blue-Green and Canary Deployments',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Blue-green switches all traffic from the old stack to an identical new one at once; canary sends a small share of traffic to the new version first and grows it if metrics look good.',
      what: `These are strategies to release new versions **without downtime** and with an easy way back.

- **Rolling update:** replace instances a few at a time (the Kubernetes default). Simple, but old and new run together and rollback means rolling again.
- **Blue-green:** you run two identical environments. **Blue** is live. You deploy the new version to **green**, test it, then switch **all** traffic to green (load balancer or DNS switch). If something breaks, switch back to blue instantly.
- **Canary:** release the new version to a **small share** of traffic first (like 5%), watch error rates and latency, then increase to 25%, 50%, 100%. If metrics get worse, send everything back to the old version.

#### Deeper version
- **Blue-green pros:** instant cutover and instant rollback, full testing of green before users see it. **Cons:** double the resources during the switch, and all users move at once.
- **Canary pros:** limits the **blast radius** — a bug hits 5% of users, not 100%. **Cons:** needs good metrics, automation, and routing support; two versions run together for longer.
- **Database changes** are the hard part: both versions must work with the same database. Use **expand-and-contract** (backward-compatible) migrations: 1) add the new column, 2) deploy code that writes both, 3) backfill, 4) switch reads, 5) remove the old column in a later release.
- **Tools:** Lambda aliases with weighted traffic + CodeDeploy (\`Canary10Percent5Minutes\`, \`Linear10PercentEvery1Minute\`), ALB weighted target groups, Route 53 weighted records, Cloud Run revision traffic splits, Argo Rollouts / Flagger on Kubernetes, ECS blue/green with CodeDeploy.
- **Automated rollback:** tie the canary to CloudWatch alarms (error rate, p99) — if an alarm fires, the deploy rolls back by itself.
- **Feature flags** are a related idea: deploy code dark, then turn features on per user/percent without a deploy. Deploy ≠ release.`,
      why: `Most outages are caused by changes. These strategies make releases boring: users see no downtime, a bad version affects few people for a short time, and rollback takes seconds instead of a frantic redeploy.`,
      analogy: `**Blue-green** is like a theater with two identical stages: the new show is set up and rehearsed on stage B while the audience watches stage A, then the curtain opens on B. If B fails, you open A again. **Canary** comes from miners carrying a canary bird into the mine: a small, early warning. You let a few customers taste the new dish first; if they are happy, you serve it to everyone.`,
      code: [
        {
          title: 'Canary on Cloud Run: 10% to the new revision, then promote or roll back',
          lang: 'bash',
          code: `# Deploy the new revision WITHOUT sending it traffic
gcloud run deploy orders-api --image "$IMAGE" --region asia-south1 --no-traffic --tag canary

# Send 10% of traffic to the latest revision, 90% stays on the old one
gcloud run services update-traffic orders-api --region asia-south1 --to-revisions LATEST=10

# ...watch error rate and p99 latency for 15-30 minutes...

# Good: promote to 100%
gcloud run services update-traffic orders-api --region asia-south1 --to-latest

# Bad: send everything back to the previous revision
gcloud run services update-traffic orders-api --region asia-south1 --to-revisions orders-api-00041-abc=100`,
        },
        {
          title: 'Canary for Lambda with SAM + CodeDeploy and auto rollback',
          lang: 'yaml',
          code: `CheckoutFunction:
  Type: AWS::Serverless::Function
  Properties:
    Runtime: nodejs20.x
    Handler: index.handler
    AutoPublishAlias: live                      # every deploy publishes a version + moves the alias
    DeploymentPreference:
      Type: Canary10Percent5Minutes             # 10% for 5 minutes, then 100%
      Alarms:
        - !Ref CheckoutErrorsAlarm              # if this alarm fires -> automatic rollback

CheckoutErrorsAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    Namespace: AWS/Lambda
    MetricName: Errors
    Dimensions:
      - Name: FunctionName
        Value: !Ref CheckoutFunction
    Statistic: Sum
    Period: 60
    EvaluationPeriods: 1
    Threshold: 1
    ComparisonOperator: GreaterThanOrEqualToThreshold`,
        },
      ],
      output: `On Cloud Run, \`--no-traffic\` creates the new revision but users still hit the old one; you can test it privately on its \`canary\` tag URL. Then 10% of real requests go to it. If dashboards look fine, \`--to-latest\` moves everyone; if not, one command puts 100% back on the old revision — no rebuild needed.

With SAM, each deploy publishes a new Lambda version. CodeDeploy shifts 10% of the \`live\` alias traffic to it for 5 minutes. If the errors alarm fires in that window, traffic goes back to the old version automatically; otherwise it shifts to 100%.`,
      questions: [
        {
          q: 'What is the difference between blue-green and canary deployments?',
          a: 'Blue-green switches 100% of traffic from the old environment to a fully tested new one at once, with instant switch-back. Canary sends a small percentage of traffic to the new version first and increases it gradually based on metrics.',
        },
        {
          q: 'How do you handle database migrations with zero-downtime deployments?',
          a: 'Use backward-compatible expand-and-contract migrations: add new structures first, deploy code that works with both old and new, backfill, switch, and remove old structures in a later release. Never deploy a migration that breaks the currently running version.',
        },
        {
          q: 'How do you decide whether a canary is healthy?',
          a: 'Compare the canary\'s error rate, p95/p99 latency and key business metrics (checkout success) against the stable version, ideally with automated alarms that trigger rollback.',
        },
        {
          q: 'What is the difference between deploying and releasing?',
          a: 'Deploying puts code on servers. Releasing exposes features to users. Feature flags let you deploy dark and release gradually, separately from deploys.',
        },
      ],
      spoken: `"Both strategies avoid downtime and make rollback easy. In blue-green I run two identical environments; I deploy and test green while blue serves users, then flip all traffic to green, and flip back instantly if needed — it costs double resources briefly. In a canary I send a small slice, like 10%, to the new version, watch error rate and p99, then ramp up; this limits the blast radius. I've used Cloud Run traffic splits and Lambda aliases with CodeDeploy, tied to CloudWatch alarms for automatic rollback. The tricky part is the database, so I always use backward-compatible, expand-and-contract migrations."`,
      mistakes: [
        'Running a breaking database migration (drop/rename a column) in the same deploy — the old version, still serving traffic, starts failing.',
        'Doing a canary without monitoring that splits by version, so you cannot tell if the canary is worse.',
        'Forgetting that sticky sessions or caches can keep users on one version, or bounce them between versions with incompatible client code.',
        'Follow-up trap: "Is a canary useful with very low traffic?" Less so — 5% of 20 requests per hour gives no signal. Use longer bake times, synthetic tests, or internal users first.',
      ],
      takeaway: 'Blue-green flips everything at once with instant switch-back; canary tests on a small slice first — both need backward-compatible DB changes.',
    },
    {
      id: 'choosing-compute',
      title: 'Choosing Compute: EC2 vs ECS/Fargate vs EKS vs Lambda vs Cloud Run',
      level: 'advanced',
      priority: 'good',
      frequency: 'common',
      summary: 'Pick compute by workload shape: Lambda for events and spiky traffic, Fargate/Cloud Run for containerized services, EKS for large platform teams, EC2 for full control.',
      what: `There are many ways to run a Node service. The main options:

- **EC2:** virtual machines. Full control, you manage everything.
- **ECS** (Elastic Container Service): AWS's own container orchestrator. Simpler than Kubernetes. Runs on EC2 instances you manage, or on **Fargate**.
- **Fargate:** serverless containers — you give CPU/memory per task, AWS runs it, no servers to manage.
- **EKS:** managed Kubernetes on AWS. Most powerful and portable, most complex.
- **Lambda:** functions, per-request scaling, pay per ms.
- **Cloud Run** (GCP): serverless containers with request-based scaling to zero.
- **App Runner / Elastic Beanstalk** (AWS), **Vercel / Render / Railway** (PaaS): the simplest, least control.

#### Deeper version
Questions that drive the choice:
- **Traffic shape:** spiky or low → Lambda / Cloud Run. Steady and high → containers on Fargate/ECS/EKS or EC2.
- **Run time:** jobs over 15 minutes → not Lambda; use Fargate tasks, Cloud Run Jobs, AWS Batch.
- **Long-lived connections:** WebSockets/streaming → containers (or API Gateway WebSocket API with Lambda).
- **Team size and skills:** Kubernetes needs real platform effort; small teams usually do better with Fargate or Cloud Run.
- **Portability:** containers (Docker) move between clouds more easily than Lambda handlers.
- **Cost:** compare per-request pricing vs always-on capacity at your actual traffic; Fargate costs more per vCPU than EC2 but saves operations time; Spot capacity lowers cost for fault-tolerant work.
- **Latency:** cold starts (Lambda, scale-from-zero) vs always-warm containers.
- A common mature setup: containers for the main API, Lambda for event glue (S3 triggers, webhooks, cron), managed DB, queues between them.`,
      why: `"How would you deploy this?" is a classic system design follow-up. A good answer is not "always Kubernetes" or "always Lambda" — it explains trade-offs for this workload, this team and this budget.`,
      analogy: `It is like choosing transport. **EC2** is owning a car: total control, you do maintenance. **ECS/Fargate** is a company car service: you say where, they handle the vehicle. **EKS** is running your own transport company: powerful but you need staff. **Lambda** is a taxi you call per trip. **Cloud Run** is a taxi that can carry many passengers at once and brings its own luggage rack (your container).`,
      code: [
        {
          title: 'ECS Fargate task definition (the container "recipe")',
          lang: 'json',
          code: `{
  "family": "orders-api",
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/orders-api-task",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "123456789012.dkr.ecr.ap-south-1.amazonaws.com/orders-api:3f9a1c2",
      "portMappings": [{ "containerPort": 3000 }],
      "environment": [{ "name": "NODE_ENV", "value": "production" }],
      "secrets": [
        { "name": "MONGO_URL", "valueFrom": "arn:aws:secretsmanager:ap-south-1:123456789012:secret:prod/orders/mongo" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/orders-api",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "api"
        }
      }
    }
  ]
}`,
        },
      ],
      output: `This task definition tells ECS to run the \`orders-api\` image on Fargate with 0.5 vCPU and 1 GB RAM. The **execution role** lets ECS pull the image from ECR, fetch the secret and write logs; the **task role** is what your app code uses to call AWS (S3, SQS). \`MONGO_URL\` is injected from Secrets Manager at start, and stdout goes to CloudWatch Logs. An ECS **service** then keeps N copies of this task running behind an ALB, with auto scaling and rolling or blue/green deploys — no servers to patch.`,
      questions: [
        {
          q: 'How would you choose between Lambda and containers for a new API?',
          a: 'Lambda for spiky or low traffic, event-driven work and minimal ops. Containers (Fargate/Cloud Run/EKS) for steady traffic, long requests, WebSockets, heavy dependencies, or when you want portability and no cold starts.',
        },
        {
          q: 'ECS vs EKS?',
          a: 'ECS is AWS-native and simpler to run, with deep AWS integration. EKS is managed Kubernetes: more powerful, portable and with a huge ecosystem, but more complex and needs platform expertise.',
        },
        {
          q: 'What is Fargate?',
          a: 'A serverless compute engine for containers on ECS or EKS: you specify CPU and memory per task and AWS runs it without you managing EC2 instances.',
        },
        {
          q: 'What is the difference between the ECS task execution role and the task role?',
          a: 'The execution role is used by ECS itself to pull images, read secrets and send logs. The task role is assumed by your application code to call AWS services.',
        },
      ],
      spoken: `"I choose compute by workload shape and team size. For spiky, event-driven work like webhooks, S3 triggers and cron jobs, Lambda is great. For a main API with steady traffic, WebSockets or long requests, I prefer containers — on AWS that's ECS on Fargate for simplicity, or EKS if the company already has a Kubernetes platform team; on GCP it's Cloud Run. EC2 is for when I need full control or special hardware. Often the best answer is a mix: containers for the core API, Lambda for glue, and managed databases and queues around them."`,
      mistakes: [
        'Choosing Kubernetes for a three-person startup with two services; the operational cost outweighs the benefits.',
        'Forcing long-running or WebSocket-heavy workloads into Lambda.',
        'Mixing up ECS execution role and task role, causing "AccessDenied" in app code or image-pull failures.',
        'Follow-up trap: "Is Fargate always more expensive than EC2?" Per vCPU-hour usually yes, but it removes server management, patching and over-provisioning, so total cost can be lower for small teams or uneven workloads.',
      ],
      takeaway: 'Match compute to workload: functions for events, managed containers for services, Kubernetes only when you need the platform.',
    },
    {
      id: 'disaster-recovery',
      title: 'Backups and Disaster Recovery (RPO, RTO, Multi-AZ vs Multi-Region)',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'RPO is how much data you can lose; RTO is how long you can be down. Pick backups, Multi-AZ or multi-region based on those two numbers.',
      what: `**Disaster recovery (DR)** is your plan for getting back up after something big goes wrong: a deleted database, a bad migration, a region outage, ransomware.

Two numbers define the plan:
- **RPO** (Recovery Point Objective): how much data you can afford to **lose**, measured in time. RPO of 5 minutes = you may lose the last 5 minutes of writes.
- **RTO** (Recovery Time Objective): how long you can afford to be **down**. RTO of 1 hour = service must be back within an hour.

Lower numbers cost more.

#### Deeper version
- **High availability (HA)** is not the same as DR. Multi-AZ protects against a data center failure. It does **not** protect against "someone ran \`DELETE FROM orders\`" — that delete is replicated instantly. Backups and point-in-time recovery protect against that.
- DR strategies from cheapest/slowest to most expensive/fastest:
  1. **Backup and restore** — restore snapshots in another region (hours).
  2. **Pilot light** — core data replicated, minimal infra ready, scale up during disaster (tens of minutes).
  3. **Warm standby** — a smaller full copy running in another region (minutes).
  4. **Multi-site active-active** — full traffic in two regions (near zero, most complex: data conflicts, global routing).
- Useful features: RDS automated backups and point-in-time restore, cross-region snapshot copy, S3 versioning and cross-region replication, DynamoDB point-in-time recovery and global tables, MongoDB Atlas continuous backups.
- **Infrastructure as Code** makes rebuilding in another region realistic.
- **Test restores regularly.** A backup you never restored is a hope, not a backup.
- Protect backups from the same attacker: separate account, immutable/locked backups (e.g. S3 Object Lock, AWS Backup Vault Lock).`,
      why: `Every system eventually has a bad day. Interviewers want to know you understand that replicas are not backups, that you can state recovery goals in numbers, and that you can match cost to business needs — a payments service and an internal dashboard need very different plans.`,
      analogy: `RPO is "how many pages of my diary can I lose?" and RTO is "how long can I go without my diary?". Multi-AZ is a carbon copy written at the same time — if you spill coffee on one, the other is fine, but if you write something wrong, both copies have the mistake. A backup is a photo of the diary from last night, kept in a different house.`,
      code: [
        {
          title: 'Point-in-time restore and cross-region copies',
          lang: 'bash',
          code: `# RDS: restore the DB to how it looked 5 minutes before the bad migration
aws rds restore-db-instance-to-point-in-time --source-db-instance-identifier orders-db --target-db-instance-identifier orders-db-restored --restore-time 2024-05-03T10:25:00Z

# Copy a snapshot to another region for DR
aws rds copy-db-snapshot --source-db-snapshot-identifier arn:aws:rds:ap-south-1:123456789012:snapshot:orders-nightly --target-db-snapshot-identifier orders-nightly-dr --region ap-southeast-1 --kms-key-id alias/dr-key

# S3: keep old versions so deletes and overwrites can be undone
aws s3api put-bucket-versioning --bucket my-app-uploads --versioning-configuration Status=Enabled

# DynamoDB: enable point-in-time recovery
aws dynamodb update-continuous-backups --table-name Orders --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true`,
        },
      ],
      output: `The first command creates a **new** database instance with data as of 10:25 — just before the bad migration at 10:30. You then check it and point the app to it (or copy the missing rows back). The snapshot copy puts last night's backup in Singapore, so a full Mumbai region outage does not take your backups with it. S3 versioning means a deleted or overwritten upload can be recovered from its previous version, and DynamoDB point-in-time recovery lets you restore the table to any second in the retention window.`,
      questions: [
        {
          q: 'What are RPO and RTO?',
          a: 'RPO is the maximum acceptable data loss measured in time. RTO is the maximum acceptable downtime. Together they decide the DR strategy and its cost.',
        },
        {
          q: 'Is a read replica or Multi-AZ a backup?',
          a: 'No. They copy every change, including accidental deletes and corruption. You still need backups with point-in-time recovery, ideally stored in another account or region.',
        },
        {
          q: 'What DR strategies exist in the cloud?',
          a: 'Backup and restore, pilot light, warm standby, and multi-site active-active — from cheapest with the longest recovery to most expensive with near-zero recovery.',
        },
        {
          q: 'How do you know your backups work?',
          a: 'Restore them regularly into a test environment, verify the data, and time the process against your RTO. Automate it if possible.',
        },
      ],
      spoken: `"I start DR planning with two numbers: RPO, how much data we can lose, and RTO, how long we can be down. High availability like Multi-AZ handles a data-center failure, but it's not a backup — an accidental delete replicates instantly. So I enable automated backups with point-in-time recovery for RDS, DynamoDB and Atlas, S3 versioning, and copy backups to another region and ideally another account. Based on the RPO and RTO, I choose backup-and-restore, pilot light, warm standby or active-active. And I regularly test restores, because untested backups don't count."`,
      mistakes: [
        'Treating replicas or Multi-AZ as backups.',
        'Keeping backups in the same account and region as production, so one compromised credential or region outage loses both.',
        'Never testing a restore and discovering during an incident that it takes 9 hours or the backups are incomplete.',
        'Follow-up trap: "Your RPO is 1 minute but you only take nightly snapshots — what is wrong?" Nightly snapshots give an RPO up to 24 hours; you need continuous backups / point-in-time recovery or replication to meet 1 minute.',
      ],
      takeaway: 'Define RPO and RTO first, remember replicas are not backups, keep copies in another region/account, and test restores.',
    },
    {
      id: 'cloud-cost-optimization',
      title: 'Cloud Cost Optimization',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Find where the money goes (tags, Cost Explorer, budgets), right-size, use commitments and Spot, and kill waste like idle resources, NAT data and never-expiring logs.',
      what: `Cloud bills grow quietly. **Cost optimization** means paying only for what really helps your users.

The basic loop:
1. **See it:** tag every resource (\`team\`, \`env\`, \`service\`), use Cost Explorer / GCP Billing reports, and set **budgets with alerts**.
2. **Cut waste:** delete idle resources (unattached EBS volumes, old snapshots, forgotten dev environments), set log retention, add S3 lifecycle rules.
3. **Right-size:** most servers and databases are bigger than needed. Check CPU/memory usage and downsize.
4. **Pay less per unit:** Savings Plans / Reserved Instances for steady load, **Spot** for fault-tolerant work, Graviton (ARM) instances for better price-performance.

#### Deeper version
- **Common surprise bills:** NAT gateway data processing (use VPC endpoints), data transfer out to the internet and across regions/AZs, CloudWatch Logs ingestion, idle load balancers, over-provisioned RDS, DynamoDB provisioned capacity left high, and runaway Lambdas (recursive triggers like S3 → Lambda → same bucket).
- **Serverless costs** scale with requests; tune Lambda memory (more memory can be cheaper if it cuts duration — tools like AWS Lambda Power Tuning measure this).
- **Scale to zero** for non-prod: shut down dev/staging at night or use serverless there.
- **Caching** (CloudFront, Redis) reduces compute and database load.
- **Storage classes:** S3 Intelligent-Tiering or lifecycle to Infrequent Access/Glacier for old data.
- **FinOps** is the practice of making teams own their cloud spend with visibility and accountability.
- LLM/AI APIs are a new big line item: cache responses, choose smaller models where possible, limit tokens, and track cost per feature.`,
      why: `In many startups, cloud is one of the biggest costs after salaries. Engineers who design with cost in mind — and can explain trade-offs — are highly valued. Interviewers ask "how would you reduce this bill?" to test practical experience.`,
      analogy: `A cloud bill is like a home electricity bill. First you install a meter for each room (tags) to see what uses the most. Then you switch off lights in empty rooms (idle resources), replace old appliances with efficient ones (right-sizing, Graviton), and sign a yearly plan for the base load you always use (Savings Plans).`,
      code: [
        {
          title: 'Find waste and set a budget alert (AWS CLI)',
          lang: 'bash',
          code: `# Unattached EBS volumes (paying for disks no server uses)
aws ec2 describe-volumes --filters Name=status,Values=available --query "Volumes[].{id:VolumeId,size:Size}"

# Log groups that never expire
aws logs describe-log-groups --query "logGroups[?!retentionInDays].logGroupName"

# Cost by service for last month
aws ce get-cost-and-usage --time-period Start=2024-04-01,End=2024-05-01 --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE

# Monthly budget with an email alert at 80%
aws budgets create-budget --account-id 123456789012 --budget '{"BudgetName":"monthly","BudgetLimit":{"Amount":"2000","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"team@shop.com"}]}]'`,
        },
        {
          title: 'S3 lifecycle rule: move old files to cheaper storage',
          lang: 'json',
          code: `{
  "Rules": [
    {
      "ID": "archive-old-invoices",
      "Filter": { "Prefix": "invoices/" },
      "Status": "Enabled",
      "Transitions": [
        { "Days": 30, "StorageClass": "STANDARD_IA" },
        { "Days": 180, "StorageClass": "GLACIER" }
      ],
      "NoncurrentVersionExpiration": { "NoncurrentDays": 90 }
    }
  ]
}`,
        },
      ],
      output: `The first two commands list disks nobody uses and log groups that keep data forever — quick wins to delete or fix. \`get-cost-and-usage\` shows which services cost the most last month, so you know where to focus. The budget emails the team when actual spend passes 80% of 2,000 dollars, before the month ends. The lifecycle rule (applied with \`aws s3api put-bucket-lifecycle-configuration\`) moves invoices to Infrequent Access after 30 days and to Glacier after 180, and deletes old overwritten versions after 90 days — no code changes needed.`,
      questions: [
        {
          q: 'How would you reduce a growing AWS bill?',
          a: 'Get visibility with tags, Cost Explorer and budgets; remove idle resources; right-size instances and databases; use Savings Plans for steady load and Spot for flexible work; add caching; set log retention and S3 lifecycle rules; check data transfer and NAT costs.',
        },
        {
          q: 'What are common hidden cloud costs?',
          a: 'Data transfer out and across AZs/regions, NAT gateway processing, CloudWatch Logs ingestion, idle load balancers and IPs, old snapshots, and over-provisioned databases.',
        },
        {
          q: 'Savings Plans vs Spot instances?',
          a: 'Savings Plans give a discount for committing to a steady amount of usage for 1-3 years — good for baseline load. Spot uses spare capacity at deep discounts but can be interrupted — good for fault-tolerant, stateless work.',
        },
      ],
      spoken: `"I start with visibility: consistent tags per team, service and environment, Cost Explorer to see the top services, and budgets with alerts. Then I go for waste — idle volumes and environments, log groups without retention, old snapshots. Next I right-size based on real utilization, and for steady load use Savings Plans, for flexible work Spot, and Graviton where it fits. I also watch the hidden costs like NAT gateway data and cross-AZ traffic, adding VPC endpoints and caching. For serverless I tune Lambda memory, and for AI features I track cost per feature."`,
      mistakes: [
        'Optimizing small things (a $5 Lambda) while a $3,000 NAT gateway or over-sized database goes unnoticed — always start from the biggest line items.',
        'Buying 3-year commitments before right-sizing, locking in waste.',
        'Creating recursive event loops (Lambda writes to the same S3 bucket that triggers it) that run up huge bills.',
        'Follow-up trap: "Can increasing Lambda memory reduce cost?" Yes — more memory also gives more CPU, so the function may finish much faster, and cost = memory × duration can go down.',
      ],
      takeaway: 'Measure first (tags, budgets), kill waste, right-size, then commit — and watch data transfer.',
    },
  ],
  rapidFire: [
    { q: 'IaaS vs PaaS in one line?', a: 'IaaS gives you VMs to manage (EC2); PaaS runs your code or container for you (Cloud Run, Beanstalk).' },
    { q: 'What is an Availability Zone?', a: 'One or more isolated data centers inside a region; use at least two for high availability.' },
    { q: 'IAM user vs role?', a: 'A user has long-term credentials; a role is assumed and gives temporary credentials.' },
    { q: 'Explicit Allow vs explicit Deny in IAM?', a: 'Explicit Deny always wins.' },
    { q: 'What is least privilege?', a: 'Grant only the exact actions on the exact resources that are needed.' },
    { q: 'How should GitHub Actions access AWS?', a: 'With OIDC and an IAM role — no stored access keys.' },
    { q: 'What is a presigned URL?', a: 'A temporary signed S3 link that allows one action on one object until it expires.' },
    { q: 'Why upload directly to S3?', a: 'Large files skip your server and API Gateway limits; the server only signs a URL.' },
    { q: 'Multi-AZ vs read replica?', a: 'Multi-AZ is a standby for failover; read replicas are async copies to scale reads.' },
    { q: 'What is RDS Proxy for?', a: 'Pooling database connections, especially from many Lambda environments.' },
    { q: 'What does a CDN do?', a: 'Caches content at edge locations near users to cut latency and origin load.' },
    { q: 'max-age vs s-maxage?', a: '`max-age` is for all caches; `s-maxage` only for shared caches like CDNs.' },
    { q: 'Why can\'t a CNAME sit at the root domain?', a: 'DNS rules forbid it; Route 53 uses Alias records instead.' },
    { q: 'Docker image vs container?', a: 'An image is the read-only template; a container is a running instance of it.' },
    { q: 'Container vs VM?', a: 'Containers share the host kernel and are lighter; VMs run a full guest OS.' },
    { q: 'Why copy package.json before the source in a Dockerfile?', a: 'So the dependency install layer stays cached when only code changes.' },
    { q: 'What is a multi-stage build?', a: 'Build in one stage with all tools, copy only artifacts into a small runtime stage.' },
    { q: 'Named volume vs bind mount?', a: 'Volumes are Docker-managed for data; bind mounts map a host folder, mostly for dev.' },
    { q: 'How do Compose services reach each other?', a: 'By service name on the shared network, e.g. `mongo:27017`.' },
    { q: 'Does depends_on wait for readiness?', a: 'Not by default — use a healthcheck with `condition: service_healthy`.' },
    { q: 'Lambda maximum timeout?', a: '15 minutes.' },
    { q: 'Where should you create DB clients in Lambda?', a: 'Outside the handler, so warm invocations reuse them.' },
    { q: 'What is a Lambda layer?', a: 'A versioned zip of shared libraries or code that functions can attach (up to 5).' },
    { q: 'Reserved vs provisioned concurrency?', a: 'Reserved guarantees and caps slots for free; provisioned keeps environments pre-warmed for a fee.' },
    { q: 'Lambda concurrency formula?', a: 'Requests per second × average duration in seconds.' },
    { q: 'What happens when Lambda is throttled synchronously?', a: 'The caller gets a 429 TooManyRequests error.' },
    { q: 'HTTP API vs REST API in API Gateway?', a: 'HTTP API is cheaper and simpler with JWT auth; REST API has usage plans, caching and request validation.' },
    { q: 'DynamoDB partition key vs sort key?', a: 'Partition key picks where items live; sort key orders items within the partition for range queries.' },
    { q: 'DynamoDB Query vs Scan?', a: 'Query reads one partition efficiently; Scan reads the whole table.' },
    { q: 'SQS vs SNS?', a: 'SQS is a pull queue where one consumer handles each message; SNS pushes copies to all subscribers.' },
    { q: 'When to use EventBridge?', a: 'For routing events by content, AWS/SaaS events, many event types and schedules.' },
    { q: 'What is fan-out?', a: 'One message delivered to many independent consumers, e.g. SNS → several SQS queues.' },
    { q: 'What is a visibility timeout?', a: 'How long a received SQS message stays hidden before it can be redelivered.' },
    { q: 'Why make queue consumers idempotent?', a: 'Delivery is at-least-once, so duplicates must not cause double effects.' },
    { q: 'What is a DLQ?', a: 'A dead-letter queue that holds messages that failed too many times.' },
    { q: 'Public vs private subnet?', a: 'A public subnet routes to an internet gateway; a private one does not.' },
    { q: 'Security group vs NACL?', a: 'Security groups are stateful, per resource, allow-only; NACLs are stateless, per subnet, allow and deny.' },
    { q: 'What does a NAT gateway do?', a: 'Lets private resources make outbound internet calls without being reachable from outside.' },
    { q: 'Secrets Manager vs Parameter Store?', a: 'Secrets Manager adds automatic rotation at a cost; Parameter Store is cheaper for config and simple secrets.' },
    { q: 'ALB vs NLB?', a: 'ALB is layer 7 HTTP routing; NLB is layer 4 TCP/UDP with static IPs and very high throughput.' },
    { q: 'Why must apps be stateless to scale?', a: 'Any instance must be able to serve any request and be replaced at any time.' },
    { q: 'Liveness vs readiness?', a: 'Liveness failure restarts the container; readiness failure only stops traffic to it.' },
    { q: 'Should liveness check the database?', a: 'No — a DB blip would restart every pod.' },
    { q: 'Pod vs Deployment vs Service?', a: 'Pod runs containers; Deployment manages replicas and rollouts; Service gives a stable address.' },
    { q: 'What is an Ingress?', a: 'HTTP routing rules from outside the cluster to Services; needs an Ingress controller.' },
    { q: 'Are Kubernetes Secrets encrypted by default?', a: 'No, only base64-encoded unless encryption at rest is enabled.' },
    { q: 'Cloud Run vs Lambda concurrency?', a: 'A Cloud Run instance serves many requests at once; a Lambda environment serves one at a time.' },
    { q: 'Which port must a Cloud Run app listen on?', a: 'The one in the `PORT` env variable (default 8080).' },
    { q: 'Pub/Sub topic vs subscription?', a: 'A topic receives messages; each subscription gets its own copy to deliver and ack.' },
    { q: 'Reverse proxy vs forward proxy?', a: 'A reverse proxy represents servers to clients; a forward proxy represents clients to servers.' },
    { q: 'Nginx 502 vs 504?', a: '502: upstream is down or sent a bad response; 504: upstream did not answer in time.' },
    { q: 'terraform plan vs apply?', a: 'Plan previews changes; apply makes them.' },
    { q: 'Where should Terraform state live?', a: 'In a remote, encrypted, locked backend like S3 or GCS — never in Git.' },
    { q: 'GitHub Actions job vs step?', a: 'Jobs run on separate runners in parallel; steps run in order inside a job.' },
    { q: 'What is a matrix build?', a: 'One job expanded into parallel runs for each combination, like Node 18/20/22.' },
    { q: 'Blue-green vs canary?', a: 'Blue-green switches all traffic at once; canary shifts a small share first and ramps up.' },
    { q: 'What is expand-and-contract?', a: 'Backward-compatible DB migrations so old and new code both work during a deploy.' },
    { q: 'RPO vs RTO?', a: 'RPO is acceptable data loss; RTO is acceptable downtime.' },
    { q: 'SLI vs SLO vs SLA?', a: 'SLI is the measurement, SLO the internal target, SLA the customer contract.' },
    { q: 'What is a correlation ID?', a: 'An ID passed through every service and log line to trace one request.' },
  ],
};
