// Interview problems for the Twilio + Zoho CRM + Jitsi stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'twilio-zoho-jitsi',
  problems: [
    {
      id: 'twiml-ivr-menu',
      title: 'Build a simple IVR menu with TwiML Gather',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'twiml-say-gather',
      question: `A caller dials your Twilio number. Build the Express endpoints for this phone menu (IVR = "Interactive Voice Response", a menu where callers press keys):

\`\`\`text
"Welcome. Press 1 for sales. Press 2 for support."
  1 -> say "Connecting you to sales" and dial +15550001111
  2 -> say "Our support team will text you" and hang up
  anything else / no input -> say "Sorry" and repeat the menu
\`\`\`

The Twilio number's "A call comes in" webhook points to \`POST /voice/welcome\`. Use the \`twilio\` npm package to build the TwiML.`,
      hints: [
        'TwiML is XML that tells Twilio what to do next. Twilio calls your URL and reads the XML you return.',
        'Use `<Gather numDigits="1" action="/voice/menu">` with a `<Say>` inside it. The pressed key arrives in `req.body.Digits` at the action URL.',
        'If Gather gets no input, Twilio continues to the next verb after it. Put a `<Redirect>` back to the welcome URL there. Do not forget `express.urlencoded()` because Twilio sends form-encoded bodies.',
      ],
      solution: `**Idea:** two endpoints. The first one says the menu inside a \`<Gather>\`. Twilio posts the pressed digit to the second one, which branches.

\`\`\`javascript
const express = require('express');
const twilio = require('twilio');
const { VoiceResponse } = twilio.twiml;

const app = express();
// Twilio sends webhooks as application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

app.post('/voice/welcome', (req, res) => {
  const vr = new VoiceResponse();
  const gather = vr.gather({
    numDigits: 1,            // stop after one key press
    action: '/voice/menu',   // Twilio POSTs the result here
    method: 'POST',
    timeout: 5,              // seconds to wait for a key
  });
  gather.say('Welcome. Press 1 for sales. Press 2 for support.');

  // Runs only if the caller pressed nothing: start again
  vr.redirect({ method: 'POST' }, '/voice/welcome');

  res.type('text/xml').send(vr.toString());
});

app.post('/voice/menu', (req, res) => {
  const vr = new VoiceResponse();
  const digit = req.body.Digits;

  if (digit === '1') {
    vr.say('Connecting you to sales.');
    vr.dial('+15550001111');
  } else if (digit === '2') {
    vr.say('Our support team will text you shortly.');
    vr.hangup();
  } else {
    vr.say('Sorry, that is not a valid choice.');
    vr.redirect({ method: 'POST' }, '/voice/welcome');
  }

  res.type('text/xml').send(vr.toString());
});

app.listen(3000);
\`\`\`

The XML from \`/voice/welcome\` looks like this:

\`\`\`html
<Response>
  <Gather numDigits="1" action="/voice/menu" method="POST" timeout="5">
    <Say>Welcome. Press 1 for sales. Press 2 for support.</Say>
  </Gather>
  <Redirect method="POST">/voice/welcome</Redirect>
</Response>
\`\`\`

**Why it works:** Twilio runs the verbs in order. \`<Gather>\` waits for a key. If a key is pressed, Twilio jumps to the \`action\` URL and never reaches the \`<Redirect>\`. If nothing is pressed, the \`<Redirect>\` replays the menu.

**Edge cases:**
- Endless loop if the caller never presses anything. Count retries (for example a \`?attempt=2\` query param) and hang up after 3 tries.
- Always return \`Content-Type: text/xml\`. Returning JSON or HTML gives a Twilio error.
- Validate the Twilio signature in production (see the signature problem).`,
      followUps: [
        {
          q: 'How would you accept speech as well as key presses?',
          a: 'Use `input: \'dtmf speech\'` on Gather. The text arrives in `req.body.SpeechResult` (with a `Confidence` score). Match keywords like "sales" or "support".',
        },
        {
          q: 'How do you stop the caller from being stuck in a loop?',
          a: 'Pass an attempt counter in the redirect URL (`/voice/welcome?attempt=2`). Read it from `req.query` and after 3 attempts say goodbye and `<Hangup/>`.',
        },
      ],
    },
    {
      id: 'validate-twilio-signature',
      title: 'Validate the Twilio webhook signature in Express',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'twilio-webhook-signature',
      question: `Your \`POST /sms/incoming\` webhook is public. Anyone could send fake requests to it. Write Express middleware that only lets real Twilio requests through.

1. First, use the helper from the \`twilio\` package.
2. Then explain (and write) how the signature is computed, using only \`node:crypto\`.`,
      hints: [
        'Twilio sends a header `X-Twilio-Signature`. It is an HMAC made with your Auth Token.',
        'The signed string is: the full URL Twilio called + every POST param, sorted by name, with name and value glued together.',
        'HMAC-SHA1, then base64. Compare with a timing-safe compare.',
      ],
      solution: `**Idea:** Twilio signs every request with your Auth Token. You rebuild the same signature on your side. If it matches, the request is real.

**Option 1 — the library helper:**

\`\`\`javascript
const twilio = require('twilio');

function twilioOnly(req, res, next) {
  const signature = req.get('X-Twilio-Signature') || '';
  // Must be the EXACT public URL Twilio called (https, host, path, query)
  const url = process.env.PUBLIC_BASE_URL + req.originalUrl;

  const ok = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    signature,
    url,
    req.body            // the parsed form params
  );
  if (!ok) return res.status(403).send('Invalid signature');
  next();
}

app.post('/sms/incoming', express.urlencoded({ extended: false }), twilioOnly, handler);
\`\`\`

The package also ships ready-made middleware: \`twilio.webhook()\`. It does the same check.

**Option 2 — by hand with node:crypto:**

\`\`\`javascript
const crypto = require('node:crypto');

function computeTwilioSignature(authToken, url, params) {
  // 1. Start with the full URL
  // 2. Sort POST params by name, append name + value (no separators)
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  // 3. HMAC-SHA1 with the Auth Token, then base64
  return crypto.createHmac('sha1', authToken).update(data, 'utf8').digest('base64');
}

function safeEqual(a, b) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  // timingSafeEqual throws if lengths differ, so check first
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

// Example from Twilio's docs
const sig = computeTwilioSignature(
  '12345',
  'https://mycompany.com/myapp.php?foo=1&bar=2',
  { CallSid: 'CA1234567890ABCDE', Caller: '+12349013030', Digits: '1234',
    From: '+12349013030', To: '+18005551212' }
);
console.log(sig); // 0/KCTR6DLpKmkAf8muzZqo1nDgQ=
\`\`\`

**Why it works:** only you and Twilio know the Auth Token. A fake caller cannot produce a valid HMAC. The timing-safe compare stops attackers from guessing the signature one character at a time by measuring response time.

**Edge cases:**
- The URL must match exactly what Twilio called. Behind a load balancer \`req.protocol\` may be \`http\` while Twilio called \`https\`. Use a configured public URL.
- For JSON bodies (some newer Twilio products), the body is not in the signed string. Instead the URL has a \`bodySHA256\` query param. Use \`twilio.validateRequestWithBody\`.
- After you rotate the Auth Token, old signatures stop matching.`,
      followUps: [
        {
          q: 'Why HMAC and not just a secret in the URL?',
          a: 'A secret in the URL can leak in logs. HMAC never sends the secret. It also covers the params, so an attacker cannot change the body.',
        },
        {
          q: 'Does the signature stop replay attacks?',
          a: 'Not fully. A captured request can be sent again. Make your handler idempotent (store `MessageSid` / `CallSid` and ignore duplicates).',
        },
      ],
    },
    {
      id: 'zoho-401-wrong-header',
      title: 'Debug: Zoho API keeps returning 401 INVALID_TOKEN',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'zoho-oauth2',
      question: `Your Zoho account is in the India data center (you log in at \`crm.zoho.in\`). This code gets a fresh access token, but every call to create a lead returns **401 INVALID_TOKEN**. Find the bugs.

\`\`\`javascript
const tokenRes = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
  params: {
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  },
});
const accessToken = tokenRes.data.access_token;

await axios.post('https://www.zohoapis.com/crm/v2/Leads',
  { data: [{ Last_Name: 'Sharma', Email: 'riya@example.com', Company: 'Acme' }] },
  { headers: { Authorization: 'Bearer ' + accessToken } }
);
\`\`\``,
      hints: [
        'Look at the word before the token in the Authorization header. Zoho uses its own prefix.',
        'Which domain did the token come from, and which domain are you calling the API on?',
        'The token response contains a field that tells you the correct API domain.',
      ],
      solution: `**Idea:** two bugs. (1) Zoho wants the header \`Zoho-oauthtoken <token>\`, not \`Bearer\`. (2) The token is from the India data center (\`.in\`) but the API call goes to the US domain (\`.com\`). Tokens only work in their own data center.

\`\`\`javascript
const tokenRes = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
  params: {
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  },
});

// Zoho returns 200 even for some errors, with { error: 'invalid_code' }
if (tokenRes.data.error) throw new Error('Zoho token error: ' + tokenRes.data.error);

const accessToken = tokenRes.data.access_token;
// Use the domain Zoho tells you, e.g. https://www.zohoapis.in
const apiDomain = tokenRes.data.api_domain;

await axios.post(apiDomain + '/crm/v2/Leads',
  { data: [{ Last_Name: 'Sharma', Email: 'riya@example.com', Company: 'Acme' }] },
  { headers: { Authorization: 'Zoho-oauthtoken ' + accessToken } } // fixed prefix
);
\`\`\`

**Why it works:** Zoho runs separate data centers (US \`.com\`, EU \`.eu\`, India \`.in\`, Australia \`.com.au\`, and more). Accounts, tokens and data live in one of them. The \`api_domain\` in the token response always points to the right one.

**Other causes of 401 to check:**
- The access token expired (they last about 1 hour). Refresh it.
- The refresh token was made with too few **scopes** (for example no \`ZohoCRM.modules.leads.CREATE\`). That error is usually \`OAUTH_SCOPE_MISMATCH\`.
- The token-refresh call itself failed and you sent \`undefined\` as the token.`,
      followUps: [
        {
          q: 'Where should you store the refresh token?',
          a: 'In a secret store (AWS Secrets Manager, GCP Secret Manager) or an encrypted DB column. Never in the frontend or in git. It does not expire on its own, so it is a long-lived secret.',
        },
        {
          q: 'Should you refresh the access token before every API call?',
          a: 'No. Zoho limits how often you can create access tokens. Cache it and reuse it until shortly before it expires.',
        },
      ],
    },
    {
      id: 'jitsi-react-embed',
      title: 'Embed a Jitsi meeting in a React component',
      difficulty: 'easy',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'jitsi-embedding',
      question: `Write a React component \`<InterviewRoom roomName jwt displayName onLeave />\` that embeds a Jitsi meeting using the **IFrame API** (\`external_api.js\`).

Requirements:
- Mount the meeting inside a div.
- Call \`onLeave()\` when the user leaves the meeting.
- No duplicate iframes in React StrictMode (dev mode mounts effects twice).`,
      hints: [
        'Load `https://<your-domain>/external_api.js`. It adds `window.JitsiMeetExternalAPI`.',
        'Create the API in `useEffect` with `parentNode: ref.current`. Listen for the `videoConferenceLeft` event.',
        'Return a cleanup function that calls `api.dispose()`. That removes the iframe.',
      ],
      solution: `**Idea:** load the Jitsi script once, create \`JitsiMeetExternalAPI\` inside an effect, and always \`dispose()\` it in the cleanup.

\`\`\`jsx
import { useEffect, useRef } from 'react';

const DOMAIN = 'meet.example.com'; // your self-hosted Jitsi (or 8x8.vc for JaaS)

// Load the script only once, even if many components ask for it
let scriptPromise;
function loadJitsiScript() {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://' + DOMAIN + '/external_api.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = () => { scriptPromise = null; reject(new Error('Jitsi script failed')); };
      document.body.appendChild(s);
    });
  }
  return scriptPromise;
}

export default function InterviewRoom({ roomName, jwt, displayName, onLeave }) {
  const containerRef = useRef(null);
  const onLeaveRef = useRef(onLeave);
  onLeaveRef.current = onLeave; // always call the latest callback

  useEffect(() => {
    let api;
    let cancelled = false;

    loadJitsiScript().then(() => {
      if (cancelled) return; // component unmounted while loading
      api = new window.JitsiMeetExternalAPI(DOMAIN, {
        roomName,
        jwt,                               // token from your backend
        parentNode: containerRef.current,
        userInfo: { displayName },
        width: '100%',
        height: '100%',
        configOverwrite: { prejoinPageEnabled: true },
      });
      api.addListener('videoConferenceLeft', () => onLeaveRef.current?.());
    });

    return () => {
      cancelled = true;
      api?.dispose(); // removes the iframe and its listeners
    };
  }, [roomName, jwt, displayName]);

  return <div ref={containerRef} style={{ height: '80vh' }} />;
}
\`\`\`

**Why it works:** the effect creates exactly one meeting per mount. In StrictMode React runs mount, cleanup, mount. The cleanup disposes the first iframe, so only one stays. The \`cancelled\` flag covers the case where the component unmounts before the script finishes loading.

**Edge cases:**
- The JWT is generated by **your backend**. Never put the Jitsi app secret in frontend code.
- Changing \`roomName\` re-runs the effect: the old meeting is disposed and a new one starts.
- Keep \`onLeave\` in a ref so a new callback each render does not restart the meeting.`,
      followUps: [
        {
          q: 'How would you mute the candidate from your own button?',
          a: 'Call `api.executeCommand(\'toggleAudio\')`. The IFrame API has commands (hangup, toggleVideo, displayName...) and events (participantJoined, audioMuteStatusChanged...).',
        },
        {
          q: 'Is there a ready-made React wrapper?',
          a: 'Yes, `@jitsi/react-sdk` gives a `<JitsiMeeting />` component. Knowing the raw IFrame API still helps you debug it.',
        },
      ],
    },
    {
      id: 'sms-otp-send-verify',
      title: 'Send and verify an SMS OTP (expiry + rate limit)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'twilio-sms',
      question: `Build phone verification for sign-up with Twilio SMS:

- \`sendOtp(phone)\` sends a 6-digit code by SMS.
- \`verifyOtp(phone, code)\` checks it.

Rules:
- The code expires after **5 minutes**.
- Only **one** SMS per phone every 60 seconds, and at most **5 per hour** (SMS costs money, and attackers abuse OTP forms to send spam, called "SMS pumping").
- Max **5** wrong tries per code.
- Do not store the plain code in the database.`,
      hints: [
        'Use `crypto.randomInt` for the code, not `Math.random` (it is not secure).',
        'Store a hash of the code plus `expiresAt`, `attempts` and a list of recent send times per phone.',
        'Compare hashes with `crypto.timingSafeEqual`. Delete the code after a successful verify so it cannot be reused.',
      ],
      solution: `**Idea:** keep one record per phone: hashed code, expiry, wrong-attempt counter and recent send times. Check limits before sending and before verifying.

\`\`\`javascript
const crypto = require('node:crypto');
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_GAP_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

// HMAC with a server secret: a DB leak does not reveal codes
function hashCode(phone, code) {
  return crypto.createHmac('sha256', process.env.OTP_SECRET)
    .update(phone + ':' + code)
    .digest('hex');
}

// store = anything with async get/set (Redis, a Mongo collection, a Map in tests)
function createOtpService({ store, sendSms, now = Date.now }) {
  async function sendOtp(phone) {
    const rec = (await store.get(phone)) || { sends: [] };
    const t = now();
    const recentSends = rec.sends.filter((s) => t - s < 60 * 60 * 1000);

    if (recentSends.length && t - recentSends[recentSends.length - 1] < RESEND_GAP_MS) {
      return { ok: false, reason: 'WAIT_BEFORE_RESEND' };
    }
    if (recentSends.length >= MAX_SENDS_PER_HOUR) {
      return { ok: false, reason: 'TOO_MANY_REQUESTS' };
    }

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    await store.set(phone, {
      codeHash: hashCode(phone, code),
      expiresAt: t + OTP_TTL_MS,
      attempts: 0,
      sends: [...recentSends, t],
    });
    await sendSms(phone, 'Your verification code is ' + code + '. It expires in 5 minutes.');
    return { ok: true };
  }

  async function verifyOtp(phone, code) {
    const rec = await store.get(phone);
    if (!rec || !rec.codeHash) return { ok: false, reason: 'NO_CODE' };
    if (now() > rec.expiresAt) return { ok: false, reason: 'EXPIRED' };
    if (rec.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'TOO_MANY_ATTEMPTS' };

    rec.attempts += 1;               // count the try BEFORE comparing
    await store.set(phone, rec);

    const a = Buffer.from(hashCode(phone, String(code)));
    const b = Buffer.from(rec.codeHash);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { ok: false, reason: 'WRONG_CODE' };
    }

    await store.set(phone, { sends: rec.sends }); // one-time use: drop the code
    return { ok: true };
  }

  return { sendOtp, verifyOtp };
}

// Real SMS sender
const otp = createOtpService({
  store: myRedisStore,
  sendSms: (to, body) =>
    client.messages.create({ to, body, messagingServiceSid: process.env.TWILIO_MSG_SERVICE_SID }),
});
\`\`\`

**Why it works:**
- The hash means a stolen database does not leak live codes.
- The resend gap and hourly cap limit cost and SMS spam.
- 5 attempts on a 6-digit code gives an attacker a 5 in 1,000,000 chance.
- Deleting the code after success makes it single-use.

**Edge cases:**
- Normalize phone numbers to **E.164** (\`+919876543210\`) first, or \`98765 43210\` and \`+91 98765 43210\` count as different phones.
- Also rate-limit **per IP**, and block countries you do not serve. SMS pumping attacks rotate phone numbers.
- In Redis, set a TTL on the key so old records clean themselves up. In MongoDB use a TTL index on \`expiresAt\`.
- Two parallel requests can both pass the check. For strict limits, use an atomic counter (Redis \`INCR\` + \`EXPIRE\`).`,
      followUps: [
        {
          q: 'Would you build this yourself or use Twilio Verify?',
          a: 'In production I would usually use **Twilio Verify**. It generates, sends and checks codes, handles expiry, retries, many channels (SMS, WhatsApp, email) and has fraud protection. You call `client.verify.v2.services(sid).verifications.create({ to, channel: \'sms\' })` and then `verificationChecks.create({ to, code })`. Building it yourself shows the interviewer you understand the rules.',
        },
        {
          q: 'Why not Math.random() for the code?',
          a: '`Math.random()` is not cryptographically secure. Its output can be predicted. `crypto.randomInt` uses a secure source.',
        },
        {
          q: 'How do you know the SMS was actually delivered?',
          a: 'Pass a `statusCallback` URL in `messages.create`. Twilio posts `MessageStatus` (queued, sent, delivered, undelivered, failed) with an `ErrorCode` when it fails.',
        },
      ],
    },
    {
      id: 'call-status-lifecycle',
      title: 'Track a call\'s lifecycle with statusCallback',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'twilio-status-callbacks',
      question: `Your app places outbound calls to candidates (an AI agent interviews them). Product wants a dashboard: for each call show the current status (ringing, in progress, completed, no answer, busy, failed), the duration, and a timeline of events.

1. Start the call so Twilio reports status changes.
2. Write the \`POST /twilio/call-status\` webhook that stores this in MongoDB (Mongoose).

Twilio may **retry** a webhook, and webhooks can arrive **out of order**. Your data must stay correct.`,
      hints: [
        'In `client.calls.create` pass `statusCallback` and `statusCallbackEvent: [\'initiated\', \'ringing\', \'answered\', \'completed\']`.',
        'Each callback has `CallSid`, `CallStatus`, and a `SequenceNumber` that increases for each callback of that call.',
        'Only overwrite the current status if the new SequenceNumber is bigger than the one you stored. Only push a timeline event if that sequence number is not already there.',
      ],
      solution: `**Idea:** save the call when you create it. In the webhook, add the event to the timeline only once, and update the "current status" only when the event is newer than what you have.

\`\`\`javascript
const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  callSid: { type: String, unique: true, required: true },
  candidateId: String,
  status: String,
  lastSeq: { type: Number, default: -1 },   // highest SequenceNumber applied
  durationSec: Number,
  events: [{ seq: Number, status: String, at: Date }],
});
const Call = mongoose.model('Call', callSchema);

// 1. Start the call and ask for status callbacks
async function startInterviewCall(candidate) {
  const call = await client.calls.create({
    to: candidate.phone,
    from: process.env.TWILIO_NUMBER,
    url: process.env.PUBLIC_BASE_URL + '/voice/agent',          // TwiML for the call
    statusCallback: process.env.PUBLIC_BASE_URL + '/twilio/call-status',
    statusCallbackMethod: 'POST',
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
  });
  await Call.create({ callSid: call.sid, candidateId: candidate.id, status: call.status });
  return call.sid;
}

// 2. The webhook (signature check middleware runs before this)
app.post('/twilio/call-status', express.urlencoded({ extended: false }), twilioOnly,
  async (req, res) => {
    const { CallSid, CallStatus, CallDuration, Timestamp } = req.body;
    const seq = Number(req.body.SequenceNumber);
    const at = Timestamp ? new Date(Timestamp) : new Date();

    // Make sure the doc exists (covers inbound calls we did not create)
    await Call.updateOne(
      { callSid: CallSid },
      { $setOnInsert: { callSid: CallSid, lastSeq: -1 } },
      { upsert: true }
    );

    // Timeline: push only if this seq is not stored yet (retries are ignored)
    await Call.updateOne(
      { callSid: CallSid, 'events.seq': { $ne: seq } },
      { $push: { events: { seq, status: CallStatus, at } } }
    );

    // Current status: only move forward, never backward
    const update = { status: CallStatus, lastSeq: seq };
    if (CallDuration) update.durationSec = Number(CallDuration);
    await Call.updateOne({ callSid: CallSid, lastSeq: { $lt: seq } }, { $set: update });

    res.sendStatus(204); // answer fast; Twilio only needs a 2xx
  }
);
\`\`\`

**Why it works:**
- \`'events.seq': { $ne: seq }\` makes the push **idempotent**: a retried webhook matches no document, so nothing is added twice.
- \`lastSeq: { $lt: seq }\` means an old event that arrives late cannot overwrite a newer status (for example "ringing" arriving after "completed").
- Each update is a single atomic MongoDB operation, so two webhooks at the same time cannot corrupt the document.

**Edge cases:**
- \`no-answer\`, \`busy\`, \`failed\` and \`canceled\` are final states too, not only \`completed\`. Show them clearly and maybe schedule a retry call.
- \`CallDuration\` is only sent on the final callback.
- If you trigger slow work (emails, CRM updates), put it on a queue and respond 204 right away.`,
      followUps: [
        {
          q: 'What if you do not get a SequenceNumber (older or other webhooks)?',
          a: 'Rank the statuses yourself: queued < initiated < ringing < in-progress < final states. Only move to a higher rank. Store the raw events anyway for debugging.',
        },
        {
          q: 'How do you detect a voicemail answering instead of the candidate?',
          a: 'Use Twilio Answering Machine Detection: pass `machineDetection: \'Enable\'` to `calls.create`. The `AnsweredBy` param tells you `human` or a `machine_...` value.',
        },
      ],
    },
    {
      id: 'twilio-11200-behind-proxy',
      title: 'Debug: webhook works on ngrok but fails in production (11200)',
      difficulty: 'medium',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'webhook-testing-debugging',
      question: `Locally (with ngrok) this works. After deploying behind an AWS load balancer (HTTPS ends at the load balancer, your app gets plain HTTP), the Twilio Console Debugger shows **11200 HTTP retrieval failure** for every call. Your logs show many \`403\`s and some requests that take 20+ seconds. Find all the bugs.

\`\`\`javascript
const app = express();
app.use(express.json());

app.post('/voice/status', async (req, res) => {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  const ok = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN, req.get('X-Twilio-Signature'), url, req.body);
  if (!ok) return res.sendStatus(403);

  await updateZohoAndEmailRecruiter(req.body); // takes 5-25 seconds
  res.sendStatus(204);
});
\`\`\``,
      hints: [
        'What content type does Twilio use for webhook bodies? What does `express.json()` do with it?',
        'Behind the load balancer, what is `req.protocol`? What URL did Twilio actually call?',
        'Twilio waits about 15 seconds for your response. What happens to slow requests?',
      ],
      solution: `**Idea:** three separate bugs.

1. **Wrong body parser.** Twilio sends \`application/x-www-form-urlencoded\`. \`express.json()\` ignores it, so \`req.body\` is \`{}\`. The signature is computed over the params, so it never matches.
2. **Wrong URL.** TLS ends at the load balancer. Your app sees \`http\`, so you validate against \`http://...\` while Twilio signed \`https://...\`. Mismatch, 403.
3. **Too slow.** Twilio gives up after about 15 seconds and reports 11200. Never do slow work before responding.

\`\`\`javascript
const app = express();
// Trust X-Forwarded-Proto / X-Forwarded-Host from the load balancer
app.set('trust proxy', 1);

app.post('/voice/status',
  express.urlencoded({ extended: false }),   // fix 1: Twilio's body format
  async (req, res) => {
    // fix 2: use the public URL Twilio called. A config value is the safest.
    const url = process.env.PUBLIC_BASE_URL + req.originalUrl; // https://api.myapp.com
    const ok = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN, req.get('X-Twilio-Signature') || '', url, req.body);
    if (!ok) return res.sendStatus(403);

    // fix 3: save the job (fast, durable), answer now, do the slow work in a worker
    await jobQueue.add('call-status', req.body, { jobId: req.body.CallSid + ':' + req.body.SequenceNumber });
    res.sendStatus(204);
  }
);
\`\`\`

**Why it works:** the body now has the params, the URL matches what Twilio signed, and Twilio gets a 2xx in milliseconds because the slow CRM and email work runs in a queue worker. The queue job id makes retries safe (same id = same job, added once).

**How to find this kind of bug fast:**
- Open the **Twilio Console Debugger**. It shows the request Twilio sent and the response it got.
- Log the URL you validate against and compare it with the webhook URL in the Twilio Console. Look at protocol, host, port, trailing slash and query string.
- If nginx sits in front, make sure it forwards the real host: \`proxy_set_header Host $host;\` and \`X-Forwarded-Proto\`.`,
      followUps: [
        {
          q: 'Is it safe to respond before the work is done?',
          a: 'Yes, if the work is saved somewhere durable first (a queue like BullMQ/SQS, or a DB row). If you only keep it in memory and the server crashes, you lose it.',
        },
        {
          q: 'What does Twilio error 12300 mean?',
          a: 'Invalid Content-Type. Twilio expected TwiML (`text/xml`) from a voice URL but got something else, like HTML from an error page or JSON.',
        },
      ],
    },
    {
      id: 'zoho-token-cache-retry',
      title: 'Zoho token helper: cache, refresh once, retry on 401',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'zoho-oauth2',
      question: `Many parts of your Node app call the Zoho CRM API. Today each call fetches a new access token, and Zoho started blocking you for "too many token requests". Write a small helper that:

- Caches the access token until shortly before it expires (tokens live about 1 hour).
- If 20 requests need a token at the same time, makes only **one** refresh call.
- If an API call returns **401** (token revoked or expired early), refreshes once and retries once.

Make it easy to unit-test (no real network in tests).`,
      hints: [
        'Keep `cached = { token, apiDomain, expiresAt }` in a closure. Refresh 5 minutes before `expiresAt`.',
        'Keep the refresh promise in a variable (`inflight`). Everyone who arrives during a refresh awaits the same promise. This is called "single flight".',
        'On 401 only throw away the cache if it still holds the token that failed. Otherwise 20 failing requests trigger 20 refreshes.',
      ],
      solution: `**Idea:** one shared cache + one shared in-flight promise. Pass the token-fetch function and the HTTP client in from outside, so tests can fake them.

\`\`\`javascript
function createZohoTokenProvider({ fetchToken, now = Date.now }) {
  let cached = null;    // { token, apiDomain, expiresAt }
  let inflight = null;  // promise of the refresh in progress

  async function getToken() {
    // Reuse until 5 minutes before expiry
    if (cached && now() < cached.expiresAt - 5 * 60 * 1000) return cached;

    if (!inflight) {
      inflight = fetchToken()
        .then((data) => {
          if (!data.access_token) {
            throw new Error('Zoho token refresh failed: ' + (data.error || 'unknown'));
          }
          cached = {
            token: data.access_token,
            apiDomain: data.api_domain,
            expiresAt: now() + data.expires_in * 1000, // expires_in is in seconds
          };
          return cached;
        })
        .finally(() => { inflight = null; });
    }
    return inflight; // everyone waits for the same refresh
  }

  // Drop the cache only if it still holds the token that failed
  function invalidate(badToken) {
    if (cached && cached.token === badToken) cached = null;
  }

  return { getToken, invalidate };
}

async function zohoRequest(tokens, http, { method = 'GET', path, data }) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const { token, apiDomain } = await tokens.getToken();
    try {
      return await http({
        method,
        url: apiDomain + path,
        data,
        headers: { Authorization: 'Zoho-oauthtoken ' + token },
      });
    } catch (err) {
      const status = err.response && err.response.status;
      if (status === 401 && attempt === 1) {
        tokens.invalidate(token); // next loop gets a fresh token
        continue;
      }
      throw err; // other errors, or 401 twice: give up
    }
  }
}

// Wiring it up for real
const axios = require('axios');
const tokens = createZohoTokenProvider({
  fetchToken: async () => {
    const res = await axios.post(process.env.ZOHO_ACCOUNTS_URL + '/oauth/v2/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
      },
    });
    return res.data;
  },
});

const lead = await zohoRequest(tokens, axios, { path: '/crm/v2/Leads/123' });
\`\`\`

**Why it works:**
- The cache removes almost all token calls.
- The \`inflight\` promise means 20 parallel callers share one refresh.
- \`invalidate(token)\` compares tokens. When 20 requests fail with the same old token, the first one clears the cache, the rest find either the refresh already running or a new token already cached. So you get one refresh, not 20.
- We retry only once. A second 401 means a real problem (revoked refresh token, missing scope), and looping would hide it.

**Edge cases:**
- With several server instances (or Lambda), each has its own cache. Store the token in **Redis** with a TTL and use a short lock so only one instance refreshes.
- If the refresh token itself is revoked, alert a human. Code cannot fix that.`,
      followUps: [
        {
          q: 'How would you unit-test the "only one refresh" rule?',
          a: 'Pass a fake `fetchToken` that counts calls and waits 10 ms. Fire 5 `zohoRequest` calls with `Promise.all` against a fake `http` that returns 401 for the old token. Assert the counter went up by exactly one.',
        },
        {
          q: 'Why refresh 5 minutes early instead of exactly at expiry?',
          a: 'Clock drift and slow requests. A token that is valid when you read it could expire while the request is on the network.',
        },
      ],
    },
    {
      id: 'zoho-upsert-lead',
      title: 'Create a Zoho lead without duplicates (upsert)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'zoho-leads-upsert',
      question: `When someone fills the "Book a demo" form on your Next.js site, you create a lead in Zoho CRM. Sales complains about **duplicate leads**: the same person submits twice, or a webhook retries.

Write \`syncLeadToZoho(form)\` so that:
- A new email creates a lead.
- An existing email updates the existing lead (new phone, new message).
- You save the Zoho lead id in MongoDB for later.`,
      hints: [
        'Zoho has an upsert endpoint: `POST /crm/v2/Leads/upsert` (newer API versions such as v6/v7 have it too).',
        'Send `duplicate_check_fields: [\'Email\']` in the body. Zoho looks for a lead with that email first.',
        'Normalize the email (trim + lowercase) before sending, or "Riya@X.com" and "riya@x.com" become two leads.',
      ],
      solution: `**Idea:** let Zoho decide insert vs update with the **upsert** API and a duplicate-check field. Normalize the key before sending.

\`\`\`javascript
async function syncLeadToZoho(form) {
  const email = form.email.trim().toLowerCase();       // one person = one key

  const body = {
    data: [{
      Last_Name: form.lastName || 'Unknown',            // required field in Leads
      First_Name: form.firstName,
      Email: email,
      Phone: form.phone,
      Company: form.company || 'Not provided',          // required by default too
      Lead_Source: 'Website Demo Form',
      Description: form.message,
    }],
    duplicate_check_fields: ['Email'],                  // match existing lead by email
    trigger: ['workflow'],                              // run Zoho workflow rules
  };

  const res = await zohoRequest(tokens, axios, {
    method: 'POST',
    path: '/crm/v2/Leads/upsert',
    data: body,
  });

  const result = res.data.data[0];
  if (result.status !== 'success') {
    // e.g. code MANDATORY_NOT_FOUND, INVALID_DATA. details says which field.
    throw new Error('Zoho upsert failed: ' + result.code + ' ' + JSON.stringify(result.details));
  }

  // result.action is 'insert' or 'update'
  await Lead.updateOne(
    { email },
    { $set: { zohoLeadId: result.details.id, lastSyncedAt: new Date() } },
    { upsert: true }
  );
  return { zohoLeadId: result.details.id, action: result.action };
}
\`\`\`

**Why it works:** upsert is **idempotent** for the same email. Submitting twice, or a retry, updates the same lead instead of creating a new one. Zoho tells you which happened in \`action\`.

**Edge cases:**
- **Race condition:** two submits at the exact same moment can both see "no lead" and both insert. Fixes: mark the Email field as "no duplicate values" in Zoho field settings, and/or process leads through a queue keyed by email so they run one at a time.
- Zoho returns HTTP 200/201/202 with per-record status. Always check \`data[0].status\`, not just the HTTP code.
- Empty \`Last_Name\` or \`Company\` fails with \`MANDATORY_NOT_FOUND\`. Give safe defaults.
- Do not call Zoho inside the user's request if it is slow. Save the form, respond, and sync from a background job.`,
      followUps: [
        {
          q: 'What if the person already exists as a Contact (converted lead), not a Lead?',
          a: 'Upsert on Leads will not see Contacts. Search Contacts first (search API by email), and if found, add a note or task to the contact instead of creating a new lead.',
        },
        {
          q: 'How do you send 500 leads at once?',
          a: 'The upsert endpoint accepts up to 100 records per call. Chunk the list into batches of 100. For much larger imports use Zoho\'s Bulk Write API (async job with a CSV).',
        },
      ],
    },
    {
      id: 'jitsi-jwt-join-window',
      title: 'Generate a Jitsi room JWT that only works during the interview slot',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'jitsi-jwt',
      question: `Interviews are scheduled in your app (\`startAt\`, \`endAt\`, \`candidateId\`, \`interviewerIds\`, \`roomName\`). Your self-hosted Jitsi uses **JWT authentication** (shared app id + app secret, HS256).

Write \`createJoinToken({ interview, user, now })\` for the endpoint \`GET /interviews/:id/join-token\`:
- Only the candidate and the interviewers may join.
- Joining opens **10 minutes before** \`startAt\` and closes **15 minutes after** \`endAt\`.
- Interviewers are moderators; the candidate is not.
- The token must only work for this one room.

Use \`node:crypto\` (no JWT library) so you show you know how a JWT is built.`,
      hints: [
        'A JWT is `base64url(header) + "." + base64url(payload) + "." + signature`. The signature is HMAC-SHA256 of the first two parts with the secret.',
        'Jitsi checks claims like `aud`, `iss`, `sub` (your domain), `room`, `exp` and `nbf`. User details go in `context.user`.',
        'Check the time window and participant list on the server BEFORE you sign. Then set `nbf`/`exp` to the same window so the token itself also stops working.',
      ],
      solution: `**Idea:** check permission and time on the server, then sign a short-lived token locked to one room. The token's \`nbf\` ("not before") and \`exp\` ("expires") match the join window, so even a leaked token is useless outside the slot.

\`\`\`javascript
const crypto = require('node:crypto');

const EARLY_JOIN_MIN = 10;
const LATE_JOIN_MIN = 15;

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

function signHs256(payload, secret) {
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const body = b64url(payload);
  const sig = crypto.createHmac('sha256', secret)
    .update(header + '.' + body)
    .digest('base64url');
  return header + '.' + body + '.' + sig;
}

function createJoinToken({ interview, user, now = Date.now() }) {
  const opensAt = interview.startAt.getTime() - EARLY_JOIN_MIN * 60 * 1000;
  const closesAt = interview.endAt.getTime() + LATE_JOIN_MIN * 60 * 1000;

  if (now < opensAt) return { ok: false, reason: 'TOO_EARLY', opensAt: new Date(opensAt) };
  if (now > closesAt) return { ok: false, reason: 'INTERVIEW_OVER' };

  const isInterviewer = interview.interviewerIds.includes(user.id);
  const isCandidate = interview.candidateId === user.id;
  if (!isInterviewer && !isCandidate) return { ok: false, reason: 'NOT_A_PARTICIPANT' };

  const payload = {
    aud: 'jitsi',                        // must match the audience your Prosody expects
    iss: process.env.JITSI_APP_ID,       // app_id configured on the Jitsi server
    sub: process.env.JITSI_DOMAIN,       // e.g. meet.example.com
    room: interview.roomName,            // token works for this room only ('*' = any room)
    iat: Math.floor(now / 1000),         // JWT times are in SECONDS, not ms
    nbf: Math.floor(opensAt / 1000),
    exp: Math.floor(closesAt / 1000),
    context: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        moderator: isInterviewer,        // read by JaaS / a token-moderation plugin
      },
    },
  };

  return {
    ok: true,
    jwt: signHs256(payload, process.env.JITSI_APP_SECRET),
    roomName: interview.roomName,
  };
}

// Express route
app.get('/interviews/:id/join-token', requireLogin, async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) return res.sendStatus(404);
  const result = createJoinToken({ interview, user: req.user });
  if (!result.ok) return res.status(403).json(result);
  res.json(result);
});
\`\`\`

With a library this is one line: \`jwt.sign(payload, secret, { algorithm: 'HS256' })\` from \`jsonwebtoken\`.

**Why it works:** the server decides who may join and when. The signature proves the token came from your server, so the user cannot edit \`room\` or \`exp\`. Jitsi rejects tokens whose \`room\` does not match or whose time is outside \`nbf\`..\`exp\`.

**Edge cases:**
- Use an **unguessable** room name (\`int-\` + random id), not \`interview-42\`.
- Server clocks drift. Jitsi may allow a small leeway. Keep your servers on NTP.
- Moderator support depends on your setup. **JaaS (8x8)** reads \`context.user.moderator\` and needs **RS256** with a \`kid\` header (your API key id). Self-hosted Prosody needs a plugin for token-based moderator rights. Check the docs for your setup.
- \`exp\` does not kick out someone already in the room. It only blocks new joins.`,
      followUps: [
        {
          q: 'How would you end the meeting for everyone at endAt + 15 min?',
          a: 'Kick participants from the server side, for example with a scheduled job that uses a Prosody admin module or the JaaS API, or have the interviewer client run `api.executeCommand(\'hangup\')`. A token expiry alone does not end a live call.',
        },
        {
          q: 'Why HS256 for self-hosted but RS256 for JaaS?',
          a: 'With HS256 both sides share one secret, fine when you run both. With RS256 you keep the private key and 8x8 only gets the public key, so the provider can verify tokens but never create them.',
        },
      ],
    },
    {
      id: 'candidate-cannot-join-video',
      title: 'Scenario: the candidate cannot join the video interview',
      difficulty: 'medium',
      type: 'scenario',
      frequency: 'very common',
      relatedTopic: 'webrtc-basics',
      question: `An interview starts in 5 minutes. The candidate messages support: "I can join the page but nobody can see or hear me, and I cannot see the interviewer." Other candidates are fine today. The candidate is on their company laptop on office Wi-Fi.

How do you troubleshoot this right now, and what do you change in your setup so it happens less?`,
      hints: [
        'Split it into layers: browser/device permissions, signalling (can they connect to the room?) and media (does audio/video flow?).',
        'They joined the page but media does not flow. What does a corporate firewall often block that WebRTC needs?',
        'Jitsi Videobridge uses UDP port 10000 by default. What is the fallback when UDP is blocked?',
      ],
      solution: `**Idea:** find which layer fails. Joining works (signalling is OK), media does not, and it happens on a corporate network. That strongly points to a **firewall blocking UDP**, with no TURN fallback.

#### Quick checks (while the candidate waits)

1. **Device and browser:** is the camera/mic allowed in the browser (lock icon in the address bar)? Is another app (Teams, Zoom) holding the camera? Is the browser up to date (Chrome, Edge, Firefox, Safari)?
2. **Network:** ask them to switch to a **mobile hotspot**. If it works there, it is the office network.
3. **Look at stats:** in Chrome open \`chrome://webrtc-internals\` and check whether ICE (the step that finds a network path) ever reaches "connected". The Jitsi client logs also show ICE failures.

Fastest fix for today: hotspot, or a phone dial-in if you offer one.

#### Why it happens

- WebRTC sends media over **UDP**. Jitsi Videobridge (JVB, the media server) listens on **UDP 10000** by default.
- Many company firewalls block all UDP and unusual ports. They only allow web traffic on **TCP 443**.
- Signalling (joining the room) runs over HTTPS/WebSocket on 443, so the page loads and the join "works". Only the media fails.

#### Permanent fixes

- Run a **TURN server** (for example coturn) listening on **TCP/TLS 443**. TURN relays media inside a normal-looking HTTPS connection, which passes most firewalls. Configure it in Jitsi so clients get it as an ICE server.
- Put TURN on its own IP/domain so it can use 443 without clashing with your web server.
- Add a **pre-call test page**: check camera, mic and a test connection before the interview, and show clear messages ("Your network blocks video. Try another network.").
- Log ICE failures per user, so support sees the cause instantly.
- Send setup tips in the invite email (Chrome, close other video apps, test link).

**Edge cases:** some proxies even inspect TLS and break TURN over TLS. Then only a different network or dial-in helps. If **many** users fail at once, suspect your server instead (JVB down, port 10000 closed in the cloud security group, wrong public IP set on JVB behind NAT).`,
      followUps: [
        {
          q: 'What is the difference between STUN and TURN?',
          a: 'STUN tells a browser its public IP and port so peers can connect directly. It is cheap. TURN relays all the media through your server when a direct path is impossible. It always works but costs bandwidth.',
        },
        {
          q: 'Everyone has no video after you moved Jitsi to AWS. What do you check?',
          a: 'The security group allows UDP 10000 inbound, and JVB knows its public IP (it sits behind NAT on EC2). Without the right advertised address, clients try to send media to a private IP.',
        },
      ],
    },
    {
      id: 'twilio-media-stream-server',
      title: 'Handle a Twilio bidirectional Media Stream over WebSocket',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'twilio-media-streams',
      question: `You are building an AI voice interviewer. When the candidate answers the call, the audio must go to your Node server in real time, to a speech-to-text (STT) service, then an LLM, then text-to-speech (TTS), and the AI voice must play back on the call.

1. Return the TwiML that connects the call to \`wss://api.myapp.com/media\` and passes the \`interviewId\`.
2. Write the WebSocket server (\`ws\` package) that handles the \`connected\`, \`start\`, \`media\` and \`stop\` events.
3. Send TTS audio back to the caller, and stop the AI talking when the candidate interrupts ("barge-in").

Assume you have \`createStt()\` (emits \`'transcript'\` with final text and \`'speechStarted'\`) and \`tts(text)\` (an async generator yielding base64 mu-law 8 kHz chunks).`,
      hints: [
        'TwiML: `<Connect><Stream url="wss://..."><Parameter name="interviewId" value="..."/></Stream></Connect>`. `<Connect>` makes the stream bidirectional and keeps the call open while the socket is open.',
        'Each message is JSON with an `event` field. `start` gives you `streamSid`, `callSid` and `customParameters`. `media.payload` is base64 audio (mu-law, 8000 Hz, mono).',
        'Send audio back as `{ event: \'media\', streamSid, media: { payload } }`. To cut off playback, send `{ event: \'clear\', streamSid }`.',
      ],
      solution: `**Idea:** one WebSocket = one call. Keep per-call state in the connection handler's closure. Pipe incoming audio to STT, and when a final transcript arrives, ask the LLM and stream TTS chunks back. If the candidate starts speaking, send \`clear\` and cancel the current reply.

**1. TwiML**

\`\`\`javascript
app.post('/voice/agent', express.urlencoded({ extended: false }), twilioOnly, (req, res) => {
  const vr = new twilio.twiml.VoiceResponse();
  const connect = vr.connect();
  const stream = connect.stream({ url: 'wss://api.myapp.com/media' });
  stream.parameter({ name: 'interviewId', value: req.query.interviewId });
  res.type('text/xml').send(vr.toString());
});
\`\`\`

**2 + 3. WebSocket server**

\`\`\`javascript
const http = require('node:http');
const { WebSocketServer } = require('ws');

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/media' });

wss.on('connection', (ws) => {
  let streamSid = null;
  let interviewId = null;
  let stt = null;
  let replyId = 0;               // increases on every new reply / interruption
  const history = [];            // conversation for the LLM

  function send(msg) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
  }

  async function speak(text) {
    const myReply = ++replyId;
    for await (const chunk of tts(text)) {
      if (myReply !== replyId) return;         // interrupted: stop sending
      send({ event: 'media', streamSid, media: { payload: chunk } });
    }
    // Twilio echoes this mark back when playback really finished
    send({ event: 'mark', streamSid, mark: { name: 'reply-' + myReply } });
  }

  ws.on('message', async (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.event) {
      case 'connected':
        break; // first message, no audio yet

      case 'start':
        streamSid = msg.start.streamSid;
        interviewId = msg.start.customParameters.interviewId;
        stt = createStt({ encoding: 'mulaw', sampleRate: 8000 });

        // Barge-in: candidate talks while the AI talks
        stt.on('speechStarted', () => {
          replyId++;                           // cancels the running speak()
          send({ event: 'clear', streamSid }); // drops audio Twilio has buffered
        });

        stt.on('transcript', async (text) => {
          history.push({ role: 'user', content: text });
          const answer = await askLlm(interviewId, history);
          history.push({ role: 'assistant', content: answer });
          await speak(answer);
        });

        speak('Hi! Thanks for joining. Can you introduce yourself?');
        break;

      case 'media':
        if (msg.media.track === 'inbound' || !msg.media.track) {
          stt.write(Buffer.from(msg.media.payload, 'base64'));
        }
        break;

      case 'mark':
        // msg.mark.name finished playing; useful for "AI is speaking" state
        break;

      case 'stop':
        stt?.end();
        saveTranscript(interviewId, history); // persist for scoring
        break;
    }
  });

  ws.on('close', () => stt?.end());
  ws.on('error', (err) => console.error('media ws error', err));
});

server.listen(3000);
\`\`\`

**Why it works:**
- Every call gets its own closure, so state never leaks between calls.
- \`replyId\` is a simple cancel token. A new reply or an interruption bumps it, and the old \`speak\` loop notices and stops.
- \`clear\` tells Twilio to throw away audio it has buffered but not played yet. Without it the AI keeps talking for seconds after the interruption.

**Edge cases:**
- Audio format must match: Twilio sends and expects **mu-law, 8000 Hz, mono, base64**. Sending MP3 or 16 kHz PCM sounds like noise. Ask your TTS for \`ulaw_8000\` or convert it.
- **Latency** is the main UX problem. Stream everything: STT partials, LLM tokens to TTS sentence by sentence, TTS chunks to Twilio.
- A slow LLM call could answer an old question after a new one. Check \`replyId\` again before speaking.
- Load balancers must allow WebSocket upgrades and long idle times. Sticky sessions are not needed (one socket = one server).
- Twilio also signs the WebSocket upgrade request with \`X-Twilio-Signature\`. Validate it (check the docs for which URL to use).`,
      followUps: [
        {
          q: 'How does this scale to 500 calls at the same time?',
          a: 'Each call is one socket plus STT/TTS streams. Node handles many sockets, but CPU work (audio conversion) and memory per call add up. Run several instances behind a load balancer, keep calls stateless between instances, and watch event-loop lag. Provider rate limits (STT, LLM, TTS) usually hit first.',
        },
        {
          q: 'Why `<Connect><Stream>` and not `<Start><Stream>`?',
          a: '`<Start><Stream>` forks a copy of the audio one way (good for live transcription) while TwiML continues. `<Connect><Stream>` is bidirectional: you can send audio back, and the call stays on the stream until the socket closes.',
        },
        {
          q: 'How do you end the call when the interview is done?',
          a: 'Update the call with the REST API: `client.calls(callSid).update({ twiml: \'<Response><Say>Thank you, goodbye.</Say><Hangup/></Response>\' })`, or simply close the WebSocket so TwiML continues after `<Connect>`.',
        },
      ],
    },
    {
      id: 'deal-won-provision-workspace',
      title: 'Deal won in Zoho → provision the client workspace (idempotent + retries)',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'zoho-workspace-provisioning',
      question: `When a deal's stage becomes **Closed Won** in Zoho CRM, your system must:

1. Create a tenant (workspace) in your MongoDB.
2. Create the client admin user and send an invite email.
3. Create a Stripe customer + subscription.
4. Write the workspace URL back to the Zoho deal.

Zoho calls your webhook when the deal is won. Problems seen in production: Zoho sometimes sends the webhook **twice**, Stripe sometimes times out, and once a crash halfway left a tenant without an admin.

Design and code the flow so that each step happens **exactly once** in effect, failures retry, and a crash can resume.`,
      hints: [
        'Do not do the 4 steps inside the webhook. Store a "provisioning job" with a unique key (the deal id), respond 200, and let a worker run it.',
        'Save which steps finished in the job document. On retry, skip finished steps.',
        'Make each step idempotent on its own too: unique index on tenant.zohoDealId, Stripe `idempotencyKey`, upsert-style writes.',
      ],
      solution: `**Idea:** turn the webhook into a durable **job** keyed by the deal id. A worker runs the steps in order and records each finished step. Every step is idempotent, so running it twice is harmless. Failed jobs retry with exponential backoff, and after too many failures they go to a "needs a human" state.

#### 1. Webhook: just record the job

\`\`\`javascript
app.post('/zoho/deal-won', express.json(), verifyZohoSecret, async (req, res) => {
  const dealId = String(req.body.dealId);
  try {
    // unique index on dealId: the second webhook fails with E11000 and is ignored
    await ProvisionJob.create({
      dealId, status: 'pending', completed: [], outputs: {}, attempts: 0, runAfter: new Date(),
    });
  } catch (err) {
    if (err.code !== 11000) throw err;   // 11000 = duplicate key = already queued
  }
  res.sendStatus(200);                    // answer fast so Zoho does not retry
});
\`\`\`

#### 2. The steps (each one idempotent)

\`\`\`javascript
const steps = [
  {
    name: 'createTenant',
    run: async (job) => {
      const deal = await zohoGetDeal(job.dealId);
      // upsert on a unique zohoDealId: running twice returns the same tenant
      const tenant = await Tenant.findOneAndUpdate(
        { zohoDealId: job.dealId },
        { $setOnInsert: { name: deal.Account_Name.name, slug: makeSlug(deal), plan: deal.Plan } },
        { upsert: true, new: true }
      );
      return { tenantId: String(tenant._id), slug: tenant.slug, adminEmail: deal.Contact_Email };
    },
  },
  {
    name: 'createAdmin',
    run: async (job) => {
      await User.updateOne(
        { email: job.outputs.adminEmail, tenantId: job.outputs.tenantId },
        { $setOnInsert: { role: 'admin', status: 'invited' } },
        { upsert: true }
      );
      // the email service dedupes on this key, so a retry does not send twice
      await sendInviteEmail(job.outputs.adminEmail, { dedupeKey: 'invite:' + job.dealId });
    },
  },
  {
    name: 'createStripeSubscription',
    run: async (job) => {
      const customer = await stripe.customers.create(
        { email: job.outputs.adminEmail, metadata: { tenantId: job.outputs.tenantId } },
        { idempotencyKey: 'cust:' + job.dealId }       // same key = same customer
      );
      const sub = await stripe.subscriptions.create(
        { customer: customer.id, items: [{ price: process.env.STRIPE_PRICE_ID }] },
        { idempotencyKey: 'sub:' + job.dealId }
      );
      return { stripeCustomerId: customer.id, stripeSubscriptionId: sub.id };
    },
  },
  {
    name: 'updateZohoDeal',
    run: async (job) => {
      // setting the same value twice is harmless
      await zohoUpdateDeal(job.dealId, {
        Workspace_URL: 'https://' + job.outputs.slug + '.myapp.com',
      });
    },
  },
];
\`\`\`

#### 3. The worker: resume, retry, back off

\`\`\`javascript
const MAX_ATTEMPTS = 8;

async function runJob(job) {
  for (const step of steps) {
    if (job.completed.includes(step.name)) continue;      // finished earlier: skip
    const out = await step.run(job);
    job.completed.push(step.name);
    Object.assign(job.outputs, out || {});
    await job.save();                                     // checkpoint after EVERY step
  }
  job.status = 'done';
  await job.save();
}

async function workerTick() {
  // Claim one due job atomically, so two workers never run the same job
  const job = await ProvisionJob.findOneAndUpdate(
    { status: { $in: ['pending', 'retry'] }, runAfter: { $lte: new Date() } },
    { $set: { status: 'running', lockedAt: new Date() }, $inc: { attempts: 1 } },
    { new: true }
  );
  if (!job) return;

  try {
    await runJob(job);
  } catch (err) {
    const failedForGood = job.attempts >= MAX_ATTEMPTS;
    const delayMs = Math.min(60 * 60 * 1000, 30 * 1000 * 2 ** job.attempts); // 1m, 2m, 4m... max 1h
    job.status = failedForGood ? 'failed' : 'retry';
    job.runAfter = new Date(Date.now() + delayMs);
    job.lastError = err.message;
    await job.save();
    if (failedForGood) await alertOps('Provisioning failed for deal ' + job.dealId, err);
  }
}
\`\`\`

**Why it works:**
- **Duplicate webhooks:** the unique \`dealId\` index lets only one job exist.
- **Crash halfway:** \`completed\` is saved after every step, so a restarted job continues where it stopped.
- **Crash inside a step** (work done, checkpoint not saved): the step runs again, but it is idempotent (upserts, Stripe idempotency keys, email dedupe key), so nothing is created twice.
- **Flaky Stripe / Zoho:** retries with exponential backoff, then a clear \`failed\` state with an alert instead of silent half-provisioned tenants.

**Edge cases:**
- Add a "stuck job" sweeper: jobs in \`running\` with an old \`lockedAt\` (worker died) go back to \`retry\`.
- Verify the webhook really comes from Zoho (a shared secret header or token in the URL that you configured in the Zoho webhook).
- Stripe idempotency keys expire after about 24 hours. For longer retries, first look up the customer by \`metadata\` or store the id as soon as you get it.
- A deal can go **Closed Won → reopened → Closed Won**. Decide if that should provision again (usually not: the unique key handles it).`,
      followUps: [
        {
          q: 'Why not run the 4 steps inside the webhook handler?',
          a: 'It is slow (Zoho may time out and retry), a crash loses the progress, and you cannot retry one failed step. A job table gives you a durable record, retries and visibility.',
        },
        {
          q: 'Would you use BullMQ or SQS instead of a Mongo job table?',
          a: 'Yes, both are good. BullMQ gives retries/backoff and jobId dedupe out of the box. You still need the step checkpoints and idempotent steps, because a queue only guarantees "at least once" delivery.',
        },
        {
          q: 'How would you handle "deal lost after being won" (refund / cancel)?',
          a: 'A separate de-provisioning job with its own key (e.g. `deprovision:<dealId>`), using the same pattern: cancel the Stripe subscription, suspend the tenant, update Zoho.',
        },
      ],
    },
    {
      id: 'zoho-rate-limit-bulk-sync',
      title: 'Sync 20,000 users to Zoho without hitting rate limits',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'occasional',
      relatedTopic: 'zoho-automation',
      question: `Marketing wants all 20,000 existing users from MongoDB pushed into Zoho CRM as leads, and after that, every new sign-up synced within a few minutes.

Your first script did \`Promise.all(users.map(createLead))\`. Zoho started returning **429 Too Many Requests**, many leads failed, and the daily API credit limit ran out by noon, which broke the live sign-up sync too.

How do you redo this? Write the retry helper you would use.`,
      hints: [
        'Zoho limits you in two ways: API credits per 24 hours (depending on your edition and licenses) and a max number of parallel requests.',
        'Batch: the insert/upsert APIs accept up to 100 records per call. Bulk Write API for very large imports.',
        'Retry only errors that can succeed later (429, 5xx, network). Use exponential backoff with jitter and respect `Retry-After` when present.',
      ],
      solution: `**Idea:** stop sending 20,000 single requests in parallel. Send **few, big** requests, **one or two at a time**, through a queue, with backoff on 429. Protect the live sign-up sync from the backfill.

#### The plan

1. **Batch:** upsert in chunks of **100 records** (one API call each). 20,000 users = 200 calls instead of 20,000. For bigger one-time imports use Zoho's **Bulk Write API** (upload a CSV, Zoho processes it as an async job).
2. **Limit concurrency:** run 1-2 calls at a time (a queue worker with concurrency 2, or \`p-limit\`).
3. **Back off on 429 / 5xx** with exponential backoff + random jitter.
4. **Resume:** mark each user as \`zohoSynced: true\` with the Zoho id, so a crashed run continues instead of starting again.
5. **Separate the budget:** run the backfill at night or cap it (for example stop when 70% of the daily credits are used), so new sign-ups still sync.
6. **Monitor:** log credits used. Zoho shows API usage in the developer console. Check the docs for the exact response headers about remaining limits.

#### Retry helper

\`\`\`javascript
function isRetryable(err) {
  const status = err.response && err.response.status;
  if (!status) return true;                 // network error / timeout
  return status === 429 || status >= 500;   // 4xx like 400/401/403 will not fix themselves
}

async function withRetry(fn, {
  retries = 5,
  baseMs = 500,
  maxMs = 30000,
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
} = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt >= retries || !isRetryable(err)) throw err;

      const headers = (err.response && err.response.headers) || {};
      const retryAfterSec = Number(headers['retry-after']);
      const backoff = Math.min(maxMs, baseMs * 2 ** attempt);
      // "full jitter": random wait between 0 and backoff, so clients do not retry in sync
      const delay = retryAfterSec > 0 ? retryAfterSec * 1000 : Math.random() * backoff;
      await sleep(delay);
    }
  }
}
\`\`\`

#### The backfill loop

\`\`\`javascript
async function backfillLeads() {
  while (true) {
    const users = await User.find({ zohoSynced: { $ne: true } }).limit(100).lean();
    if (!users.length) break;

    const res = await withRetry(() =>
      zohoRequest(tokens, axios, {
        method: 'POST',
        path: '/crm/v2/Leads/upsert',
        data: { data: users.map(toZohoLead), duplicate_check_fields: ['Email'] },
      })
    );

    // Each record has its own result: mark only the successful ones
    const ops = [];
    res.data.data.forEach((r, i) => {
      if (r.status === 'success') {
        ops.push({ updateOne: {
          filter: { _id: users[i]._id },
          update: { $set: { zohoSynced: true, zohoLeadId: r.details.id } },
        } });
      } else {
        ops.push({ updateOne: {
          filter: { _id: users[i]._id },
          update: { $set: { zohoSynced: true, zohoSyncError: r.code } }, // park it, do not loop forever
        } });
      }
    });
    await User.bulkWrite(ops);
  }
}
\`\`\`

**Why it works:** 100x fewer calls saves credits. Low concurrency avoids the parallel-request limit. Jittered backoff gives Zoho room instead of hammering it. The \`zohoSynced\` flag makes the job resumable and idempotent (upsert by email).

**Edge cases:**
- Records that fail validation are marked with an error and reviewed later. Otherwise the loop would pick them up forever.
- The response array is in the same order as the request array. That is how we map results back to users.
- Live sign-ups go through the same queue but with higher priority, so the backfill never starves them.`,
      followUps: [
        {
          q: 'Why add jitter to the backoff?',
          a: 'Without jitter, all failed workers retry at exactly the same moments (1s, 2s, 4s...) and hit the limit together again. Random waits spread them out.',
        },
        {
          q: 'Why not retry a 400 error?',
          a: 'A 400 means the request is wrong (missing field, bad format). Sending it again gives the same error and wastes credits. Log it and fix the data.',
        },
      ],
    },
    {
      id: 'design-interview-scheduling-signalling',
      title: 'Design scheduled live interviews with Jitsi + your own WebSocket signalling',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'jitsi-websocket-signalling',
      question: `Design the "live interview" feature of a hiring platform:

- A recruiter schedules an interview (candidate + 1-3 interviewers, start/end time).
- Everyone gets an email with a link. The candidate waits in a **waiting room** until an interviewer admits them.
- Interviewers see live **presence**: "Candidate is in the waiting room", "Candidate left".
- Interviewers share private notes and a live code question with the candidate during the call.
- Video/audio runs on Jitsi.

Explain the components, the data model, and the WebSocket messages. Explain what Jitsi does and what **your** WebSocket server does.`,
      hints: [
        'Split the job: Jitsi handles media (and its own XMPP signalling). Your WebSocket server handles app events: presence, waiting room, admit, notes, code question.',
        'Use rooms keyed by interview id. Authenticate the socket with your app\'s JWT and check the user belongs to that interview.',
        'With more than one server instance, how does a message from a socket on server A reach a socket on server B? (Redis pub/sub.)',
      ],
      solution: `**Idea:** two separate channels. **Jitsi** moves audio/video. **Your WebSocket server** moves application events (who is waiting, admit, notes, code). The backend is the source of truth for who may join, and it only gives out the Jitsi JWT when an interviewer admits the candidate.

#### Components

- **Next.js frontend:** scheduling UI, waiting-room page, interview page (Jitsi IFrame + side panel).
- **Node API (REST):** create/reschedule interviews, send emails, issue Jitsi JWTs.
- **WebSocket server** (\`ws\` or Socket.IO): presence, waiting room, app events.
- **Redis:** pub/sub between WebSocket instances + presence with TTL.
- **MongoDB:** interviews, participants, notes.
- **Jitsi** (self-hosted or JaaS): media. Rooms are created on demand when the first person joins with a valid JWT.
- **Scheduler** (BullMQ delayed jobs): reminder emails 24h and 15 min before.

#### Data model (MongoDB)

\`\`\`javascript
// interviews
{
  _id, title,
  startAt, endAt, timezone,                 // store UTC, show in local time
  roomName: 'int-8f3a2c9d',                 // random, unguessable
  candidate: { userId, email, admittedAt: null },
  interviewers: [{ userId, email }],
  status: 'scheduled' | 'live' | 'completed' | 'cancelled',
  question: { id, language, starterCode },
}
// notes: { interviewId, authorId, text, private: true, createdAt }
\`\`\`

#### WebSocket messages

\`\`\`text
client -> server
  join          { interviewId }                 // after auth on connect
  admit         { interviewId }                 // interviewer only
  note:add      { interviewId, text }           // interviewer only
  code:update   { interviewId, code, version }

server -> client
  presence      { userId, role, state: 'waiting' | 'in-call' | 'left' }
  admitted      { jitsiJwt, roomName }          // only to the candidate
  note:added    { note }                        // only to interviewers
  code:updated  { code, version }
  error         { code, message }
\`\`\`

#### Flow

1. Candidate opens the link, logs in (or uses a one-time magic link). The socket connects with the app JWT. The server checks the user belongs to the interview and the time window is open.
2. Server puts the candidate in the **waiting** state and broadcasts \`presence: waiting\` to the interviewers' room (\`interview:<id>:staff\`).
3. Interviewer clicks **Admit**. The server checks the role, sets \`candidate.admittedAt\`, creates a Jitsi JWT for the candidate (room-locked, short expiry) and sends \`admitted\` only to the candidate's socket.
4. Candidate's page loads Jitsi with that JWT. Interviewers already have their own moderator JWTs.
5. Notes go only to the staff channel. Code updates go to everyone, with a \`version\` number so old updates are ignored.
6. On disconnect the server waits a few seconds (to allow a quick reconnect) before broadcasting \`left\`.

#### Scaling and reliability

- **Multiple WS instances:** publish every room event to Redis; each instance forwards it to its local sockets. (Socket.IO has a Redis adapter that does this.)
- **Presence:** each socket sends a heartbeat; store \`presence:<interviewId>:<userId>\` in Redis with a 30 s TTL. If the instance crashes, the key expires and others see "left".
- **Reconnects:** on reconnect the client sends \`join\` again and the server replies with the current state (snapshot), so missed events do not matter.
- **Security:** never trust the client's role. The server decides who gets which messages. The candidate never receives \`note:added\`.

**Why it works:** Jitsi does what it is good at (media, SFU, NAT traversal), and your server controls the business rules (who is admitted, who sees notes). Holding back the Jitsi JWT until admission makes the waiting room secure, not just a UI screen.`,
      followUps: [
        {
          q: 'Why not use Jitsi\'s own lobby feature instead of your waiting room?',
          a: 'You can. Jitsi has a lobby that moderators control. A custom waiting room gives you your own branding, presence on your dashboard (even before Jitsi loads), and you can log events for analytics. Many teams start with the Jitsi lobby and move to custom later.',
        },
        {
          q: 'How do you handle time zones for scheduling?',
          a: 'Store all times in UTC in the DB, keep the recruiter\'s IANA time zone (e.g. `Asia/Kolkata`), and convert only for display and emails. Calendar invites (.ics) carry the time zone too.',
        },
        {
          q: 'Live code editing: why a version number?',
          a: 'Messages can arrive out of order or after a reconnect. The version lets clients ignore older updates. For real multi-user editing, use a CRDT library like Yjs instead of sending the whole text.',
        },
      ],
    },
  ],
};
