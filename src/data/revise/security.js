// Revise MERN: Security & Auth. 25 likely interview questions with short spoken-style answers.
export default {
  id: 'security',
  icon: '🔒',
  title: 'Security & Auth',
  note: 'Authentication, authorization, tokens and cookies, common web attacks, and securing a MERN API.',
  items: [
    {
      q: 'What is the difference between authentication and authorization?',
      a: `**Authentication** answers "who are you?", verifying identity with a password, OTP, or a provider like Google. **Authorization** answers "what are you allowed to do?", checking permissions after you are identified.

Authentication comes first; authorization runs on every protected action. A failed authentication is usually a **401 Unauthorized**, and an authenticated user without permission gets **403 Forbidden**.`,
    },
    {
      q: 'Sessions vs JWT: what is the difference and when would you use each?',
      a: `With **sessions**, the server stores session data (in memory, Redis or a DB) and the browser only holds a session ID cookie. It is easy to revoke, but the server must look it up on every request. A **JWT** is a signed token containing the claims itself, so the server verifies the signature without a lookup, which suits stateless APIs and microservices.

The downside of JWTs is that they are hard to revoke before expiry. So for a classic web app sessions are simple and solid; for distributed or serverless APIs, short-lived JWTs with refresh tokens work well.`,
    },
    {
      q: 'How do access tokens and refresh tokens work together?',
      a: `The **access token** is short-lived, say 15 minutes, and is sent with every API call. The **refresh token** is long-lived, stored more safely, and used only to get a new access token when the old one expires.

This limits damage if an access token leaks, while users stay logged in. Good practice is **refresh token rotation**: issue a new refresh token on each use and invalidate the old one, so reuse of a stolen token can be detected and the session killed.`,
    },
    {
      q: 'Where should you store tokens on the frontend: localStorage or cookies?',
      a: `**localStorage** is easy but readable by any JavaScript on the page, so a single XSS bug can steal the token. An **HttpOnly cookie** cannot be read by JavaScript at all, which makes it the safer choice for tokens, especially refresh tokens.

Cookies are sent automatically, so you must also defend against **CSRF** with \`SameSite\` and, if needed, CSRF tokens. A common pattern is the refresh token in an HttpOnly cookie and the short-lived access token kept only in memory.`,
    },
    {
      q: 'Explain the HttpOnly, Secure and SameSite cookie flags.',
      a: `**HttpOnly** blocks JavaScript from reading the cookie, which protects it from XSS theft. **Secure** means the cookie is only sent over HTTPS.

**SameSite** controls whether the cookie is sent on cross-site requests: \`Strict\` never, \`Lax\` only on top-level navigation like clicking a link (the browser default), and \`None\` always, which requires \`Secure\`. Lax or Strict gives strong CSRF protection; you need None only when your frontend and API are on different sites.`,
    },
    {
      q: 'How should passwords be stored?',
      a: `Never store plain text or use fast hashes like MD5 or SHA-256. Use a **slow, salted password hashing algorithm**: **bcrypt** is the common choice in Node, and **Argon2id** is the modern recommendation.

A **salt** is random data per password so identical passwords get different hashes and rainbow tables do not work. The work factor makes each guess expensive for an attacker, and you raise it over time as hardware gets faster. To log in, you hash the attempt and compare with the library's compare function.`,
    },
    {
      q: 'What is XSS and how do you prevent it?',
      a: `**Cross-Site Scripting** is when an attacker gets their JavaScript to run in another user's browser, for example through a comment field that is rendered without escaping. It can steal tokens, act as the user, or change the page.

React escapes values in JSX by default, which helps a lot. The danger points are \`dangerouslySetInnerHTML\`, building HTML strings, and \`javascript:\` URLs. Sanitize any HTML you must render with a library like DOMPurify, add a **Content Security Policy**, and keep tokens in HttpOnly cookies.`,
    },
    {
      q: 'What is CSRF and how do you prevent it?',
      a: `**Cross-Site Request Forgery** tricks a logged-in user's browser into sending a request to your site from a malicious site. Because the browser attaches cookies automatically, the request looks legitimate.

Defenses: **SameSite** cookies (Lax or Strict), **CSRF tokens** that the attacker's page cannot read, and checking the \`Origin\` header. Never change data on GET requests. If you authenticate with a bearer token in the \`Authorization\` header instead of cookies, classic CSRF does not apply.`,
    },
    {
      q: 'How do you implement role-based access control (RBAC)?',
      a: `In **RBAC**, users get **roles**, roles have **permissions**, and every protected action checks the permission, not the role name directly. So "can edit job" is checked, and Admin or Recruiter roles grant it.

On the backend, a middleware or helper loads the user's permissions and rejects with 403 if missing; the frontend hides buttons too, but that is only UX, the **server is the real check**. I built the role and permission system on SkillKeepr, where it also had to respect which company the user belongs to.`,
    },
    {
      q: 'What is NoSQL injection and how do you prevent it in MongoDB?',
      a: `**NoSQL injection** happens when user input is used directly in a query and the attacker sends an object instead of a string, like \`{ "$ne": null }\` as a password, which can match any user. The same idea as SQL injection, different syntax.

Prevent it by **validating input types** with a schema like Zod or Joi, rejecting keys starting with \`$\`, and never passing \`req.body\` straight into a query. Mongoose's \`sanitizeFilter\` option helps too. For SQL databases, always use **parameterized queries**, never string concatenation.`,
    },
    {
      q: 'What is CORS?',
      a: `**CORS** (Cross-Origin Resource Sharing) is a browser rule. By default, JavaScript on one origin cannot read responses from another origin; the server has to opt in with headers like \`Access-Control-Allow-Origin\`. For non-simple requests, the browser first sends an **OPTIONS preflight**.

Important point: CORS **protects users' browsers, not your API**. Tools like curl ignore it. So configure an explicit allow-list of origins, be careful with credentials, and never treat CORS as authentication.`,
    },
    {
      q: 'What is OAuth 2.0 and how is OpenID Connect different?',
      a: `**OAuth 2.0** is an **authorization** framework: it lets an app get limited access to a user's resources on another service, like reading their Google Calendar, without seeing their password. The app receives an access token.

**OpenID Connect** is a layer on top of OAuth that adds **authentication**: it returns an **ID token**, a JWT saying who the user is. "Sign in with Google" is OIDC. For web and mobile apps, the recommended flow is **Authorization Code with PKCE**.`,
    },
    {
      q: 'What is a JWT made of and is it encrypted?',
      a: `A JWT has three Base64URL parts separated by dots: a **header** (algorithm), a **payload** (claims like user ID, role and expiry), and a **signature**. The signature proves the token was issued by you and was not modified.

A normal JWT is **signed, not encrypted**, so anyone can decode and read the payload. Never put secrets in it. On the server, always verify the signature, pin the expected algorithm, and check \`exp\`.`,
    },
    {
      q: 'What is rate limiting and why is it important?',
      a: `**Rate limiting** caps how many requests a client can make in a time window, like 100 per minute per IP or per user. It protects against **brute-force logins**, scraping, abuse and accidental overload.

In Express, \`express-rate-limit\` is common, with a **Redis store** so limits work across multiple servers. It can also be done at the API gateway or CDN level, which on AWS is often simpler. Use stricter limits on sensitive routes like login, OTP and password reset, and return **429 Too Many Requests**.`,
    },
    {
      q: 'What are the OWASP Top 10?',
      a: `The **OWASP Top 10** is a widely used list of the most critical web application security risks. Top entries include **Broken Access Control**, which is number one, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, and Vulnerable and Outdated Components.

It also covers authentication failures, integrity failures, logging and monitoring gaps, and SSRF. In an interview, I mention that broken access control, like a user reading another user's data by changing an ID, is the most common real-world issue.`,
    },
    {
      q: 'How do you verify a webhook, for example from Stripe?',
      a: `Anyone can POST to your webhook URL, so you must prove the request came from Stripe. Stripe signs each event with your **webhook signing secret** and sends it in the \`Stripe-Signature\` header. You verify it with \`stripe.webhooks.constructEvent\` using the **raw request body**, not parsed JSON.

The signature includes a timestamp to stop replay attacks. Also make handlers **idempotent**, since Stripe can retry the same event. We used this pattern for Stripe subscriptions on SkillKeepr.`,
    },
    {
      q: 'How do you ensure data isolation in a multi-tenant application?',
      a: `Every request must only touch the **current tenant's data**. Common models are a shared database with a \`tenantId\` on every document, a schema per tenant, or a **database per tenant**, which gives the strongest isolation.

SkillKeepr used one MongoDB database per company, so the tenant was resolved from the authenticated user and the right database chosen on the server, never from client input. With a shared database, you enforce the tenant filter centrally in a middleware or data layer so no query can forget it.`,
    },
    {
      q: 'What security headers would you set, and what does helmet do?',
      a: `**helmet** is Express middleware that sets sensible security headers in one line. Key ones: **Content-Security-Policy** limits where scripts and resources load from; **Strict-Transport-Security** forces HTTPS; **X-Content-Type-Options: nosniff** stops MIME sniffing; and **X-Frame-Options** or CSP \`frame-ancestors\` prevents clickjacking.

It also removes \`X-Powered-By\` so you do not advertise Express. CSP needs tuning for your app, but it is the strongest extra defense against XSS.`,
    },
    {
      q: 'Why is input validation important and where should it happen?',
      a: `Never trust anything from the client: body, query, params, headers or files. Validate **on the server** for type, format, length and allowed values, ideally with a schema library like **Zod** or Joi at the edge of each route.

Client-side validation is only for user experience, since attackers can skip the UI entirely. Use an **allow-list** approach (accept only what you expect), strip unknown fields to avoid mass-assignment, like someone sending \`role: "admin"\`, and return clear 400 errors.`,
    },
    {
      q: 'How do you manage secrets like API keys and database passwords?',
      a: `Keep secrets **out of the code and out of Git**. Locally use a \`.env\` file that is gitignored; in production use a secrets manager like **AWS Secrets Manager** or SSM Parameter Store, injected as environment variables or fetched at startup.

Give each service only the secrets it needs, rotate keys regularly, and never log them or send them to the frontend. If a secret is ever committed, treat it as leaked and **rotate it immediately**, since removing it from history is not enough.`,
    },
    {
      q: 'How does HTTPS work and why is it necessary?',
      a: `**HTTPS** is HTTP over **TLS**. During the handshake, the server proves its identity with a certificate signed by a trusted authority, and both sides agree on session keys. After that, traffic is **encrypted** and tamper-proof.

Without it, anyone on the network, like public Wi-Fi, can read passwords and tokens or modify responses. Use HTTPS everywhere, redirect HTTP to HTTPS, set **HSTS**, and mark cookies \`Secure\`. Certificates are free with Let's Encrypt or AWS Certificate Manager.`,
    },
    {
      q: 'How do you handle file uploads securely?',
      a: `Limit **file size** and number of files, and check the **real file type** by its content, not just the extension or the client's MIME type. Rename files with random names and store them outside the web root, ideally in **S3** using pre-signed URLs, so files never pass through or execute on your server.

Serve user files with the right \`Content-Type\` and \`Content-Disposition\`, scan for malware if the risk is high, and never trust file names, which can contain path traversal like \`../\`.`,
    },
    {
      q: 'How would you secure a login endpoint against brute-force attacks?',
      a: `Use **rate limiting** per IP and per account, add progressive delays or temporary lockouts after repeated failures, and show a CAPTCHA after a few failed tries. Return a **generic error** like "invalid email or password" so attackers cannot learn which emails exist.

Hash passwords with bcrypt or Argon2 so even a leaked database is hard to crack, offer **multi-factor authentication**, and log and alert on unusual login patterns.`,
    },
    {
      q: 'How do you log a user out when using JWTs?',
      a: `Since a JWT is valid until it expires, "logout" needs extra work. The simple part is clearing the tokens on the client and the **refresh token cookie**, and deleting or revoking the refresh token on the server so no new access tokens can be issued.

Keep access tokens **short-lived** so the remaining window is small. If you need instant revocation, keep a **denylist** of token IDs in Redis until they expire, or store a token version on the user and bump it to invalidate all sessions.`,
    },
    {
      q: 'What is the principle of least privilege?',
      a: `**Least privilege** means every user, service and key gets **only the permissions it actually needs**, nothing more. If something is compromised, the damage is limited.

In practice: narrow IAM roles for each Lambda or ECS task, a database user that cannot drop collections, API keys with limited scopes, and app roles that do not default to admin. Review permissions regularly, because they tend to grow over time and rarely get removed.`,
    },
  ],
};
