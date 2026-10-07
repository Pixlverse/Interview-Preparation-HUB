// Twilio, Zoho CRM & Jitsi — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format.

export default {
  id: 'twilio-zoho-jitsi',
  title: 'Twilio, Zoho CRM & Jitsi',
  icon: '📞',
  description: 'Three integrations from real work: Twilio for phone calls, SMS and an AI voice agent, Zoho CRM for leads and workspace provisioning, and Jitsi for scheduled live video interviews.',
  definitionTitle: 'What are Twilio, Zoho CRM and Jitsi?',
  definition: `- **Twilio** is a **communications API** platform. Your code can make and receive **phone calls** and **SMS**, control calls with **TwiML** (XML instructions), and stream live call audio over WebSockets.
- **Zoho CRM** is a **Customer Relationship Management** system for tracking leads, deals and customers. Its REST API (using OAuth2) lets you automate things like creating leads.
- **Jitsi** is an **open-source video conferencing** platform built on **WebRTC**. You can embed it in your app and secure rooms with **JWT**.

**One-line answer:** "Twilio is a cloud API for programmable voice and SMS, Zoho CRM is a customer-relationship platform with an automation API, and Jitsi is open-source WebRTC video conferencing you can embed and secure with JWTs."`,
  topics: [
    {
      id: 'twilio-basics',
      title: 'Twilio Basics: REST API + Webhooks',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Twilio talks to you in two ways: you call its REST API, and it calls your server back with webhooks.',
      what: `**Twilio** is a cloud platform for phone calls, SMS, WhatsApp and more. You do not buy phone lines or hardware. You rent a phone number from Twilio and control it with code.

There are only two directions to remember:
- **You → Twilio:** your server calls the **REST API** (a normal HTTPS API) to do something, like "start a call" or "send an SMS".
- **Twilio → You:** when something happens (a call comes in, a call ends, an SMS arrives), Twilio sends an HTTP request to **your URL**. This is a **webhook** (an HTTP callback).

You log in with an **Account SID** (your account id, starts with \`AC\`) and an **Auth Token** (a secret password). Every call has a **Call SID** (starts with \`CA\`) and every message has a **Message SID** (starts with \`SM\` or \`MM\`).

#### Deeper version
For voice calls, Twilio asks your webhook "what should I do now?" and you answer with **TwiML** — a small XML language with verbs like \`<Say>\`, \`<Gather>\` and \`<Connect>\`. So a call is a conversation: Twilio requests your URL, you return TwiML, Twilio runs it, then requests the next URL.

In production, use **API Keys** (a key SID starting with \`SK\` plus a secret) instead of the main Auth Token. You can create and revoke them per service, so one leaked key does not expose the whole account. Twilio webhooks arrive as \`application/x-www-form-urlencoded\` POST requests by default, not JSON.`,
      why: `Building telephony yourself means carrier contracts, SIP servers and number porting. Twilio turns all of that into an HTTP API. A web developer can make a phone ring with five lines of Node, and react to call events with a normal Express route.`,
      analogy: `Twilio is like a hotel receptionist. You can phone the receptionist and say "please call room 204" (REST API). And when a guest arrives, the receptionist phones you and asks "what should I tell them?" (webhook). Your answer is a short script the receptionist reads out (TwiML).`,
      code: [
        {
          title: 'Create the Twilio client (Node)',
          lang: 'javascript',
          code: `// npm install twilio express
import twilio from 'twilio';

// Keep secrets in environment variables, never in code
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Or, better for production: an API Key + secret
// const client = twilio(process.env.TWILIO_API_KEY, process.env.TWILIO_API_SECRET, {
//   accountSid: process.env.TWILIO_ACCOUNT_SID,
// });

// You -> Twilio: list the phone numbers you own
const numbers = await client.incomingPhoneNumbers.list({ limit: 5 });
numbers.forEach((n) => console.log(n.phoneNumber, n.voiceUrl));`,
        },
        {
          title: 'Twilio -> You: a webhook route',
          lang: 'javascript',
          code: `import express from 'express';
const app = express();

// Twilio sends form-encoded bodies, not JSON
app.use(express.urlencoded({ extended: false }));

app.post('/twilio/voice', (req, res) => {
  console.log('Call from', req.body.From, 'callSid', req.body.CallSid);
  // Reply with TwiML (XML) telling Twilio what to do
  res.type('text/xml').send('<Response><Say>Hello from our app!</Say></Response>');
});

app.listen(3000);`,
        },
      ],
      output: `The first block prints each number you own, like \`+14155550100 https://api.myapp.com/twilio/voice\`. The \`voiceUrl\` is the webhook Twilio calls when someone dials that number.

In the second block, when someone calls your number, Twilio POSTs to \`/twilio/voice\` with fields like \`From\`, \`To\` and \`CallSid\`. Your server returns XML, and the caller hears "Hello from our app!". Then the call ends because there are no more TwiML verbs.`,
      questions: [
        {
          q: 'What is the difference between the Twilio REST API and a Twilio webhook?',
          a: 'The REST API is you calling Twilio (start a call, send an SMS). A webhook is Twilio calling your server when something happens (incoming call, status change, inbound SMS).',
        },
        {
          q: 'What is an Account SID and Auth Token?',
          a: 'The Account SID is your public account id (starts with `AC`). The Auth Token is the secret used to authenticate API calls and to sign webhooks. Keep it in env variables and rotate it if leaked.',
        },
        {
          q: 'Why use API Keys instead of the Auth Token?',
          a: 'API Keys can be created per service and revoked one by one. If one leaks, you revoke only that key. The Auth Token is the master secret for the whole account.',
        },
        {
          q: 'What format does Twilio use for webhook bodies?',
          a: 'By default `application/x-www-form-urlencoded`. In Express you need `express.urlencoded()` or `req.body` will be empty.',
        },
      ],
      spoken: `"Twilio works in two directions. My server calls Twilio's REST API to do things, like starting an outbound call or sending an SMS. And Twilio calls my server back with webhooks when something happens, like an incoming call or a status change. For voice, my webhook responds with TwiML, which is a small XML language that tells Twilio to say something, gather speech, or connect a media stream. In my AI interview agent, I used the REST API to start calls and webhooks plus TwiML to control the conversation. I keep credentials in env variables and prefer API keys over the master auth token."`,
      mistakes: [
        'Forgetting `express.urlencoded()` — Twilio webhooks are form-encoded, so `req.body` is empty with only `express.json()`.',
        'Hard-coding the Auth Token in the repo. Use env variables or a secret manager, and prefer revocable API Keys.',
        'Using a `localhost` URL as the webhook. Twilio must reach a public HTTPS URL; use a tunnel like ngrok while developing.',
        'Follow-up trap: "Does Twilio retry a failed webhook?" Not like a queue. Voice webhooks have a fallback URL and limited retry options; mostly you must respond fast and correctly. Design your handler to be quick and idempotent.',
      ],
      takeaway: 'You call Twilio with REST; Twilio calls you with webhooks; for voice you answer with TwiML.',
    },
    {
      id: 'twilio-calls',
      title: 'Outbound and Inbound Calls',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Outbound: call client.calls.create with a TwiML URL. Inbound: set a Voice URL on your number and answer the webhook with TwiML.',
      what: `There are two kinds of calls:

- **Outbound call:** your app starts it. You call \`client.calls.create({ to, from, url })\`. Twilio dials the person. When they pick up, Twilio fetches TwiML from \`url\` to know what to do.
- **Inbound call:** someone dials your Twilio number. Twilio sends a webhook to the **Voice URL** configured on that number. You reply with TwiML.

In both cases, the "brain" of the call is your webhook returning TwiML.

#### Deeper version
\`calls.create\` returns right away with a Call SID and status \`queued\`. The call then moves through statuses: \`queued\` → \`ringing\` → \`in-progress\` → \`completed\` (or \`busy\`, \`no-answer\`, \`failed\`, \`canceled\`).

Instead of a \`url\`, you can pass inline \`twiml\` for simple cases. Useful options: \`statusCallback\` (get status events), \`timeout\` (how long to ring), \`machineDetection\` (detect voicemail; extra cost), and \`record\`.

You can also **modify a live call**: \`client.calls(callSid).update({ twiml })\` or \`update({ status: 'completed' })\` to hang up. This is how a server can redirect or end a call that is already running.`,
      why: `An AI interview agent needs both. Outbound: at the scheduled time the system calls the candidate. Inbound: a candidate who missed the call can dial back and be routed to their pending interview. Both are just HTTP for a web developer.`,
      analogy: `Outbound is you asking a friend to phone someone and read a script you hand over when they answer. Inbound is someone calling your office, and the receptionist asking you, "What should I say to this person?"`,
      code: [
        {
          title: 'Outbound call with metadata in the URL',
          lang: 'javascript',
          code: `// Start an AI interview call for one candidate
async function startInterviewCall(candidate) {
  const call = await client.calls.create({
    to: candidate.phone,                 // E.164 format, e.g. +919812345678
    from: process.env.TWILIO_NUMBER,     // a number you own on Twilio
    url: \`https://api.myapp.com/twilio/interview?interviewId=\${candidate.interviewId}\`,
    timeout: 25,                         // seconds to ring before no-answer
    statusCallback: 'https://api.myapp.com/twilio/status',
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
  });
  console.log('Call queued:', call.sid, call.status); // CAxxxx queued
  return call.sid; // save this on the interview record
}`,
        },
        {
          title: 'Inbound call webhook + ending a live call',
          lang: 'javascript',
          code: `const { VoiceResponse } = twilio.twiml;

// Voice URL configured on the Twilio number
app.post('/twilio/inbound', async (req, res) => {
  const interview = await Interview.findOne({ phone: req.body.From, status: 'pending' });
  const vr = new VoiceResponse();
  if (!interview) {
    vr.say('Sorry, we could not find an interview for this number. Goodbye.');
    vr.hangup();
  } else {
    // Hand over to the same TwiML route used for outbound calls
    vr.redirect({ method: 'POST' }, \`/twilio/interview?interviewId=\${interview.id}\`);
  }
  res.type('text/xml').send(vr.toString());
});

// From anywhere in your backend: hang up a running call
await client.calls(callSid).update({ status: 'completed' });`,
        },
      ],
      output: `\`startInterviewCall\` prints something like \`Call queued: CA1234... queued\`. The candidate's phone rings. When they answer, Twilio POSTs to \`/twilio/interview?interviewId=...\` and plays whatever TwiML you return. Status events go to \`/twilio/status\`.

For inbound, a known caller is redirected to the interview flow. An unknown caller hears the apology and the call ends. The last line ends any live call from your code.`,
      questions: [
        {
          q: 'How do you make an outbound call with Twilio?',
          a: 'Call `client.calls.create({ to, from, url })`. `from` must be a Twilio number you own or a verified caller id. When the callee answers, Twilio fetches TwiML from `url`.',
        },
        {
          q: 'How does Twilio know what to do on an inbound call?',
          a: 'Each Twilio number has a Voice URL (or a TwiML App). Twilio POSTs call details to it and runs the TwiML you return.',
        },
        {
          q: 'How do you pass context (like interview id) to the call webhook?',
          a: 'Put it in the webhook URL query string, or store a mapping from Call SID to your record when you create the call and look it up in the webhook.',
        },
        {
          q: 'How do you hang up or redirect a live call from your server?',
          a: '`client.calls(callSid).update({ status: \'completed\' })` hangs up. `update({ twiml })` or `update({ url })` replaces what the call is doing right now.',
        },
      ],
      spoken: `"For outbound calls I use client.calls.create with the candidate number, my Twilio number, and a webhook URL. The call is queued immediately and I store the Call SID on the interview record. When the candidate answers, Twilio fetches TwiML from that URL. For inbound calls, the Twilio number has a Voice URL, so Twilio posts the caller details to my server and I return TwiML. I pass context like the interview id in the query string, and I can update or hang up a live call using the Call SID."`,
      mistakes: [
        'Phone numbers not in E.164 format (`+` country code number). Twilio rejects or misroutes them.',
        'Treating `calls.create` success as "the call connected". It only means queued. Use status callbacks to know what really happened.',
        'Trial accounts can only call verified numbers and play a trial message first — surprising during demos.',
        'Follow-up trap: "What if the candidate does not answer?" You get a `no-answer` or `busy` status in the status callback. Update the interview and schedule a retry with a limit.',
      ],
      takeaway: 'Outbound = calls.create + TwiML URL; inbound = Voice URL webhook + TwiML; the Call SID ties everything together.',
    },
    {
      id: 'twiml-say-gather',
      title: 'TwiML: Say, Gather, Play, Redirect',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'TwiML is XML instructions for a call. Say speaks, Gather listens for speech or keypresses, then posts the result to your action URL.',
      what: `**TwiML** (Twilio Markup Language) is XML you return from a voice webhook. Each tag is a **verb** — an instruction.

- \`<Say>\` — read text out loud (text-to-speech).
- \`<Play>\` — play an audio file (mp3/wav URL).
- \`<Gather>\` — listen. It can collect keypresses (\`input="dtmf"\`) or speech (\`input="speech"\`). When done, Twilio POSTs the result to the \`action\` URL.
- \`<Redirect>\` — go fetch TwiML from another URL.
- \`<Hangup>\`, \`<Pause>\`, \`<Dial>\` (connect to another phone), \`<Record>\`.

Verbs run top to bottom. When the list ends, the call hangs up.

#### Deeper version
\`<Gather>\` with speech gives you \`SpeechResult\` and \`Confidence\` in the action request. Useful attributes: \`speechTimeout="auto"\` (stop when the person pauses), \`timeout\` (seconds to wait for input), \`language\`, \`hints\` (words to expect), and \`actionOnEmptyResult\`.

If \`<Gather>\` gets no input, Twilio does **not** call the action (unless \`actionOnEmptyResult\` is set) — it moves to the next verb after \`<Gather>\`. So always put a fallback (like a \`<Redirect>\` or a goodbye) after it.

A Gather-based bot is turn-based: speak → listen → HTTP round trip → speak. It is simple but slow for natural conversation. For real-time AI voice, use \`<Connect><Stream>\` (media streams) instead.`,
      why: `TwiML lets you build phone menus and simple voice bots with just HTTP and XML. No audio processing is needed — Twilio does speech-to-text and text-to-speech for you.`,
      analogy: `TwiML is a stage script for an actor (Twilio). "Say this line. Wait for the audience to answer. Then go to page 5." Your server writes the next page of the script each time the actor asks.`,
      code: [
        {
          title: 'A simple turn-based interview question',
          lang: 'javascript',
          code: `const { VoiceResponse } = twilio.twiml;

app.post('/twilio/interview', (req, res) => {
  const vr = new VoiceResponse();
  const gather = vr.gather({
    input: 'speech',
    action: \`/twilio/answer?interviewId=\${req.query.interviewId}&q=1\`,
    speechTimeout: 'auto', // stop listening when the candidate pauses
    language: 'en-IN',
  });
  gather.say('Hi! Please tell me about your most recent project.');

  // Runs only if Gather got no input
  vr.say('I did not hear anything. Let me ask again.');
  vr.redirect({ method: 'POST' }, \`/twilio/interview?interviewId=\${req.query.interviewId}\`);

  res.type('text/xml').send(vr.toString());
});

app.post('/twilio/answer', (req, res) => {
  const { SpeechResult, Confidence } = req.body;
  console.log('Candidate said:', SpeechResult, 'confidence:', Confidence);
  const vr = new VoiceResponse();
  vr.say('Thank you. That is all for today. Goodbye!');
  vr.hangup();
  res.type('text/xml').send(vr.toString());
});`,
        },
        {
          title: 'The XML that the first route produces',
          lang: 'html',
          code: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/twilio/answer?interviewId=42&amp;q=1" speechTimeout="auto" language="en-IN">
    <Say>Hi! Please tell me about your most recent project.</Say>
  </Gather>
  <Say>I did not hear anything. Let me ask again.</Say>
  <Redirect method="POST">/twilio/interview?interviewId=42</Redirect>
</Response>`,
        },
      ],
      output: `The candidate hears the question. They speak, then pause. Twilio turns the speech into text and POSTs \`SpeechResult\` (for example "I built a Stripe billing system") to \`/twilio/answer\`. The server logs it, says goodbye and hangs up.

If the candidate says nothing, Gather times out, the call moves to the next verb, says "I did not hear anything", and redirects back to ask again. Notice the \`&\` in the URL becomes \`&amp;\` in XML — the helper library escapes it for you.`,
      questions: [
        {
          q: 'What is TwiML?',
          a: 'An XML language you return from Twilio webhooks. Verbs like `<Say>`, `<Gather>`, `<Dial>` and `<Connect>` tell Twilio what to do on a call or message.',
        },
        {
          q: 'How does <Gather> return what the user said?',
          a: 'It POSTs to its `action` URL with `SpeechResult` and `Confidence` for speech, or `Digits` for keypresses. Your action route returns the next TwiML.',
        },
        {
          q: 'What happens if Gather gets no input?',
          a: 'By default the action URL is not called; Twilio continues with the next verb after `<Gather>`. That is why you add a fallback after it.',
        },
        {
          q: 'Why is Gather not great for an AI conversation?',
          a: 'It is turn-based with an HTTP round trip and Twilio speech recognition per turn, so there is noticeable delay and no interrupting. Real-time AI agents use `<Connect><Stream>` with their own STT, LLM and TTS.',
        },
      ],
      spoken: `"TwiML is the XML I return from Twilio voice webhooks. Say speaks text, Play plays audio, and Gather listens for keypresses or speech and posts the result to an action URL as SpeechResult or Digits. If Gather gets nothing, Twilio moves to the next verb, so I always add a fallback after it. I started my interview bot with Gather because it is simple, but each turn has an HTTP round trip and you cannot interrupt the bot. So for a natural AI conversation I switched to Connect and Stream, which gives me raw audio over a WebSocket."`,
      mistakes: [
        'No fallback after `<Gather>` — the call silently hangs up when the user stays quiet.',
        'Returning JSON or forgetting `Content-Type: text/xml`. Twilio then plays an "application error" message.',
        'Building XML with string concatenation and not escaping `&` or `<` in user text. Use the helper library (`VoiceResponse`).',
        'Follow-up trap: "Can the caller interrupt <Say> inside <Gather>?" Yes — speech or a keypress during a nested `<Say>` stops it (barge-in). A `<Say>` outside `<Gather>` cannot be interrupted.',
      ],
      takeaway: 'TwiML is a script of verbs; Gather listens and posts to action; always add a fallback after Gather.',
    },
    {
      id: 'twilio-sms',
      title: 'Sending and Receiving SMS',
      level: 'basic',
      priority: 'good',
      frequency: 'common',
      summary: 'Send with client.messages.create; receive via the number\'s Messaging webhook and reply with MessagingResponse.',
      what: `**Sending SMS:** call \`client.messages.create({ to, from, body })\`. Twilio queues it and returns a Message SID.

**Receiving SMS:** set a **Messaging webhook URL** on your Twilio number. When someone texts it, Twilio POSTs \`From\`, \`To\` and \`Body\` to your URL. You can reply by returning TwiML with \`<Message>\`.

#### Deeper version
Message statuses: \`queued\` → \`sending\` → \`sent\` → \`delivered\`, or \`undelivered\` / \`failed\`. Pass \`statusCallback\` to get these updates. \`delivered\` depends on carriers reporting back, so it is not always available.

Real-world rules matter more than code:
- In the US, sending from normal 10-digit numbers needs **A2P 10DLC** registration (brand + campaign). Other countries have their own rules (for example sender id registration in India).
- Respect opt-outs. Twilio handles standard keywords like STOP for many number types.
- Long messages are split into **segments** and each segment is billed. Emoji or non-Latin characters switch to UCS-2 encoding, which makes segments shorter.
- For many messages, use a **Messaging Service** (\`messagingServiceSid\` instead of \`from\`) for sender pools and better scaling.`,
      why: `SMS is the most reliable way to reach a candidate: interview reminders, "your call starts in 5 minutes", one-time passwords, and fallback when a call is not answered.`,
      analogy: `Sending SMS is dropping a letter in a postbox: you get a tracking number (Message SID) and later updates "sent" and "delivered". Receiving SMS is your mailbox with a bell — each new letter rings your server.`,
      code: [
        {
          title: 'Send a reminder SMS',
          lang: 'javascript',
          code: `const msg = await client.messages.create({
  to: '+919812345678',
  from: process.env.TWILIO_NUMBER, // or messagingServiceSid: process.env.TWILIO_MSG_SERVICE
  body: 'Hi Asha, your AI interview call starts at 4:00 PM IST. Reply HELP for help.',
  statusCallback: 'https://api.myapp.com/twilio/sms-status',
});
console.log(msg.sid, msg.status); // SMxxxx queued`,
        },
        {
          title: 'Receive and auto-reply',
          lang: 'javascript',
          code: `const { MessagingResponse } = twilio.twiml;

app.post('/twilio/sms', (req, res) => {
  const text = (req.body.Body || '').trim().toUpperCase();
  const reply = new MessagingResponse();

  if (text === 'RESCHEDULE') {
    reply.message('Sure! Pick a new slot here: https://myapp.com/reschedule');
  } else {
    reply.message('Thanks! Reply RESCHEDULE to change your interview time.');
  }
  res.type('text/xml').send(reply.toString());
});

app.post('/twilio/sms-status', (req, res) => {
  console.log(req.body.MessageSid, req.body.MessageStatus); // e.g. delivered
  res.sendStatus(204);
});`,
        },
      ],
      output: `The first block prints \`SMxxxx queued\`. A few seconds later \`/twilio/sms-status\` receives \`sent\` and then usually \`delivered\`.

When the candidate texts "reschedule", the route upper-cases it, matches \`RESCHEDULE\`, and Twilio sends back the link. Any other text gets the help message.`,
      questions: [
        {
          q: 'How do you send an SMS with Twilio?',
          a: '`client.messages.create({ to, from, body })`, where `from` is a Twilio number or you pass a `messagingServiceSid`.',
        },
        {
          q: 'How do you handle incoming SMS?',
          a: 'Configure the number\'s messaging webhook. Twilio POSTs `From`, `Body` etc. Reply with `<Message>` TwiML or send a new message via the API later.',
        },
        {
          q: 'What is an SMS segment?',
          a: 'SMS is split into segments (about 160 GSM-7 characters, or 70 with UCS-2 for emoji or many non-Latin scripts). Each segment is billed separately.',
        },
        {
          q: 'What is A2P 10DLC?',
          a: 'A US registration system for application-to-person messages sent from local 10-digit numbers. You register your brand and use case; unregistered traffic gets filtered or blocked.',
        },
      ],
      spoken: `"To send SMS I call client.messages.create with to, from and body, and I pass a statusCallback so I know when it is sent, delivered or failed. To receive SMS I set the messaging webhook on the number; Twilio posts From and Body, and I can reply with a Message TwiML. In production I care about compliance: A2P 10DLC registration in the US, local sender rules in other countries, and opt-out handling. I also keep messages short because they are billed per segment, and emoji shrink the segment size."`,
      mistakes: [
        'Assuming `delivered` always arrives. Some carriers never report it; treat `sent` without failure as "probably delivered".',
        'Adding an emoji to a long template and doubling the cost because of UCS-2 encoding.',
        'Ignoring registration rules (A2P 10DLC, DLT in India) and then wondering why messages are filtered.',
        'Follow-up trap: "How do you send 50,000 reminders?" Use a queue with controlled concurrency and a Messaging Service; Twilio queues per sender and has throughput limits, so do not blast them all in one `Promise.all`.',
      ],
      takeaway: 'messages.create to send, a messaging webhook to receive, statusCallback to track — and compliance is half the work.',
    },
    {
      id: 'zoho-crm-basics',
      title: 'Zoho CRM Basics: Modules, Records and the API',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Zoho CRM stores records (Leads, Contacts, Deals) in modules; you read and write them with a JSON REST API using an OAuth token.',
      what: `**CRM** means Customer Relationship Management — a system where sales teams track people and deals.

In **Zoho CRM**:
- A **module** is like a table: \`Leads\`, \`Contacts\`, \`Accounts\`, \`Deals\`, plus custom modules.
- A **record** is one row: one lead, one deal.
- A **field** has an **API name** like \`Last_Name\`, \`Email\`, \`Company\`. You always use the API name in code, not the label you see in the UI.

The REST API URL looks like \`https://www.zohoapis.com/crm/v2/Leads\`. You send JSON with a \`data\` array, and authenticate with the header \`Authorization: Zoho-oauthtoken <access_token>\`.

#### Deeper version
- **Lead** = a possible customer, not yet qualified. When qualified, a lead is **converted** into a Contact, an Account and optionally a Deal.
- **Deal** = an opportunity with a **Stage** (for example "Qualification", then "Closed Won" or "Closed Lost").
- The API has versions (\`v2\` and newer, like \`v3\`... \`v7\`/\`v8\`). The basic shape (\`/crm/vN/{module}\`, \`data\` array) is the same, but details and limits differ — check the current docs for the version you use.
- The domain depends on the **data center** where the Zoho account lives (\`.com\`, \`.eu\`, \`.in\`, \`.com.au\`, ...). The token response tells you the right \`api_domain\`.`,
      why: `Sales and ops teams live in the CRM. If your product creates leads automatically (from a sign-up form) and reacts to deals being won (to provision a workspace), sales and engineering stay in sync without copy-paste.`,
      analogy: `Zoho CRM is a big office filing cabinet. Each drawer is a module (Leads, Deals). Each folder in a drawer is a record. Each line on the form inside is a field — and the API only understands the printed field code (API name), not the handwritten label.`,
      code: [
        {
          title: 'Read and create records with fetch',
          lang: 'javascript',
          code: `const API = 'https://www.zohoapis.in/crm/v2'; // use api_domain from the token response
const headers = {
  Authorization: \`Zoho-oauthtoken \${accessToken}\`,
  'Content-Type': 'application/json',
};

// Get a page of leads (only some fields)
const list = await fetch(\`\${API}/Leads?fields=Last_Name,Email,Company&per_page=10\`, { headers });
const { data } = await list.json();
console.log(data.map((l) => l.Email));

// Create a lead: body always has a "data" array
const res = await fetch(\`\${API}/Leads\`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ data: [{ Last_Name: 'Sharma', Email: 'asha@acme.com', Company: 'Acme' }] }),
});
console.log(JSON.stringify(await res.json()));`,
        },
      ],
      output: `The GET prints the emails of up to 10 leads. The POST returns something like:

\`{"data":[{"code":"SUCCESS","details":{"id":"5725767000000524157",...},"message":"record added","status":"success"}]}\`

Notice the response is also a \`data\` array — one result per record you sent. Each item has its own \`status\`, so one record can fail while others succeed. If there are no records, a GET can return **204 No Content** with an empty body, so check the status before calling \`.json()\`.`,
      questions: [
        {
          q: 'What is the difference between a Lead, a Contact and a Deal in Zoho CRM?',
          a: 'A Lead is an unqualified prospect. When qualified it is converted into a Contact (person), an Account (company) and optionally a Deal (an opportunity with a stage and amount).',
        },
        {
          q: 'How do you authenticate Zoho CRM API calls?',
          a: 'With an OAuth 2.0 access token in the header `Authorization: Zoho-oauthtoken <token>`. Access tokens are short-lived and are refreshed with a refresh token.',
        },
        {
          q: 'Why do you need field API names?',
          a: 'The API only accepts API names like `Last_Name` or custom ones like `Plan_Type`. Labels can be renamed in the UI; API names are stable identifiers.',
        },
        {
          q: 'Why might the same code fail for a client in Europe?',
          a: 'Zoho has separate data centers. A European org uses `zohoapis.eu` and `accounts.zoho.eu`. Use the `api_domain` returned with the token instead of hard-coding `.com`.',
        },
      ],
      spoken: `"Zoho CRM organizes data into modules like Leads, Contacts, Accounts and Deals, and each record has fields with API names like Last_Name and Email. I talk to it through its REST API with an OAuth access token in a Zoho-oauthtoken header. Requests and responses use a data array, and each record in the response has its own status, so I check every item, not just the HTTP code. One gotcha is data centers: an Indian or European account uses a different domain, so I always use the api_domain that comes back with the token."`,
      mistakes: [
        'Using UI labels ("Lead Source") instead of API names (`Lead_Source`) — the field is silently ignored or rejected.',
        'Checking only the HTTP status. A bulk call can return success overall while one record has `status: "error"` inside `data`.',
        'Hard-coding `zohoapis.com` for every customer. Wrong data center gives invalid token errors.',
        'Follow-up trap: "What is mandatory to create a Lead?" `Last_Name` is mandatory by default. Layouts can make more fields mandatory (often `Company`), so read the error details.',
      ],
      takeaway: 'Modules are tables, records are rows, fields use API names, every body is a data array, and the domain depends on the data center.',
    },
    {
      id: 'jitsi-embedding',
      title: 'Jitsi Meet: Embedding Video Interviews (IFrame API, lib-jitsi-meet)',
      level: 'basic',
      priority: 'must',
      frequency: 'common',
      summary: 'Jitsi is open-source video calling. Embed a full meeting with the IFrame API, or build a custom UI with lib-jitsi-meet.',
      what: `**Jitsi Meet** is an open-source video conferencing app built on **WebRTC** (the browser technology for real-time audio and video).

There are two main ways to put Jitsi into your app:
- **IFrame API** (\`external_api.js\`): you drop a full Jitsi meeting into a \`<div>\`. Jitsi's own UI shows inside an iframe. You control it with commands (\`executeCommand('toggleAudio')\`) and listen to events (\`participantJoined\`). Fast and easy.
- **lib-jitsi-meet**: a low-level JavaScript library. You get raw audio/video tracks and build your **own** UI. Much more work, full control.

For React there is also \`@jitsi/react-sdk\` with \`<JitsiMeeting>\` and \`<JaaSMeeting>\` components, which wrap the IFrame API.

#### Deeper version
The IFrame API constructor is \`new JitsiMeetExternalAPI(domain, options)\`. Key options: \`roomName\`, \`parentNode\`, \`jwt\` (for secure rooms), \`userInfo\` (\`displayName\`, \`email\`), \`configOverwrite\` (for example \`startWithAudioMuted\`, \`prejoinConfig\`) and \`interfaceConfigOverwrite\` (UI tweaks).

Always call \`api.dispose()\` when your component unmounts, or you leak the iframe and the media devices stay on.

The public \`meet.jit.si\` server is meant for personal use and demos. It has restrictions for embedding (time limits and sign-in requirements have changed over time), so for a product you use **JaaS** (8x8's hosted Jitsi) or **self-host** Jitsi.`,
      why: `For live candidate interviews you need reliable video with screen sharing, without building WebRTC infrastructure. The IFrame API gives a full meeting in about 20 lines, and JWT lets you control who joins which room.`,
      analogy: `The IFrame API is like renting a fully furnished meeting room inside your office: you get the table, screen and chairs, you can only rearrange a little. lib-jitsi-meet is getting an empty room with power and network sockets: you design everything yourself.`,
      code: [
        {
          title: 'React component with the IFrame API',
          lang: 'jsx',
          code: `import { useEffect, useRef } from 'react';

// index.html loads the script first, for example:
// <script src="https://8x8.vc/YOUR_APP_ID/external_api.js"></script>  (JaaS)
// or <script src="https://meet.mycompany.com/external_api.js"></script> (self-hosted)

export default function InterviewRoom({ domain, roomName, jwt, displayName, onLeave }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const api = new window.JitsiMeetExternalAPI(domain, {
      roomName,                       // JaaS: "APP_ID/room-name"
      parentNode: containerRef.current,
      jwt,                            // issued by OUR backend
      userInfo: { displayName },
      configOverwrite: { startWithAudioMuted: true, prejoinConfig: { enabled: false } },
    });

    api.addListener('videoConferenceJoined', () => console.log('I joined'));
    api.addListener('participantJoined', (p) => console.log('Joined:', p.displayName));
    api.addListener('readyToClose', onLeave); // user clicked hang up

    return () => api.dispose();       // cleanup: remove iframe, release camera
  }, [domain, roomName, jwt, displayName, onLeave]);

  return <div ref={containerRef} style={{ height: 600 }} />;
}`,
        },
      ],
      output: `When the component mounts, Jitsi creates an iframe inside the \`div\` and joins \`roomName\` with the given JWT. The console prints "I joined", then "Joined: Asha" when the candidate enters. When the user clicks hang up, \`readyToClose\` fires and \`onLeave\` runs (for example, navigate back to the dashboard). On unmount, \`dispose()\` removes the iframe and turns off the camera.

Note: \`onLeave\` is in the dependency list, so pass a stable function (\`useCallback\`), or the meeting will be recreated on every parent render.`,
      questions: [
        {
          q: 'How do you embed Jitsi in a web app?',
          a: 'Load `external_api.js` from your Jitsi domain and create `new JitsiMeetExternalAPI(domain, { roomName, parentNode, jwt, userInfo })`. Use `addListener` for events and `executeCommand` for actions.',
        },
        {
          q: 'IFrame API vs lib-jitsi-meet?',
          a: 'IFrame API gives the full Jitsi UI in an iframe with commands and events — quick to ship. lib-jitsi-meet gives raw tracks and conference objects so you can build a custom UI — more control, more work.',
        },
        {
          q: 'Why call api.dispose()?',
          a: 'It leaves the meeting and removes the iframe. Without it, an unmounted React component can keep the camera and microphone on and leak memory.',
        },
        {
          q: 'Can you use meet.jit.si for a production product?',
          a: 'Not a good idea. It is a free community service with embedding restrictions and no SLA. Use JaaS or a self-hosted deployment for production.',
        },
      ],
      spoken: `"For live interviews I embedded Jitsi with the IFrame API. I load external_api.js and create a JitsiMeetExternalAPI with the domain, room name, a parent div, user info and a JWT from my backend. I listen to events like videoConferenceJoined, participantJoined and readyToClose to update my app, and I call dispose in the useEffect cleanup so the camera is released. If I needed a fully custom UI I would use lib-jitsi-meet, but the IFrame API was enough and much faster to build. For production I would not rely on the public meet.jit.si server."`,
      mistakes: [
        'Not calling `api.dispose()` on unmount — duplicate iframes in React StrictMode and the camera light stays on.',
        'Passing a new inline callback each render so `useEffect` re-runs and the user is kicked out and rejoined.',
        'Trusting the client to choose any room name. Room access must be enforced with a JWT signed by your backend.',
        'Follow-up trap: "Does the iframe give you the video streams?" No. The IFrame API is control-only; you cannot read raw tracks from the iframe. For that you need lib-jitsi-meet.',
      ],
      takeaway: 'IFrame API = full meeting in a div with commands and events; lib-jitsi-meet = build your own UI; always dispose.',
    },
    {
      id: 'twilio-status-callbacks',
      title: 'Call Status Webhooks (statusCallback)',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'statusCallback tells your server when a call is initiated, ringing, answered and completed — the source of truth for call state.',
      what: `When you start a call, you do not know what will happen: will they answer? Will the line be busy? **Status callbacks** are webhooks Twilio sends to your \`statusCallback\` URL as the call changes state.

You choose which events you want with \`statusCallbackEvent\`: \`initiated\`, \`ringing\`, \`answered\`, \`completed\`. If you set only \`statusCallback\`, you get just the final \`completed\` event by default.

The final \`CallStatus\` tells you how it ended: \`completed\`, \`busy\`, \`no-answer\`, \`failed\` or \`canceled\`.

#### Deeper version
Each callback includes \`CallSid\`, \`CallStatus\`, \`Timestamp\`, \`SequenceNumber\`, and on the final event \`CallDuration\` (seconds). Events can arrive **out of order** or more than once, so:
- Use \`SequenceNumber\` (or a status ranking) and never move a call "backwards" (for example from \`completed\` to \`ringing\`).
- Make the handler **idempotent**: processing the same event twice must not double-charge credits or send two "missed call" SMS.
- Reply fast (\`204\`) and push heavy work (transcripts, scoring, CRM updates) to a queue.

Other callbacks exist too: recording status (\`recordingStatusCallback\`), media stream status, and SMS status. The same rules apply.`,
      why: `Your database must know the real outcome of every call: to retry no-answers, bill minutes, mark the interview done and trigger scoring. The response of \`calls.create\` only says "queued" — status callbacks tell the rest of the story.`,
      analogy: `It is like parcel tracking notifications: "picked up", "out for delivery", "delivered" or "recipient not home". Sometimes two messages arrive in the wrong order, so you trust the latest stage, not the latest SMS.`,
      code: [
        {
          title: 'Idempotent status handler',
          lang: 'javascript',
          code: `const RANK = { queued: 0, initiated: 1, ringing: 2, 'in-progress': 3,
  completed: 4, busy: 4, 'no-answer': 4, failed: 4, canceled: 4 };

app.post('/twilio/status', async (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  res.sendStatus(204); // answer Twilio quickly

  const call = await Call.findOne({ callSid: CallSid });
  if (!call || RANK[CallStatus] < RANK[call.status]) return; // unknown or out-of-order

  // Atomic update: only the first "final" event wins
  const updated = await Call.findOneAndUpdate(
    { callSid: CallSid, status: call.status },
    { status: CallStatus, durationSec: Number(CallDuration || 0) },
    { new: true },
  );
  if (!updated) return; // another request already moved it

  if (CallStatus === 'no-answer' || CallStatus === 'busy') {
    await retryQueue.add('retry-call', { interviewId: call.interviewId }, { delay: 10 * 60 * 1000 });
  }
  if (CallStatus === 'completed') {
    await scoringQueue.add('score-interview', { interviewId: call.interviewId });
  }
});`,
        },
      ],
      output: `For an answered call, the handler receives \`initiated\`, \`ringing\`, \`in-progress\` (the "answered" event) and finally \`completed\` with \`CallDuration\` like \`312\`. The record moves forward each time, and on \`completed\` a scoring job is queued.

If the candidate does not pick up, the final event is \`no-answer\` and a retry job is scheduled in 10 minutes. If Twilio sends \`ringing\` late after \`completed\`, the rank check ignores it. If the same final event arrives twice, the conditional update matches only once, so only one job is queued.`,
      questions: [
        {
          q: 'How do you know if an outbound call was answered?',
          a: 'Set `statusCallback` and `statusCallbackEvent`. You get an `answered` event (CallStatus `in-progress`) and a final `completed`, or a final `busy`/`no-answer`/`failed` if it never connected.',
        },
        {
          q: 'What events can you subscribe to?',
          a: '`initiated`, `ringing`, `answered` and `completed`. Without `statusCallbackEvent` you only get `completed`.',
        },
        {
          q: 'Why must status handlers be idempotent?',
          a: 'Webhooks can be delivered more than once or out of order. Idempotent handlers make duplicates harmless — for example with conditional updates or a processed-events table.',
        },
        {
          q: 'Where do you do heavy work after a call ends?',
          a: 'In a background queue. The webhook should only validate, record the event and return quickly.',
        },
      ],
      spoken: `"Calls.create only tells me the call is queued, so I rely on status callbacks for the real outcome. I subscribe to initiated, ringing, answered and completed, and the final CallStatus tells me if it was completed, busy, no-answer or failed. Because webhooks can arrive twice or out of order, I rank the statuses and use a conditional update so the state only moves forward and side effects happen once. I return 204 quickly and push heavy work, like scoring the interview or scheduling a retry for a no-answer, to a background queue."`,
      mistakes: [
        'Setting only `statusCallback` and expecting ringing/answered events — you also need `statusCallbackEvent`.',
        'Doing slow work (LLM scoring, CRM calls) inside the webhook before responding.',
        'Overwriting the final status with a late, out-of-order event.',
        'Follow-up trap: "Is `completed` the same as successful?" It means the call connected and then ended. A call that never connected ends as `busy`, `no-answer`, `failed` or `canceled` instead. A 2-second `completed` call may still be a voicemail or hang-up, so check duration too.',
      ],
      takeaway: 'Status callbacks are the truth about a call; handle them fast, in order, and idempotently.',
    },
    {
      id: 'twilio-webhook-signature',
      title: 'Validating Twilio Webhook Signatures',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Twilio signs every webhook with X-Twilio-Signature; validate it with your Auth Token so attackers cannot fake calls or SMS.',
      what: `Your webhook URLs are public. Anyone could POST fake data to \`/twilio/status\` and say "call completed". To stop this, Twilio adds a header \`X-Twilio-Signature\` to every request.

The signature is made with your **Auth Token** as the secret. Only Twilio and you know it. Your server recalculates the signature and compares. If they match, the request really came from Twilio.

The Node helper does the math: \`twilio.validateRequest(authToken, signature, url, params)\`, or the ready-made Express middleware \`twilio.webhook()\`.

#### Deeper version
How the signature is built: take the **full URL** Twilio called (including query string), then append every POST parameter sorted by name as \`name + value\`. Compute **HMAC-SHA1** with the Auth Token as the key, then Base64 encode it.

Common reasons validation fails even for real requests:
- **Wrong URL**: behind a load balancer or proxy your app sees \`http://\` or an internal host, but Twilio signed \`https://api.myapp.com/...\`. Build the URL from your known public base URL.
- **Body changed**: a middleware altered or did not parse the form body.
- **Wrong token**: you rotated the Auth Token or used a subaccount's token.

For JSON-body webhooks Twilio signs differently (it adds a \`bodySHA256\` query parameter); the helper library has \`validateRequestWithBody\` for that case.`,
      why: `Without validation, an attacker could trigger your "call completed" logic, mark interviews done, spam your queues, or inject fake SpeechResult text into your AI agent. Signature validation is cheap and blocks all of that.`,
      analogy: `It is like a wax seal on a royal letter. Anyone can write a letter that says "from the King", but only the King has the seal stamp. You check the seal before you obey the letter.`,
      code: [
        {
          title: 'Manual validation middleware (works behind proxies)',
          lang: 'javascript',
          code: `import twilio from 'twilio';

const PUBLIC_BASE_URL = 'https://api.myapp.com'; // what you configured in Twilio

function verifyTwilio(req, res, next) {
  const signature = req.get('X-Twilio-Signature') || '';
  const url = PUBLIC_BASE_URL + req.originalUrl;   // includes the query string
  const ok = twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, url, req.body);
  if (!ok) return res.status(403).send('Invalid signature');
  next();
}

app.use('/twilio', express.urlencoded({ extended: false }), verifyTwilio);`,
        },
        {
          title: 'Or the built-in middleware',
          lang: 'javascript',
          code: `// twilio.webhook() validates using process.env.TWILIO_AUTH_TOKEN by default.
// Pass url/host/protocol options when you are behind a proxy.
app.post(
  '/twilio/voice',
  express.urlencoded({ extended: false }),
  twilio.webhook({ validate: process.env.NODE_ENV === 'production' }),
  (req, res) => {
    res.type('text/xml').send('<Response><Say>Verified!</Say></Response>');
  },
);`,
        },
      ],
      output: `A real Twilio request has a matching signature, so \`next()\` runs and the route answers. A fake request from curl has no signature or a wrong one, so the server replies \`403 Invalid signature\` and your business logic never runs.

In the second block, validation is turned off outside production so you can test locally with tools that cannot sign — but keep it on in every deployed environment.`,
      questions: [
        {
          q: 'How do you verify that a webhook really came from Twilio?',
          a: 'Validate the `X-Twilio-Signature` header with `twilio.validateRequest(authToken, signature, url, params)` or the `twilio.webhook()` middleware, and reject with 403 if it fails.',
        },
        {
          q: 'How is the Twilio signature computed?',
          a: 'HMAC-SHA1 of the full request URL plus all POST params sorted alphabetically and concatenated as name+value, keyed with your Auth Token, then Base64 encoded.',
        },
        {
          q: 'Signature validation fails in production but works locally. Why?',
          a: 'Usually the URL. Behind a proxy or load balancer the app sees `http` or an internal host. Rebuild the URL with the public `https` base that Twilio actually called.',
        },
        {
          q: 'What happens to signatures when you rotate the Auth Token?',
          a: 'Twilio signs with the current primary token. Update your env variable together with the rotation, or valid requests start failing.',
        },
      ],
      spoken: `"Every Twilio webhook has an X-Twilio-Signature header. It is an HMAC-SHA1 of the full URL plus the sorted POST parameters, using my Auth Token as the key. On my server I recompute it with twilio.validateRequest or the twilio.webhook middleware, and reject anything that does not match with a 403. The classic production bug is the URL: behind a load balancer the app sees http or an internal host, so I build the URL from the public base URL configured in Twilio. This stops anyone from faking call events or injecting fake speech into the AI agent."`,
      mistakes: [
        'Validating against `req.protocol + req.get(\'host\')` behind a proxy — the scheme or host is wrong, so all real requests fail.',
        'Disabling validation "temporarily" in production and forgetting it.',
        'Comparing signatures before the form body is parsed, or after another middleware changed it.',
        'Follow-up trap: "Is HTTPS alone enough?" No. HTTPS protects the data in transit, but anyone can still send an HTTPS request to your public URL. The signature proves the sender.',
      ],
      takeaway: 'Always validate X-Twilio-Signature with the exact public URL Twilio called; reject failures with 403.',
    },
    {
      id: 'zoho-oauth2',
      title: 'Zoho OAuth2: Grant Token, Access Token, Refresh Token',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Exchange a short-lived grant code for an access token (about 1 hour) and a long-lived refresh token, using the accounts domain of the right data center.',
      what: `Zoho uses **OAuth 2.0**. There are three kinds of tokens:

1. **Grant token** (authorization code): a one-time code. It lives only a few minutes. You get it after the user approves your app (or from a **Self Client** in the Zoho API Console for server-to-server use).
2. **Access token**: used on every API call. It expires after about **1 hour**.
3. **Refresh token**: long-lived. You use it to get a new access token. Store it securely (encrypted in your DB or a secret manager).

You exchange tokens at the **accounts server** of the user's data center, for example \`https://accounts.zoho.com/oauth/v2/token\` (US), \`accounts.zoho.eu\` (EU), \`accounts.zoho.in\` (India).

#### Deeper version
- **Scopes** decide what the token can do, for example \`ZohoCRM.modules.leads.ALL\` or \`ZohoCRM.modules.ALL\`, \`ZohoCRM.settings.ALL\`. Ask for the minimum.
- \`access_type=offline\` in the authorize URL is needed to get a refresh token.
- The token response includes \`api_domain\` (like \`https://www.zohoapis.in\`). Use it for API calls.
- Zoho limits how many refresh tokens a user can have and how many access tokens you can generate in a time window. So **cache** the access token and refresh it only when it is about to expire — do not refresh on every request. Exact limits change; check the docs.
- In a multi-instance backend, protect the refresh with a lock (for example Redis) so ten servers do not refresh at once.`,
      why: `OAuth lets your app act on a Zoho org without storing anyone's password, with limited scopes that can be revoked. Short access tokens limit the damage if one leaks.`,
      analogy: `The grant token is a cloakroom ticket you must use within minutes. You trade it for a day pass (access token, valid one hour) and a membership card (refresh token). When the day pass expires, you show the membership card at the desk and get a new day pass.`,
      code: [
        {
          title: 'Exchange the grant code and refresh tokens',
          lang: 'javascript',
          code: `const ACCOUNTS = 'https://accounts.zoho.in'; // data-center specific

// 1) One time: grant code -> access + refresh token
async function exchangeGrant(code) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    redirect_uri: 'https://api.myapp.com/zoho/callback',
    code,
  });
  const res = await fetch(\`\${ACCOUNTS}/oauth/v2/token\`, { method: 'POST', body: params });
  const t = await res.json(); // { access_token, refresh_token, api_domain, expires_in, ... }
  if (t.error) throw new Error(t.error);
  await saveTokens({ refreshToken: t.refresh_token, apiDomain: t.api_domain });
  return t;
}

// 2) Cached access token, refreshed only when needed
let cached = { token: null, expiresAt: 0 };
async function getAccessToken() {
  if (cached.token && Date.now() < cached.expiresAt - 60_000) return cached.token;
  const { refreshToken } = await loadTokens();
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
  });
  const t = await (await fetch(\`\${ACCOUNTS}/oauth/v2/token\`, { method: 'POST', body: params })).json();
  if (t.error) throw new Error(\`Zoho refresh failed: \${t.error}\`);
  cached = { token: t.access_token, expiresAt: Date.now() + t.expires_in * 1000 };
  return cached.token;
}`,
        },
      ],
      output: `\`exchangeGrant\` runs once (in the OAuth callback or with a Self Client code). It stores the refresh token and \`api_domain\`. After that, every API call uses \`getAccessToken()\`. For about an hour it returns the cached token instantly. One minute before expiry it calls the token endpoint with the refresh token and caches the new access token.

If the grant code is old or already used, Zoho returns an error like \`invalid_code\` and the function throws. Note: the refresh response does **not** include a new refresh token — keep the original one.`,
      questions: [
        {
          q: 'Explain the Zoho OAuth flow.',
          a: 'User approves scopes → you receive a short-lived grant code → POST it to `/oauth/v2/token` with client id/secret → get an access token (about 1 hour) and a refresh token → use the refresh token to get new access tokens.',
        },
        {
          q: 'What is a Self Client?',
          a: 'An API Console client type for server-side scripts with no user redirect. You generate a grant code in the console for chosen scopes and exchange it for tokens once.',
        },
        {
          q: 'Why does the accounts domain matter?',
          a: 'Zoho runs separate data centers. An org on the EU or IN data center must use `accounts.zoho.eu` / `accounts.zoho.in` and its matching API domain, otherwise tokens are invalid.',
        },
        {
          q: 'Why cache the access token?',
          a: 'Zoho rate-limits token generation. Refreshing on every call hits those limits and adds latency. Cache it and refresh shortly before expiry, with a lock across instances.',
        },
        {
          q: 'How do you send the token?',
          a: 'Header `Authorization: Zoho-oauthtoken <access_token>` — note the prefix is not `Bearer`.',
        },
      ],
      spoken: `"Zoho uses OAuth2. The user or a Self Client gives me a grant code that lives only a few minutes. I exchange it at the accounts server of the correct data center for an access token, valid about one hour, and a refresh token, which I store encrypted. On each API call I use a cached access token and refresh it only shortly before expiry, because Zoho limits token generation. The token response includes api_domain, so I always call the right regional API. And the header is Zoho-oauthtoken, not Bearer."`,
      mistakes: [
        'Using `Bearer` instead of `Zoho-oauthtoken` in the Authorization header.',
        'Refreshing the access token on every request and hitting Zoho\'s token rate limits.',
        'Forgetting `access_type=offline`, so no refresh token comes back.',
        'Mixing data centers: getting a token from `accounts.zoho.com` for an `.in` org.',
        'Follow-up trap: "What if the refresh token stops working?" It can be revoked (user removed access, too many tokens, client deleted). Detect `invalid_code`/`invalid_token`, alert, and run the consent flow again.',
      ],
      takeaway: 'Grant code once → refresh token stored safely → cached 1-hour access tokens, all on the correct data-center domain.',
    },
    {
      id: 'zoho-leads-upsert',
      title: 'Creating and Upserting Leads',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'POST to /crm/vN/Leads to insert, or /Leads/upsert with duplicate_check_fields to insert-or-update without duplicates.',
      what: `To create a lead you POST to \`/crm/v2/Leads\` (or a newer version) with \`{ data: [ ...records ] }\`. You can send many records in one call (up to 100 per call for insert/upsert).

**Upsert** means "update if it exists, insert if it does not". You POST to \`/crm/v2/Leads/upsert\` and say which field decides "same lead" with \`duplicate_check_fields\`, for example \`["Email"]\`. The response tells you the \`action\`: \`insert\` or \`update\`.

#### Deeper version
- Use upsert for forms and syncs: a person who submits the sign-up form twice should not become two leads.
- Add \`trigger: ["workflow"]\` if you want Zoho workflow rules to run for API-created records. Without the \`trigger\` key, the default behaviour may run automation; send an empty array to skip it. Check the docs for the version you use.
- Each record in the response has its own \`code\` and \`status\`. Typical errors: \`MANDATORY_NOT_FOUND\`, \`INVALID_DATA\`, \`DUPLICATE_DATA\` (on insert when a unique field already exists).
- Lookup fields take an object with id: \`Owner: { id: "..." }\`.
- To turn a lead into contact/account/deal, use the **convert** action (\`/Leads/{id}/actions/convert\`).`,
      why: `Leads come from many places: website forms, Stripe checkouts, demos booked. Upsert keeps one clean record per person, so sales do not call the same person twice and reports are accurate.`,
      analogy: `Insert is writing a new card for every visitor. Upsert is first checking the guest book by email: if the name is there, you update their phone number; if not, you add a new line.`,
      code: [
        {
          title: 'Upsert a lead from a sign-up form',
          lang: 'javascript',
          code: `async function upsertLead(form) {
  const token = await getAccessToken();
  const { apiDomain } = await loadTokens();

  const res = await fetch(\`\${apiDomain}/crm/v2/Leads/upsert\`, {
    method: 'POST',
    headers: { Authorization: \`Zoho-oauthtoken \${token}\`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [{
        Last_Name: form.lastName,
        First_Name: form.firstName,
        Email: form.email.toLowerCase(),
        Company: form.company,
        Lead_Source: 'Website',
        Plan_Interest: form.plan,          // a custom field (API name)
      }],
      duplicate_check_fields: ['Email'],
      trigger: ['workflow'],              // run workflow rules
    }),
  });

  if (res.status === 429) throw new Error('Zoho rate limit — retry later');
  const body = await res.json();
  const result = body.data[0];
  if (result.status !== 'success') {
    throw new Error(\`Zoho error \${result.code}: \${JSON.stringify(result.details)}\`);
  }
  return { id: result.details.id, action: result.action }; // action: insert | update
}`,
        },
      ],
      output: `First submission for \`asha@acme.com\` returns \`{ id: "5725...", action: "insert" }\`. If the same person submits again, Zoho finds the lead by Email and returns the same id with \`action: "update"\` — no duplicate.

If \`Last_Name\` is missing, \`result.status\` is \`error\` with \`code: "MANDATORY_NOT_FOUND"\` and \`details.api_name: "Last_Name"\`, so the function throws a clear error.`,
      questions: [
        {
          q: 'How do you avoid duplicate leads?',
          a: 'Use the upsert endpoint with `duplicate_check_fields` (for example Email), normalize values (lowercase emails, E.164 phones), and optionally mark fields as unique in Zoho.',
        },
        {
          q: 'How do you know if upsert inserted or updated?',
          a: 'Each record in the response has `action: "insert"` or `action: "update"` plus `details.id`.',
        },
        {
          q: 'How many records can you create in one API call?',
          a: 'Up to 100 records per insert/upsert call. For bigger volumes use batching with rate-limit handling, or the Bulk Write API.',
        },
        {
          q: 'Do workflow rules run for records created by API?',
          a: 'You control it with the `trigger` array (for example `["workflow"]`). Pass an empty array to avoid triggering automation. Check your API version\'s default.',
        },
      ],
      spoken: `"To create leads I post to the Leads endpoint with a data array, but for form submissions I prefer the upsert endpoint with duplicate_check_fields set to Email, so a repeat submission updates the existing lead instead of creating a duplicate. The response tells me whether it was an insert or an update and gives me the record id, which I store on my side. I check each record's status, not just the HTTP code, handle 429 rate limits with retries, normalize emails before sending, and use the trigger array to decide whether workflow rules should run."`,
      mistakes: [
        'Using insert for form submissions and creating many duplicate leads.',
        'Not normalizing the duplicate-check field — `Asha@Acme.com` and `asha@acme.com` look different to your code.',
        'Ignoring per-record errors inside `data` because the HTTP status was 200/201/202.',
        'Follow-up trap: "What if the lead was already converted?" Converted leads leave the Leads module (they become a Contact/Account/Deal), so upsert on Leads would create a new lead. Check Contacts too if that matters for your flow.',
      ],
      takeaway: 'Use upsert with duplicate_check_fields, normalize keys, and check each record\'s status in the response.',
    },
    {
      id: 'zoho-automation',
      title: 'Zoho Automation: Workflow Rules, Webhooks, Rate Limits',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Workflow rules fire actions (webhooks, field updates, functions) on record events; your API usage is limited by API credits and concurrency.',
      what: `**Workflow rules** are "if this, then that" inside Zoho CRM. A rule has:
- a **module** (for example Deals),
- a **trigger** (record created, edited, a field updated, or a date),
- **conditions** (for example \`Stage = Closed Won\`),
- **actions**: email alert, task, field update, **webhook**, or a **function** (custom code in Zoho's Deluge language).

A **webhook action** makes Zoho send an HTTP request to your server with fields you choose. This is how Zoho "pushes" changes to your app.

#### Deeper version
- Zoho webhooks are not signed like Twilio's by default. Protect them yourself: add a secret in a custom header or parameter, check it, use HTTPS, and ideally re-fetch the record from the Zoho API before trusting the data.
- Webhooks can fail or be delayed. Keep a safety net: a scheduled job that polls recently modified records (\`If-Modified-Since\` header or a search on \`Modified_Time\`).
- **Rate limits:** Zoho counts **API credits** per org in a rolling 24-hour window. The total depends on your edition and number of user licenses. Some calls cost more credits than others. There is also a **concurrency** limit (how many calls at the same time). Over the limit you get HTTP **429**. Exact numbers change by edition — check the current docs.
- For big jobs, use the **Bulk Read/Write APIs** instead of thousands of single calls.`,
      why: `Automation keeps the CRM and your product in sync in real time: when sales marks a deal as won, your system can provision the client's workspace without anyone sending a Slack message to engineering.`,
      analogy: `A workflow rule is a doorbell wired to a sensor: when the "deal won" door opens, the bell rings in your server room. API credits are a daily phone-call allowance: use them wisely or the line is blocked until tomorrow.`,
      code: [
        {
          title: 'Receiving a Zoho workflow webhook',
          lang: 'javascript',
          code: `// Zoho workflow: Deals, "Stage is Closed Won" -> Webhook POST
// to https://api.myapp.com/zoho/deal-won with a custom header X-Webhook-Secret
// and parameters dealId=\${Deals.Deal Id} (chosen in the Zoho UI).
import crypto from 'node:crypto';

app.post('/zoho/deal-won', express.json(), express.urlencoded({ extended: false }), async (req, res) => {
  const given = Buffer.from(req.get('X-Webhook-Secret') || '');
  const expected = Buffer.from(process.env.ZOHO_WEBHOOK_SECRET);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return res.sendStatus(401);
  }

  const { dealId } = req.body;
  await provisionQueue.add('provision', { dealId }, { jobId: \`deal-\${dealId}\` }); // dedupe
  res.sendStatus(202); // accepted, work happens in the background
});`,
        },
        {
          title: 'Retrying on 429 with exponential backoff',
          lang: 'javascript',
          code: `async function zohoFetch(url, options, attempt = 0) {
  const res = await fetch(url, options);
  if (res.status === 429 && attempt < 5) {
    const waitMs = 2 ** attempt * 1000 + Math.random() * 500; // 1s, 2s, 4s... plus jitter
    await new Promise((r) => setTimeout(r, waitMs));
    return zohoFetch(url, options, attempt + 1);
  }
  return res;
}`,
        },
      ],
      output: `When a sales rep moves a deal to Closed Won, Zoho POSTs to \`/zoho/deal-won\` with the secret header and \`dealId\`. The server checks the secret in constant time, queues a provisioning job whose \`jobId\` is based on the deal id (so a repeated webhook does not create a second job), and answers \`202\`.

The \`zohoFetch\` helper retries a rate-limited call after about 1, 2, 4, 8 and 16 seconds, with random jitter so many workers do not retry at the same moment.`,
      questions: [
        {
          q: 'What can a Zoho workflow rule do?',
          a: 'On create/edit/field update/date triggers with conditions, it can send email alerts, create tasks, update fields, call webhooks, or run custom Deluge functions.',
        },
        {
          q: 'How do you secure a Zoho webhook endpoint?',
          a: 'HTTPS plus a shared secret in a header or parameter checked with a constant-time compare. For important actions, re-fetch the record from the Zoho API to confirm the data.',
        },
        {
          q: 'How does Zoho rate limit API calls?',
          a: 'By API credits per org in a 24-hour window (based on edition and licenses) and by concurrent requests. Exceeding them returns 429.',
        },
        {
          q: 'What do you do if a webhook is missed?',
          a: 'Run a periodic reconciliation job that fetches records modified since the last sync and processes any that were not handled.',
        },
      ],
      spoken: `"Inside Zoho I used workflow rules: for example on the Deals module, when Stage becomes Closed Won, a webhook action calls my backend. Zoho webhooks are not signed by default, so I add a secret header, check it in constant time, and re-fetch the deal from the API before doing anything important. The handler only queues a job and returns 202. On the API side, Zoho limits calls with daily API credits and concurrency, so I cache tokens, batch records, use bulk APIs for large syncs, and retry 429s with exponential backoff and jitter."`,
      mistakes: [
        'Trusting the webhook body blindly. Anyone who finds the URL could trigger provisioning.',
        'Doing provisioning work synchronously inside the webhook request.',
        'Looping single-record API calls for a big import and burning the whole day\'s API credits.',
        'Follow-up trap: "Can a workflow cause an infinite loop?" Yes — if your API update triggers the same workflow which calls your webhook which updates the record again. Use conditions, the `trigger` array, or a flag field to break the loop.',
      ],
      takeaway: 'Workflow rules push events to you; secure and queue them, reconcile missed ones, and respect API credits with backoff.',
    },
    {
      id: 'jitsi-jwt',
      title: 'JWT Authentication for Jitsi Rooms',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Your backend signs a short-lived JWT with room, context.user, aud/iss/sub and exp; Jitsi lets in only users with a valid token.',
      what: `By default, anyone who knows a Jitsi room name can join it. For interviews that is not acceptable. **JWT authentication** fixes this.

A **JWT** (JSON Web Token) is a signed piece of JSON. Your backend creates it after checking "is this user allowed into this interview?". The browser passes it to Jitsi (\`jwt\` option). Jitsi checks the signature and the claims, and only then lets the user in.

Important claims (fields):
- \`room\` — which room this token is for (\`*\` means any room — avoid it for interviews).
- \`context.user\` — \`name\`, \`email\`, \`avatar\`, \`id\`, and on JaaS \`moderator\`.
- \`aud\`, \`iss\`, \`sub\` — audience, issuer, subject. They must match what the server expects.
- \`exp\` (expiry) and \`nbf\` (not before) — Unix timestamps in seconds.

#### Deeper version
The exact claim values depend on the deployment:
- **Self-hosted** (Prosody token auth): usually **HS256** signed with a shared \`app_secret\`; \`iss\` = your \`app_id\`, \`aud\` = configured audience (often \`jitsi\`), \`sub\` = your Jitsi domain.
- **JaaS (8x8)**: **RS256** signed with your private key; the header \`kid\` is your API key id; \`aud: "jitsi"\`, \`iss: "chat"\`, \`sub\` = your AppID; \`context.features\` turns on things like recording; \`moderator\` is a string \`"true"\`/\`"false"\`.

Make tokens short-lived and generate them **just before join**: an interview at 4 PM gets a token valid from about 3:50 to the end of the slot. Interviewer = moderator, candidate = not moderator.`,
      why: `JWTs let your app decide who joins which interview, who is moderator, and when, without Jitsi knowing your user database. Leaked room links become useless without a valid token.`,
      analogy: `A JWT is a concert wristband printed by the ticket office (your backend). The guard at the gate (Jitsi) does not check the ticket database — they just check the wristband is genuine, is for this hall, and is for today.`,
      code: [
        {
          title: 'Issuing a JaaS JWT (RS256)',
          lang: 'javascript',
          code: `import jwt from 'jsonwebtoken';

// Called by GET /interviews/:id/join-token after checking the user belongs to this interview
function createJaasToken({ user, roomName, isInterviewer, endsAt }) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: 'jitsi',
    iss: 'chat',
    sub: process.env.JAAS_APP_ID,            // vpaas-magic-cookie-...
    room: roomName,                          // a specific room, not '*'
    nbf: now - 10,
    exp: Math.floor(endsAt / 1000) + 15 * 60, // slot end + 15 min buffer
    context: {
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        moderator: isInterviewer ? 'true' : 'false',
      },
      features: { recording: isInterviewer ? 'true' : 'false', livestreaming: 'false' },
    },
  };
  return jwt.sign(payload, process.env.JAAS_PRIVATE_KEY, {
    algorithm: 'RS256',
    header: { kid: process.env.JAAS_KEY_ID, typ: 'JWT' }, // "AppID/keyId"
  });
}`,
        },
        {
          title: 'Self-hosted token (HS256) for comparison',
          lang: 'javascript',
          code: `const token = jwt.sign(
  {
    aud: 'jitsi',
    iss: process.env.JITSI_APP_ID,      // app_id in the Prosody config
    sub: 'meet.mycompany.com',          // your Jitsi domain
    room: 'interview-8f3a2c',
    context: { user: { name: 'Asha (Candidate)', email: 'asha@acme.com' } },
  },
  process.env.JITSI_APP_SECRET,
  { algorithm: 'HS256', expiresIn: '2h' },
);`,
        },
      ],
      output: `The frontend calls the join-token endpoint and gets a long string like \`eyJhbGciOiJSUzI1NiIs...\`. It passes it as \`jwt\` to \`JitsiMeetExternalAPI\`. Jitsi checks the signature, room and expiry. The interviewer joins as moderator with recording allowed. The candidate joins as a normal participant.

If someone copies the room link without a token, or uses a token for another room, or uses it after \`exp\`, Jitsi refuses to let them in.`,
      questions: [
        {
          q: 'How do you secure Jitsi rooms?',
          a: 'Enable JWT auth. The backend checks permissions and signs a short-lived token with the room name, user info and moderator flag. Jitsi verifies it before allowing a join.',
        },
        {
          q: 'What claims does a Jitsi JWT need?',
          a: '`aud`, `iss`, `sub`, `room`, `exp` (and often `nbf`), plus `context.user` with name/email/id. JaaS also uses `context.user.moderator` and `context.features`, and needs `kid` in the header.',
        },
        {
          q: 'Who generates the token and why not the frontend?',
          a: 'Only the backend. Signing needs the secret or private key; if the frontend could sign, anyone could mint tokens for any room.',
        },
        {
          q: 'HS256 vs RS256 here?',
          a: 'HS256 uses one shared secret for signing and verifying (typical self-hosted). RS256 signs with a private key and verifies with a public key (JaaS) — the verifier never holds a secret that can create tokens.',
        },
      ],
      spoken: `"Jitsi rooms are open by default, so I enabled JWT authentication. When a user clicks join, my backend checks they belong to that interview, then signs a short-lived token. It has the specific room name, context.user with name, email and id, the moderator flag for the interviewer, and aud, iss, sub and exp that match the server config. With JaaS it is RS256 with a kid header; self-hosted Prosody typically uses HS256 with an app secret. The frontend just passes the token to the IFrame API. A leaked room link is useless without a valid token."`,
      mistakes: [
        'Using `room: "*"` for everyone — any token holder can join any interview.',
        'Long-lived tokens (days or weeks) that keep working if a link leaks.',
        'Putting `exp` in milliseconds instead of seconds — the token looks valid for thousands of years or is instantly rejected depending on the library.',
        'On JaaS, sending `moderator: true` as a boolean when the docs show a string, or forgetting the `kid` header.',
        'Follow-up trap: "Can a candidate become moderator by editing the token?" No. Changing any claim breaks the signature, and Jitsi rejects it.',
      ],
      takeaway: 'Backend-signed, short-lived, room-specific JWTs decide who joins and who moderates.',
    },
    {
      id: 'jitsi-self-host-vs-jaas',
      title: 'Self-hosting Jitsi vs JaaS (8x8) and Jitsi Architecture',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'JaaS is hosted Jitsi you pay per user; self-hosting is free software but you run Prosody, Jicofo, the videobridge and Jibri yourself.',
      what: `You have two main ways to run Jitsi for a product:

- **JaaS (Jitsi as a Service)** by 8x8: they host everything. You get an **AppID**, upload a public key, sign JWTs with your private key, and use domain \`8x8.vc\`. You pay by usage (monthly active users; a free tier exists). Features like recording and transcription are add-ons you enable.
- **Self-hosting**: you install Jitsi on your own servers (Debian packages, Docker, or Kubernetes). The software is free, but you pay for servers and bandwidth, and you own updates, scaling and monitoring.

#### Deeper version
A Jitsi deployment has several parts:
- **Jitsi Meet** — the web app (React) users open.
- **Prosody** — an **XMPP** server (XMPP is a chat/presence protocol). It handles signalling: who is in which room, chat messages, and authentication (JWT plugin).
- **Jicofo** — the "focus": it manages each conference and decides which videobridge to use.
- **JVB (Jitsi Videobridge)** — an **SFU** (Selective Forwarding Unit). Each participant sends one stream to JVB, and JVB forwards it to the others. It does not mix video, so CPU stays low, but bandwidth grows with participants.
- **Jibri** — records or live-streams by running a hidden Chrome that joins the call.
- **Jigasi** — a SIP gateway for phone dial-in and transcription.

Self-hosting gotchas: open UDP port 10000 for media, set the public IP correctly behind NAT, add TURN for strict corporate networks, and scale JVBs horizontally for many rooms.`,
      why: `The choice is build-vs-buy. A small team running scheduled interviews usually saves time with JaaS. A company with strict data-residency needs, huge volume, or deep customizations may self-host.`,
      analogy: `JaaS is staying in a hotel: you pay per night and someone else fixes the plumbing. Self-hosting is owning a house: cheaper per night at scale and you can renovate anything, but every leak is yours.`,
      code: [
        {
          title: 'Same React code, two backends',
          lang: 'javascript',
          code: `// One config object, chosen by environment
const JITSI = process.env.JITSI_MODE === 'jaas'
  ? {
      domain: '8x8.vc',
      scriptUrl: \`https://8x8.vc/\${process.env.JAAS_APP_ID}/external_api.js\`,
      room: (id) => \`\${process.env.JAAS_APP_ID}/interview-\${id}\`, // AppID prefix is required
    }
  : {
      domain: 'meet.mycompany.com',
      scriptUrl: 'https://meet.mycompany.com/external_api.js',
      room: (id) => \`interview-\${id}\`,
    };

export default JITSI;`,
        },
        {
          title: 'Self-hosted with Docker (outline)',
          lang: 'bash',
          code: `# Official docker-jitsi-meet project (check its README for the current release steps)
# 1) Download the latest release and copy env.example to .env
cp env.example .env
./gen-passwords.sh            # generates internal component passwords

# 2) In .env set at least: PUBLIC_URL, timezone, and for JWT auth:
#    ENABLE_AUTH=1, AUTH_TYPE=jwt, JWT_APP_ID=..., JWT_APP_SECRET=...

# 3) Start web, prosody, jicofo and jvb
docker compose up -d

# Remember: open UDP 10000 (media) and TCP 443 (web) on the firewall`,
        },
      ],
      output: `With \`JITSI_MODE=jaas\` the frontend loads the script from \`8x8.vc\` and joins rooms like \`vpaas-magic-cookie-abc/interview-42\`. Otherwise it uses your own domain with plain room names. The rest of your React code stays the same.

The Docker outline starts the four core containers. If UDP 10000 is blocked, users can join but see black video or hear nothing — the most common self-hosting issue.`,
      questions: [
        {
          q: 'What are the main components of a Jitsi deployment?',
          a: 'Jitsi Meet (web UI), Prosody (XMPP signalling and auth), Jicofo (conference focus), Jitsi Videobridge (SFU that forwards media), plus optional Jibri (recording) and Jigasi (SIP/transcription).',
        },
        {
          q: 'What is an SFU and why does Jitsi use one?',
          a: 'A Selective Forwarding Unit receives each user\'s stream once and forwards it to the others without mixing. It scales much better than peer-to-peer mesh and needs less CPU than mixing (MCU).',
        },
        {
          q: 'When would you choose JaaS over self-hosting?',
          a: 'When you want to ship fast with a small team, have moderate volume, and do not want to manage media servers, TURN, scaling and upgrades.',
        },
        {
          q: 'Common self-hosting problem?',
          a: 'Media fails because UDP 10000 is blocked or the videobridge advertises a private IP. Configure the public IP / NAT settings and add a TURN server for restricted networks.',
        },
      ],
      spoken: `"I can use Jitsi either as JaaS, which is 8x8's hosted service, or self-host it. JaaS gives me an AppID, I sign RS256 JWTs, prefix room names with the AppID, and pay per active user, but I do not run any media servers. Self-hosting is free software, but I own Prosody for XMPP signalling, Jicofo for conference control, the videobridge which is an SFU forwarding media, and Jibri for recording. For a scheduled-interview product with a small team, JaaS was the faster and safer choice; self-hosting makes sense for data-residency rules or very high volume."`,
      mistakes: [
        'Forgetting the AppID prefix in JaaS room names, so the token and room do not match.',
        'Self-hosting without opening UDP 10000 or setting the public IP — calls connect but no media flows.',
        'Thinking self-hosted is "free". Bandwidth, servers, on-call time and upgrades cost real money.',
        'Follow-up trap: "Does Jitsi use peer-to-peer?" For exactly two participants Jitsi can switch to a direct P2P connection; with three or more it goes through the videobridge. This is configurable.',
      ],
      takeaway: 'JaaS = buy hosted Jitsi; self-host = run Prosody, Jicofo, JVB and Jibri yourself. Choose by team size, volume and compliance.',
    },
    {
      id: 'jitsi-websocket-signalling',
      title: 'App-level Signalling with WebSockets vs Jitsi\'s XMPP Signalling',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'Jitsi signals media over XMPP internally; your app uses its own WebSocket channel for scheduling, waiting rooms, join/leave and presence.',
      what: `**Signalling** means the messages that set up and coordinate a call — not the audio/video itself.

There are **two layers** of signalling in a Jitsi-based interview product:

1. **Jitsi's internal signalling** — Jitsi Meet talks to **Prosody** using **XMPP** (over WebSocket or BOSH). It exchanges WebRTC session details (who is in the room, which codecs, which network paths). You do not write this; Jitsi handles it.
2. **Your app-level signalling** — your own WebSocket server (for example **Socket.IO**) for business events: "interview starts in 5 minutes", "candidate is in the waiting room", "interviewer admitted the candidate", "interviewer left", "interview rescheduled".

#### Deeper version
A typical scheduled-interview flow:
1. Both users open the interview page and connect a socket, authenticated with your app's session/JWT.
2. Each joins a socket room \`interview:<id>\`. The server broadcasts **presence** (who is online).
3. The candidate waits. The interviewer clicks "Admit". The server checks permissions and the time window, issues a **Jitsi JWT** just in time, and emits \`join-allowed\` with it.
4. The frontend mounts the Jitsi IFrame. Jitsi events (\`videoConferenceJoined\`, \`readyToClose\`) are reported back over your socket so the server can log attendance.

Production details: heartbeats and a grace period on \`disconnect\` (a page refresh should not mark someone "left"), a **Redis adapter** to broadcast across multiple Node instances, and the database (not the socket) as the source of truth for interview state.`,
      why: `Jitsi knows about media, not about your business. It does not know the interview schedule, who is the interviewer, or whether the candidate passed the waiting room. Your own signalling channel connects video with your product logic in real time.`,
      analogy: `Jitsi's XMPP signalling is the stage crew talking on their headsets about lights and microphones. Your WebSocket signalling is the event manager telling guests "the room is ready, please go in". Both are needed, and they do different jobs.`,
      code: [
        {
          title: 'Socket.IO server: presence + admit flow',
          lang: 'javascript',
          code: `import { Server } from 'socket.io';
const io = new Server(httpServer, { cors: { origin: 'https://app.myapp.com' } });

io.use(async (socket, next) => {               // authenticate the socket
  try {
    socket.user = await verifyAppJwt(socket.handshake.auth.token);
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('interview:join', async ({ interviewId }) => {
    const iv = await Interview.findById(interviewId);
    if (!iv || !iv.hasParticipant(socket.user.id)) return;
    socket.join(\`interview:\${interviewId}\`);
    io.to(\`interview:\${interviewId}\`).emit('presence', { userId: socket.user.id, online: true });
  });

  socket.on('interviewer:admit', async ({ interviewId }) => {
    const iv = await Interview.findById(interviewId);
    if (iv?.interviewerId !== socket.user.id || !iv.isWithinWindow()) return;
    const room = io.sockets.adapter.rooms.get(\`interview:\${interviewId}\`) || new Set();
    for (const id of room) {                   // give each member their own Jitsi token
      const s = io.sockets.sockets.get(id);
      const jwt = createJaasToken({ user: s.user, roomName: iv.roomName,
        isInterviewer: s.user.id === iv.interviewerId, endsAt: iv.endsAt });
      s.emit('join-allowed', { roomName: iv.roomName, jwt });
    }
  });
});`,
        },
        {
          title: 'Client: wait, then mount Jitsi',
          lang: 'javascript',
          code: `import { io } from 'socket.io-client';

const socket = io('https://api.myapp.com', { auth: { token: appToken } });
socket.on('connect', () => socket.emit('interview:join', { interviewId }));
socket.on('presence', (p) => showPresence(p));          // "Interviewer is online"
socket.on('join-allowed', ({ roomName, jwt }) => {
  mountJitsi({ roomName, jwt });                         // create JitsiMeetExternalAPI
});`,
        },
      ],
      output: `The candidate opens the page, the socket authenticates, and they join \`interview:42\`. The interviewer sees "Candidate is online". When the interviewer clicks Admit, the server checks they are the interviewer and the time is right, then sends each person in the room a personal Jitsi JWT (moderator for the interviewer). Both clients mount the Jitsi iframe and the video call starts.

A random user who connects with a valid app token but is not part of interview 42 is ignored at \`interview:join\`, so they never receive a Jitsi token.`,
      questions: [
        {
          q: 'What signalling does Jitsi use internally?',
          a: 'XMPP through the Prosody server (over WebSocket or BOSH), with Jicofo managing conferences. It carries room membership and WebRTC session negotiation.',
        },
        {
          q: 'Why build your own WebSocket signalling if Jitsi already has signalling?',
          a: 'Jitsi\'s signalling is about media. Business events — schedules, waiting room, admit, reschedule, attendance — belong to your app and need your own auth and data.',
        },
        {
          q: 'How do you scale Socket.IO across multiple servers?',
          a: 'Use the Redis adapter (or another adapter) so `io.to(room).emit()` reaches sockets on all instances, and sticky sessions if using HTTP long-polling.',
        },
        {
          q: 'How do you avoid marking a user as "left" on a page refresh?',
          a: 'On disconnect, start a short grace timer (for example 15-30 seconds). If the same user reconnects, cancel it; otherwise broadcast that they left.',
        },
      ],
      spoken: `"There are two signalling layers. Jitsi itself uses XMPP through Prosody to negotiate media and room membership — I don't touch that. On top, I built app-level signalling with Socket.IO for business events. Users authenticate the socket with our app token and join a room per interview, so I can show presence. The candidate waits until the interviewer admits them; then the server checks permissions and the time window and sends each user their own short-lived Jitsi JWT. I used the Redis adapter to scale, a grace period on disconnect for refreshes, and the database as the source of truth."`,
      mistakes: [
        'Confusing WebRTC signalling with media. Signalling only coordinates; media flows separately (to the videobridge or peer-to-peer).',
        'Sending the Jitsi JWT to the whole socket room including people who should not have it. Issue per user after a permission check.',
        'Keeping interview state only in memory on one Node instance — it is lost on restart and wrong across instances.',
        'Follow-up trap: "Why not just use Jitsi\'s lobby feature?" You can, but your own flow lets you enforce schedule windows, log attendance in your DB, and show product UI before Jitsi even loads.',
      ],
      takeaway: 'Jitsi does media signalling over XMPP; your WebSocket layer does the business signalling — schedule, presence, admit, tokens.',
    },
    {
      id: 'webrtc-basics',
      title: 'WebRTC Basics Behind Jitsi: STUN, TURN, ICE, SFU',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'WebRTC sends audio/video between browsers; ICE finds a network path using STUN and TURN, and an SFU like Jitsi Videobridge forwards streams in group calls.',
      what: `**WebRTC** is the browser technology for real-time audio, video and data. Jitsi, Google Meet and many others use it.

To connect two devices, WebRTC needs to solve a problem: most devices sit behind routers (**NAT**) and do not have a public address.
- **STUN** server: tells your browser "this is your public IP and port". Cheap and simple.
- **TURN** server: a **relay**. When a direct path is impossible (strict corporate firewall), all media goes through TURN. Reliable but uses server bandwidth.
- **ICE**: the process that collects all possible paths (**candidates**: local, STUN, TURN) and picks the best one that works.
- **SDP**: a text description of the media session (codecs, tracks). It is exchanged through **signalling** — WebRTC does not define how; Jitsi uses XMPP.

#### Deeper version
Group call designs:
- **Mesh**: everyone sends to everyone. Fine for 2-3 people; uploads explode beyond that.
- **SFU** (Selective Forwarding Unit, like Jitsi Videobridge): everyone uploads once; the server forwards streams. Supports **simulcast** (each sender uploads several qualities; the SFU sends each receiver the quality that fits their network) — this is how Jitsi stays smooth on weak connections.
- **MCU**: the server mixes everything into one stream. Easy for clients, very CPU-heavy for the server.

Media is encrypted with **DTLS-SRTP** by default. With an SFU, the server can technically access media unless you use end-to-end encryption (Jitsi has an E2EE option with limitations).`,
      why: `When interviewers see "Jitsi" on your resume, they often ask how video calls actually connect and why some users get black video. Knowing STUN/TURN/ICE and SFU lets you debug real problems and answer design questions.`,
      analogy: `STUN is asking a friend outside "what is my house address?". TURN is using a post office to forward all letters because your house cannot receive mail directly. ICE is trying every route and picking the one that works. An SFU is a postman who copies your letter to everyone in the group so you only post it once.`,
      code: [
        {
          title: 'Configuring ICE servers in plain WebRTC',
          lang: 'javascript',
          code: `// Jitsi configures this for you; this shows what happens underneath.
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },               // public STUN
    {
      urls: 'turn:turn.mycompany.com:443?transport=tcp',    // TURN over TCP 443 for strict firewalls
      username: 'temp-user',                                 // short-lived credentials from your backend
      credential: 'temp-pass',
    },
  ],
});

pc.onicecandidate = (e) => {
  if (e.candidate) console.log('candidate type:', e.candidate.type); // host | srflx | relay
};
pc.onconnectionstatechange = () => console.log('state:', pc.connectionState);`,
        },
      ],
      output: `When the connection starts, the browser logs candidates: \`host\` (local network address), \`srflx\` (server reflexive — public address found via STUN) and \`relay\` (a TURN address). ICE tests pairs and the state moves to \`connected\`.

If a user is behind a strict firewall, only the \`relay\` candidate works, and media flows through TURN on port 443. Without TURN, that user would see \`failed\` — the classic "joined but black video" bug.`,
      questions: [
        {
          q: 'What is the difference between STUN and TURN?',
          a: 'STUN only discovers your public address so peers can try a direct connection. TURN relays all the media when a direct connection is impossible. TURN costs bandwidth; STUN is almost free.',
        },
        {
          q: 'What is ICE?',
          a: 'Interactive Connectivity Establishment: it gathers candidate addresses (host, STUN, TURN), tests pairs, and picks the best working path.',
        },
        {
          q: 'Mesh vs SFU vs MCU?',
          a: 'Mesh: everyone to everyone, good for 2-3 people. SFU: upload once, server forwards (Jitsi). MCU: server mixes into one stream, heavy on server CPU.',
        },
        {
          q: 'Does WebRTC define signalling?',
          a: 'No. You must exchange SDP and ICE candidates yourself — with WebSockets, HTTP, or XMPP like Jitsi does.',
        },
      ],
      spoken: `"WebRTC is the browser stack for real-time media. Since most devices sit behind NAT, ICE gathers candidate addresses: local ones, a public one discovered through STUN, and a relay address from a TURN server, then picks the best working path. TURN is the fallback for strict firewalls and costs bandwidth. Session details are described in SDP, which you exchange through your own signalling — Jitsi uses XMPP. For group calls Jitsi uses an SFU, the videobridge, so each person uploads once, and simulcast lets it send lower quality to weak connections."`,
      mistakes: [
        'Running a video product without TURN — corporate users connect to the room but get no media.',
        'Thinking WebRTC includes signalling. It does not; you bring your own.',
        'Hard-coding long-lived TURN credentials in the frontend. Issue short-lived ones from the backend.',
        'Follow-up trap: "Is WebRTC encrypted?" Yes, media is always encrypted with DTLS-SRTP. But with an SFU it is hop-by-hop, so the server could access media unless end-to-end encryption is enabled.',
      ],
      takeaway: 'ICE finds the path (STUN to discover, TURN to relay), signalling exchanges SDP, and an SFU makes group calls scale.',
    },
    {
      id: 'webhook-testing-debugging',
      title: 'Testing and Debugging Webhooks Locally (ngrok, Twilio Debugger)',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Expose localhost with a tunnel, inspect requests, read the Twilio Debugger, and make handlers fast, idempotent and observable.',
      what: `Twilio and Zoho must reach your server over the public internet. Your laptop is not public. A **tunnel** tool such as **ngrok** gives you a public HTTPS URL that forwards to \`localhost\`.

Then you:
1. Put the tunnel URL into the Twilio number's Voice/Messaging webhook (or the \`url\` of \`calls.create\`), or into the Zoho workflow webhook.
2. Trigger the event (call your number, send an SMS, move a test deal).
3. Watch the request in the tunnel's inspector and your logs.

#### Deeper version
- **Twilio Console Debugger / Error logs** show errors like \`11200\` (HTTP retrieval failure — your URL failed or timed out) and \`12100\`/\`12300\` (bad TwiML or wrong content type). Check exact codes in Twilio's error dictionary.
- The **Twilio CLI** can update a number's webhook to your local server for development. Check the current CLI docs for the exact command.
- Signature validation breaks with tunnels if you compute the URL from \`req\`; use the tunnel's public URL as the base.
- Use **Zoho sandbox** or a test org for workflow testing so you do not trigger real provisioning.
- Make handlers observable: log the \`CallSid\` / deal id on every line (a correlation id), and store raw webhook payloads for a few days for replay.
- Write unit tests for your TwiML builders and handlers by POSTing form bodies with \`supertest\`.`,
      why: `Webhook bugs are hard to see: the caller just hears "an application error has occurred". Good local tooling and logs make the feedback loop fast and production issues traceable.`,
      analogy: `ngrok is a temporary mail-forwarding address: Twilio sends letters to a public PO box, and the post office forwards them to your home desk. The Twilio Debugger is the post office's "returned mail" log telling you why a letter bounced.`,
      code: [
        {
          title: 'Tunnel your local server',
          lang: 'bash',
          code: `# Start your app on port 3000, then:
ngrok http 3000
# Forwarding https://a1b2-c3d4.ngrok-free.app -> http://localhost:3000
# Set PUBLIC_BASE_URL=https://a1b2-c3d4.ngrok-free.app so signature validation uses it`,
        },
        {
          title: 'Testing a TwiML route with supertest',
          lang: 'javascript',
          code: `import request from 'supertest';
import { app } from '../src/app.js';

test('unknown caller hears apology and hangup', async () => {
  const res = await request(app)
    .post('/twilio/inbound')
    .type('form')                                   // Twilio sends form-encoded data
    .send({ From: '+15550001111', CallSid: 'CA_test' });

  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/text\\/xml/);
  expect(res.text).toContain('<Hangup/>');
});`,
        },
      ],
      output: `ngrok prints a public HTTPS address. After you paste it into the Twilio number config and call the number, the request appears in the ngrok inspector (\`http://localhost:4040\`) and your route runs locally.

The test POSTs a fake inbound call from an unknown number and checks that the response is XML containing \`<Hangup/>\`. (In a test you skip or mock signature validation, or sign the request with a test token.)`,
      questions: [
        {
          q: 'How do you test Twilio webhooks on your laptop?',
          a: 'Expose localhost with a tunnel like ngrok, point the number\'s webhook to that URL, and inspect requests. Use the tunnel URL as the base when validating signatures.',
        },
        {
          q: 'The caller hears "an application error has occurred". How do you debug it?',
          a: 'Open the Twilio Debugger: it shows the error code and the request/response. Usually your URL timed out, returned non-2xx, or returned invalid TwiML or the wrong content type.',
        },
        {
          q: 'How do you trace one call across many logs?',
          a: 'Use the CallSid (or deal id for Zoho) as a correlation id in every log line, and store raw webhook payloads for replay.',
        },
      ],
      spoken: `"Because Twilio and Zoho need a public URL, I use ngrok during development and point the webhook to the tunnel. I use the tunnel URL as the base for signature validation. When a caller hears 'application error', the Twilio Debugger tells me the error code and what my server returned — usually a timeout, a non-2xx status, or invalid TwiML. I log the CallSid or deal id on every line, keep raw payloads for replay, use a Zoho sandbox for workflows, and unit-test my TwiML routes with supertest using form-encoded bodies."`,
      mistakes: [
        'Leaving the ngrok URL in the production Twilio config — it dies when your laptop sleeps.',
        'Testing workflows in the production Zoho org and accidentally provisioning real workspaces.',
        'Sending JSON in tests when Twilio sends form data, so tests pass but production fails.',
        'Follow-up trap: "How long does Twilio wait for your webhook?" Not long — voice webhooks time out after a short limit (about 15 seconds by default). Do slow work asynchronously and respond fast.',
      ],
      takeaway: 'Tunnel for local testing, Twilio Debugger for errors, correlation ids in logs, and tests that send form-encoded bodies.',
    },
    {
      id: 'twilio-media-streams',
      title: 'TwiML Connect/Stream: Bidirectional Media Streams',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: '<Connect><Stream> opens a WebSocket from Twilio to your server carrying live call audio both ways as base64 μ-law 8kHz.',
      what: `**Media Streams** let your server hear the call audio live and talk back, over a **WebSocket** (a long-lived two-way connection).

You return TwiML like:
\`<Response><Connect><Stream url="wss://api.myapp.com/media" /></Connect></Response>\`

Twilio then opens a WebSocket to your server and sends JSON messages:
- \`connected\` — the socket is open.
- \`start\` — stream details: \`streamSid\`, \`callSid\`, audio format, and your \`customParameters\`.
- \`media\` — small chunks of caller audio (about 20 ms each), base64-encoded.
- \`mark\` — confirms your audio up to a named point has finished playing.
- \`stop\` — the stream ended.

To speak, your server sends \`media\` messages back with base64 audio. To interrupt the bot, send \`clear\`.

#### Deeper version
- Audio format is **μ-law (G.711), 8000 Hz, mono** — phone quality. Audio you send back must be the same format, base64 encoded, with no file headers.
- \`<Connect><Stream>\` is **bidirectional** and blocks: the call stays in the stream until your WebSocket closes, then TwiML continues after \`<Connect>\`. \`<Start><Stream>\` is **one-way** (fork a copy of audio, for example for live transcription) and the call keeps running other TwiML.
- The stream URL must be \`wss://\` and does not accept query strings; pass data with \`<Parameter>\` instead. They arrive in \`start.customParameters\`.
- Use \`mark\` messages to know when the caller actually heard a sentence — useful for barge-in and for knowing what was really said.
- Twilio also offers higher-level products (for example ConversationRelay) that handle speech-to-text and text-to-speech for you; check the current docs if you want less audio plumbing.`,
      why: `This is how real-time AI voice agents work. Gather is turn-based and slow; a media stream gives you raw audio in real time, so you can use your own streaming speech-to-text, LLM and text-to-speech with low latency and natural interruptions.`,
      analogy: `Gather is like sending voice notes back and forth. A media stream is a live phone line plugged directly into your server: you hear every word as it is spoken and can speak back instantly.`,
      code: [
        {
          title: 'TwiML that opens the stream',
          lang: 'javascript',
          code: `app.post('/twilio/interview', (req, res) => {
  const vr = new twilio.twiml.VoiceResponse();
  const connect = vr.connect();
  const stream = connect.stream({ url: 'wss://api.myapp.com/media' });
  // No query strings in the stream URL — use parameters instead
  stream.parameter({ name: 'interviewId', value: String(req.query.interviewId) });
  vr.say('The interview has ended. Thank you!'); // runs after the socket closes
  res.type('text/xml').send(vr.toString());
});`,
        },
        {
          title: 'WebSocket server handling the stream',
          lang: 'javascript',
          code: `import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ server: httpServer, path: '/media' });

wss.on('connection', (ws) => {
  let streamSid = null;

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);
    switch (msg.event) {
      case 'start':
        streamSid = msg.start.streamSid;
        console.log('Stream for interview', msg.start.customParameters.interviewId);
        break;
      case 'media': {
        const audio = Buffer.from(msg.media.payload, 'base64'); // 20ms of mu-law audio
        stt.send(audio);                                         // to streaming speech-to-text
        break;
      }
      case 'mark':
        console.log('Finished playing:', msg.mark.name);
        break;
      case 'stop':
        stt.close();
        break;
    }
  });

  // Called by the TTS pipeline with mu-law 8kHz audio
  function speak(mulawBuffer, label) {
    ws.send(JSON.stringify({ event: 'media', streamSid, media: { payload: mulawBuffer.toString('base64') } }));
    ws.send(JSON.stringify({ event: 'mark', streamSid, mark: { name: label } }));
  }

  // Called when the candidate starts talking over the bot (barge-in)
  function interrupt() {
    ws.send(JSON.stringify({ event: 'clear', streamSid })); // drop queued bot audio
  }
});`,
        },
      ],
      output: `When the candidate answers, Twilio connects to \`wss://api.myapp.com/media\`. The server logs "Stream for interview 42". About 50 \`media\` messages per second arrive and are forwarded to speech-to-text.

When the bot replies, \`speak()\` sends audio and then a mark. Twilio plays the audio, then sends back \`mark\` with the same name, so you know the candidate heard it. If the candidate interrupts, \`clear\` stops the remaining bot audio immediately. When your server closes the socket, the call continues with the \`<Say>\` after \`<Connect>\` and then ends.`,
      questions: [
        {
          q: 'What is the difference between <Start><Stream> and <Connect><Stream>?',
          a: '`<Start><Stream>` forks audio one-way to your server while the call continues with other TwiML. `<Connect><Stream>` is bidirectional: your server can send audio back, and the call stays in the stream until the socket closes.',
        },
        {
          q: 'What audio format does Twilio use in media streams?',
          a: 'μ-law (G.711) at 8 kHz, mono, base64 encoded in JSON messages. Audio you send back must use the same format without file headers.',
        },
        {
          q: 'How do you pass the interview id to the WebSocket?',
          a: 'With `<Parameter name="interviewId" value="42"/>` inside `<Stream>`. It arrives in `start.customParameters`. Query strings on the stream URL are not supported.',
        },
        {
          q: 'How do you stop the bot when the user interrupts?',
          a: 'Detect user speech (VAD or STT interim results) and send a `clear` message with the `streamSid`. Twilio drops buffered audio. Also cancel the in-flight LLM/TTS work.',
        },
        {
          q: 'What are mark messages for?',
          a: 'You send a named mark after some audio; Twilio echoes it back when that audio finished playing. It tells you exactly what the caller heard.',
        },
      ],
      spoken: `"For the AI interview agent I used TwiML Connect with Stream, which opens a bidirectional WebSocket from Twilio to my server. I get a start event with the streamSid and my custom parameters like the interview id, then media events every twenty milliseconds with base64 mu-law 8 kilohertz audio, which I pipe into streaming speech-to-text. To speak, I send media messages back in the same format, followed by a mark so I know when playback finished. When the candidate interrupts, I send a clear event to flush the bot's audio and cancel the LLM and TTS work."`,
      mistakes: [
        'Sending MP3 or 16 kHz PCM back to Twilio. It must be raw μ-law 8 kHz, base64, or the caller hears noise or nothing.',
        'Putting the interview id in the stream URL query string — use `<Parameter>`.',
        'Not handling `clear` and barge-in, so the bot keeps talking over the candidate.',
        'Blocking the WebSocket message handler with slow work, which delays audio and causes choppy playback.',
        'Follow-up trap: "How do you secure the WebSocket endpoint?" Validate the `X-Twilio-Signature` on the upgrade request and/or pass a short-lived signed token as a custom parameter and verify it on `start`, closing the socket if it is invalid.',
      ],
      takeaway: 'Connect/Stream = live two-way μ-law audio over WebSocket; use media, mark and clear to build a real-time voice bot.',
    },
    {
      id: 'ai-voice-agent-architecture',
      title: 'Designing an AI Voice Interview Agent (Twilio + STT + LLM + TTS)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'A streaming pipeline: Twilio audio → speech-to-text → LLM → text-to-speech → Twilio, tuned for low latency, barge-in and reliability.',
      what: `An AI voice agent is a loop:

1. **Hear**: Twilio media stream sends caller audio to your server.
2. **Understand**: a streaming **STT** (speech-to-text) service turns audio into text as the person speaks.
3. **Decide**: when the person finishes their turn, send the conversation to an **LLM** (large language model) with the interview instructions.
4. **Speak**: stream the LLM's text into **TTS** (text-to-speech) and send the audio back to Twilio.

The goal is to feel like a natural phone call: short delays and the ability to interrupt.

#### Deeper version
**Latency budget.** Humans expect a reply within about a second. Time adds up: end-of-speech detection + STT final text + LLM first token + TTS first audio + network. Tricks:
- Stream everything. Start TTS on the **first sentence** of the LLM reply, not the full answer.
- Tune **endpointing** (how long a pause means "they finished"). Too short cuts people off; too long feels slow. Interview answers have thinking pauses, so be more patient than a support bot.
- Keep the server close to Twilio's media region and your AI providers.
- Ask the TTS provider for μ-law 8 kHz output directly to avoid converting audio.
- Some speech-to-speech (realtime) models accept G.711 μ-law directly, which removes separate STT/TTS hops; check the provider's current docs.

**Barge-in.** When STT detects the candidate speaking while the bot talks: send \`clear\` to Twilio, abort the LLM and TTS streams, and record only the part of the bot's answer that was actually played (use marks).

**State and reliability.** Keep the interview script and transcript in a per-call session object; save transcript chunks to the DB as you go. If the AI provider fails, play a fallback ("Sorry, give me a moment") and retry, or end politely. After the call, a background job scores the transcript.`,
      why: `Interviewers ask this as a system-design question when your resume says "AI voice agent". They want to see that you understand streaming, latency, interruptions and failure handling — not just "I called the OpenAI API".`,
      analogy: `It is like a live interpreter at a conference: they listen continuously, start speaking before the speaker has finished the whole speech, stop instantly when someone raises a hand, and keep notes of what was said.`,
      code: [
        {
          title: 'Turn handling with cancellation (simplified)',
          lang: 'javascript',
          code: `// One session per call. stt, llm and tts are streaming clients of your chosen providers.
class InterviewSession {
  constructor({ ws, streamSid, interview }) {
    Object.assign(this, { ws, streamSid, interview });
    this.history = [{ role: 'system', content: interview.systemPrompt }];
    this.abort = null; // AbortController for the bot's current reply
  }

  onUserSpeechStarted() {               // from STT / voice activity detection
    if (this.abort) {                   // the bot is talking -> barge-in
      this.abort.abort();
      this.ws.send(JSON.stringify({ event: 'clear', streamSid: this.streamSid }));
    }
  }

  async onUserTurnFinished(text) {      // STT final transcript after endpointing
    this.history.push({ role: 'user', content: text });
    await saveTranscript(this.interview.id, 'candidate', text);

    this.abort = new AbortController();
    const { signal } = this.abort;
    let reply = '';
    try {
      // Stream LLM tokens, cut into sentences, send each sentence to TTS right away
      for await (const sentence of llm.streamSentences(this.history, { signal })) {
        reply += sentence + ' ';
        for await (const chunk of tts.stream(sentence, { format: 'ulaw_8000', signal })) {
          this.ws.send(JSON.stringify({ event: 'media', streamSid: this.streamSid,
            media: { payload: chunk.toString('base64') } }));
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') throw err; // interrupted: keep only what was said
    } finally {
      this.history.push({ role: 'assistant', content: reply.trim() });
      await saveTranscript(this.interview.id, 'agent', reply.trim());
      this.abort = null;
    }
  }
}`,
        },
      ],
      output: `The candidate finishes an answer. After a short pause the STT gives a final transcript, which is saved and added to history. The LLM starts streaming; as soon as the first full sentence arrives ("Great, thanks for sharing that."), TTS converts it and the audio goes to Twilio while the LLM keeps generating the next sentence.

If the candidate starts talking in the middle, \`onUserSpeechStarted\` aborts the LLM and TTS streams and sends \`clear\`, so the bot goes quiet within a fraction of a second. The partial reply is saved. In a real system you would trim the saved reply to what was actually played, using \`mark\` events.`,
      questions: [
        {
          q: 'How would you design an AI phone interviewer?',
          a: 'Twilio `<Connect><Stream>` → WebSocket server → streaming STT → LLM with the interview prompt and history → streaming TTS in μ-law 8 kHz → back to Twilio. Add barge-in, transcript storage, status callbacks, and post-call scoring in a queue.',
        },
        {
          q: 'How do you reduce latency?',
          a: 'Stream every stage, start TTS on the first sentence, tune endpointing, use fast models for the live turn, keep servers near providers, and avoid audio format conversion.',
        },
        {
          q: 'How do you handle interruptions?',
          a: 'Detect user speech while the bot speaks, send `clear` to Twilio, abort LLM/TTS with an AbortController, and store only what the user actually heard.',
        },
        {
          q: 'What if the LLM or STT provider goes down mid-call?',
          a: 'Time out quickly, play a short filler or apology, retry once or switch to a fallback provider, and if it still fails, end politely, mark the interview for rescheduling, and alert.',
        },
        {
          q: 'How do you scale it?',
          a: 'Each call is a long-lived WebSocket, so scale by concurrent calls: stateless instances behind a load balancer that supports WebSockets, per-call session in memory with transcripts persisted, and autoscaling on connection count.',
        },
      ],
      spoken: `"The agent is a streaming pipeline. Twilio Connect Stream sends the candidate's audio to my WebSocket server, I pipe it to a streaming speech-to-text service, and when endpointing says the candidate finished, I send the history to the LLM. I stream the LLM output sentence by sentence into text-to-speech in mu-law 8 kilohertz and send it straight back to Twilio, so the first audio plays quickly. For barge-in I abort the LLM and TTS and send a clear event. Transcripts are saved during the call, and scoring runs in a background job after the completed status callback."`,
      mistakes: [
        'Waiting for the full LLM answer before starting TTS — adds seconds of silence.',
        'Endpointing too aggressively, cutting candidates off during natural thinking pauses.',
        'Not cancelling LLM/TTS on interruption, so you pay for and send audio no one hears.',
        'Keeping the transcript only in memory — a crashed instance loses the whole interview.',
        'Follow-up trap: "How do you stop prompt injection from the candidate?" Treat transcribed speech as untrusted user input: keep instructions in the system prompt, never let the model call sensitive tools based only on what the caller says, and validate any structured output before acting on it.',
      ],
      takeaway: 'Stream every stage, start speaking early, cancel on interruption, and persist the transcript as you go.',
    },
    {
      id: 'zoho-workspace-provisioning',
      title: 'Lead → Deal Won → Provision Workspace (Idempotency and Retries)',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'A deal-won event triggers a multi-step provisioning job that must be idempotent, retry safely, and write results back to Zoho.',
      what: `The business flow:
1. A visitor signs up → your backend **upserts a lead** in Zoho.
2. Sales qualifies and converts it; a **Deal** moves to **Closed Won**.
3. A Zoho workflow webhook tells your backend.
4. Your backend **provisions a tenant workspace**: create the tenant record, admin user, default settings, maybe a subdomain and a Stripe customer, then sends a welcome email.
5. You **write back** to Zoho (for example \`Workspace_URL\`, \`Provisioning_Status\` fields on the deal).

The hard parts are not the steps. They are: **the same event may arrive twice**, **any step may fail halfway**, and **external APIs rate-limit you**.

#### Deeper version
- **Idempotency key**: use the Zoho Deal id. A unique index on \`tenants.zohoDealId\` guarantees one workspace per deal, even if two workers race.
- **Step state machine**: store progress (\`PENDING → TENANT_CREATED → ADMIN_CREATED → EMAIL_SENT → SYNCED\`). On retry, skip finished steps. Each step is itself idempotent (check before create, or use the external API's idempotency key, like Stripe's \`Idempotency-Key\`).
- **Queue with retries**: exponential backoff with jitter, a max attempt count, then a **dead-letter queue** and an alert. Retry only transient errors (timeouts, 429, 5xx); a validation error needs a human.
- **Verify the source**: re-fetch the deal from Zoho and confirm \`Stage\` is still Closed Won before provisioning.
- **Reconciliation job**: periodically list Closed Won deals without a workspace, to catch lost webhooks.
- **Outbox pattern** (advanced): write "send welcome email" as a row in the same DB transaction as the state change, and let a worker deliver it, so you never email without a workspace or vice versa.`,
      why: `Provisioning twice creates duplicate tenants and double billing; failing silently means a paying customer with no account. Idempotency plus retries makes the flow both safe and reliable.`,
      analogy: `It is like a restaurant kitchen ticket system. Each order has one ticket number (deal id). If the waiter shouts the same order twice, the chef checks the ticket and does not cook it again. If the oven fails, the ticket stays on the rail with "starter done, main pending" so the next chef continues from there.`,
      code: [
        {
          title: 'Idempotent, resumable provisioning worker',
          lang: 'javascript',
          code: `// BullMQ-style worker. Queue added with jobId = 'deal-<id>' to dedupe,
// and attempts: 6, backoff: { type: 'exponential', delay: 5000 }.
async function provisionWorker(job) {
  const { dealId } = job.data;

  // 1) Verify with the source of truth
  const deal = await zoho.getRecord('Deals', dealId);
  if (deal.Stage !== 'Closed Won') return 'skipped: not won';

  // 2) Create-or-get the tenant (unique index on zohoDealId makes this race-safe)
  let tenant = await Tenant.findOneAndUpdate(
    { zohoDealId: dealId },
    { $setOnInsert: { name: deal.Account_Name?.name || deal.Deal_Name, step: 'PENDING' } },
    { upsert: true, new: true },
  );

  // 3) Each step runs only if not done yet
  if (tenant.step === 'PENDING') {
    await createDefaultSettings(tenant.id);                 // idempotent: upserts
    tenant = await Tenant.findByIdAndUpdate(tenant.id, { step: 'TENANT_CREATED' }, { new: true });
  }
  if (tenant.step === 'TENANT_CREATED') {
    await createAdminUserIfMissing(tenant.id, deal.Contact_Name);
    tenant = await Tenant.findByIdAndUpdate(tenant.id, { step: 'ADMIN_CREATED' }, { new: true });
  }
  if (tenant.step === 'ADMIN_CREATED') {
    await emailQueue.add('welcome', { tenantId: tenant.id }, { jobId: \`welcome-\${tenant.id}\` });
    tenant = await Tenant.findByIdAndUpdate(tenant.id, { step: 'EMAIL_SENT' }, { new: true });
  }
  if (tenant.step === 'EMAIL_SENT') {
    await zoho.updateRecord('Deals', dealId, {
      Workspace_URL: \`https://\${tenant.slug}.myapp.com\`,
      Provisioning_Status: 'Done',
    });
    await Tenant.findByIdAndUpdate(tenant.id, { step: 'SYNCED' });
  }
  return 'provisioned';
}`,
        },
      ],
      output: `First delivery: the deal is Closed Won, the tenant is created, settings and admin are added, the welcome email job is queued, and Zoho gets the workspace URL. Final step \`SYNCED\`.

If the Zoho update fails with a 429, the job throws and BullMQ retries it later. On retry, the tenant already exists with step \`EMAIL_SENT\`, so it skips straight to the Zoho update — no second admin or second email. If Zoho sends the webhook twice, the second job either has the same \`jobId\` (deduped) or finds the existing tenant and steps.`,
      questions: [
        {
          q: 'How do you make provisioning idempotent?',
          a: 'Use the deal id as an idempotency key with a unique index, store per-step progress, make each step check-before-create, and dedupe queue jobs by id.',
        },
        {
          q: 'Which errors should be retried?',
          a: 'Transient ones: timeouts, network errors, 429 and 5xx. Validation or permission errors will fail again, so send them to a dead-letter queue and alert a human.',
        },
        {
          q: 'What if the webhook never arrives?',
          a: 'A scheduled reconciliation job queries Zoho for Closed Won deals without a workspace and queues them.',
        },
        {
          q: 'Why re-fetch the deal instead of trusting the webhook?',
          a: 'The webhook could be forged, stale or out of order (the deal may have been moved back). The Zoho API is the source of truth.',
        },
        {
          q: 'What is the outbox pattern?',
          a: 'You write the side effect (like "send email") into an outbox table in the same DB transaction as the state change; a worker sends it later. This avoids "DB updated but message lost" or the reverse.',
        },
      ],
      spoken: `"Our flow was: sign-up upserts a lead in Zoho, sales converts it, and when the deal hits Closed Won a workflow webhook calls our backend. The webhook only validates a secret and queues a job keyed by the deal id. The worker re-fetches the deal to confirm it is still won, then creates or gets the tenant using a unique index on the deal id, and walks through steps stored in the database so a retry resumes where it stopped. Transient errors retry with backoff, permanent ones go to a dead-letter queue, and a nightly reconciliation catches missed webhooks. Finally we write the workspace URL back to the Zoho deal."`,
      mistakes: [
        'Provisioning directly inside the webhook request — a timeout or retry creates a second workspace.',
        'Using "check then insert" without a unique index; two concurrent jobs both see "not found" and both create.',
        'Retrying every error forever, including bad data, which only spams logs and APIs.',
        'Follow-up trap: "What if the deal is moved back from Closed Won after provisioning?" Decide a business rule: usually do not auto-delete; mark the workspace suspended or flag it for review, because deleting customer data automatically is dangerous.',
      ],
      takeaway: 'Deal id as idempotency key, resumable steps, retries only for transient errors, reconciliation for missed events.',
    },
    {
      id: 'recording-basics',
      title: 'Recording Basics: Jitsi (Jibri / JaaS) and Twilio Calls',
      level: 'advanced',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Jitsi records via Jibri (self-hosted) or JaaS recording + webhook; Twilio records calls with record options and recording callbacks. Always handle consent and storage.',
      what: `**Recording** saves the interview so others can review it later.

**Jitsi:**
- **Self-hosted**: a separate service called **Jibri** joins the meeting as a hidden participant using a headless Chrome, captures the screen and audio with ffmpeg, and saves an MP4. One Jibri instance handles **one** recording at a time, so you need a pool for parallel interviews.
- **JaaS**: enable the recording feature (in the JWT \`context.features.recording\`), start it from the UI or the IFrame API, and receive a **webhook** when the file is ready with a download link that expires.
- From the IFrame API: \`api.executeCommand('startRecording', { mode: 'file' })\` and \`api.executeCommand('stopRecording', 'file')\`, and listen to \`recordingStatusChanged\`.

**Twilio:** set \`record: true\` on \`calls.create\`, or use TwiML recording verbs, and pass a \`recordingStatusCallback\` to know when the recording file is ready.

#### Deeper version
- **Consent**: tell participants they are being recorded (an announcement or on-screen notice). Laws differ by country and state; some require all parties to agree.
- **Storage**: download provider recordings into your own storage (for example S3 with encryption), then delete them from the provider if your policy requires it. Serve them with short-lived signed URLs, and set a retention period.
- **Processing**: after the recording is ready, a background job can transcribe and summarize it for the hiring team.
- Exact JaaS webhook event names and payloads, and IFrame command options, can change between versions — check the current docs when you implement it.`,
      why: `Hiring teams want to review interviews, resolve disputes and calibrate interviewers. Recordings also feed AI summaries. But recordings are sensitive personal data, so storage and consent matter as much as the code.`,
      analogy: `Jibri is a camera operator who quietly sits in the meeting room and films the screen. They can only film one room at a time, so for five parallel interviews you need five camera operators.`,
      code: [
        {
          title: 'Start/stop Jitsi recording from your UI',
          lang: 'javascript',
          code: `// Only the moderator (interviewer) with recording enabled can do this
function startRecording(api) {
  api.executeCommand('startRecording', { mode: 'file' });
}
function stopRecording(api) {
  api.executeCommand('stopRecording', 'file');
}
api.addListener('recordingStatusChanged', ({ on, mode, error }) => {
  console.log('Recording', on ? 'started' : 'stopped', mode, error || '');
  socket.emit('interview:recording', { interviewId, on }); // show a badge to everyone
});`,
        },
        {
          title: 'Twilio call recording + callback',
          lang: 'javascript',
          code: `await client.calls.create({
  to: candidate.phone,
  from: process.env.TWILIO_NUMBER,
  url: 'https://api.myapp.com/twilio/interview',
  record: true,
  recordingStatusCallback: 'https://api.myapp.com/twilio/recording',
  recordingStatusCallbackEvent: ['completed'],
});

app.post('/twilio/recording', async (req, res) => {
  const { RecordingSid, RecordingUrl, CallSid, RecordingStatus } = req.body;
  res.sendStatus(204);
  if (RecordingStatus === 'completed') {
    // Copy into our own encrypted bucket, then process in the background
    await recordingQueue.add('archive', { RecordingSid, RecordingUrl, CallSid }, { jobId: RecordingSid });
  }
});`,
        },
      ],
      output: `In the Jitsi example, when the interviewer clicks "Record", the recording starts and \`recordingStatusChanged\` fires with \`on: true\`; your app tells everyone with a socket event so a "Recording" badge appears.

In the Twilio example, the whole call is recorded. After the call, \`/twilio/recording\` receives \`RecordingStatus=completed\` with a \`RecordingUrl\`. The job (deduped by \`RecordingSid\`) downloads the file with your Twilio credentials, stores it in S3, and can then transcribe it.`,
      questions: [
        {
          q: 'How does recording work in self-hosted Jitsi?',
          a: 'Jibri joins as a hidden participant using headless Chrome, captures the meeting with ffmpeg into an MP4, and a finalize script can upload it. One Jibri records one meeting at a time.',
        },
        {
          q: 'How do you scale Jitsi recordings?',
          a: 'Run a pool of Jibri instances (one per concurrent recording), or use JaaS, which handles recording infrastructure for you.',
        },
        {
          q: 'How do you get a Twilio call recording?',
          a: 'Enable recording (`record: true` or TwiML), set `recordingStatusCallback`, and when the status is `completed`, download from `RecordingUrl` with your credentials.',
        },
        {
          q: 'What non-code concerns matter for recordings?',
          a: 'Consent and legal rules, encryption at rest, access control with signed URLs, retention and deletion policies.',
        },
      ],
      spoken: `"For Jitsi, recording is done by Jibri when self-hosted — it joins as a hidden participant with headless Chrome and records an MP4 — and since one Jibri handles one recording, you need a pool. With JaaS you enable recording in the JWT features and get a webhook with a temporary download link. For Twilio calls I set record to true with a recordingStatusCallback. In both cases I copy the file into our own encrypted S3 bucket, serve it with signed URLs, apply retention rules, and always announce the recording for consent."`,
      mistakes: [
        'Expecting one Jibri to record several interviews at the same time.',
        'Leaving recordings only on the provider with public or long-lived links.',
        'Not telling candidates they are recorded — a legal risk in many places.',
        'Follow-up trap: "Who can start a recording?" Only a moderator with the recording feature enabled. Control both through the JWT (moderator flag and features) issued by your backend.',
      ],
      takeaway: 'Jibri or JaaS for video, record + recordingStatusCallback for Twilio — then store securely, with consent and retention.',
    },
  ],
  rapidFire: [
    { q: 'Two ways Twilio and your server talk?', a: 'You call the REST API; Twilio calls your webhooks.' },
    { q: 'What prefix does a Call SID have?', a: '`CA`. Account SIDs start with `AC`, messages with `SM`/`MM`.' },
    { q: 'Body format of Twilio webhooks?', a: 'Form-encoded (`application/x-www-form-urlencoded`) by default.' },
    { q: 'What is TwiML?', a: 'XML instructions (verbs) you return to tell Twilio what to do on a call or message.' },
    { q: 'How do you start an outbound call?', a: '`client.calls.create({ to, from, url })`.' },
    { q: 'Where is the inbound call webhook configured?', a: 'On the phone number\'s Voice URL (or a TwiML App).' },
    { q: 'Phone number format Twilio expects?', a: 'E.164, like `+919812345678`.' },
    { q: 'What does <Gather> post to its action URL?', a: '`SpeechResult` and `Confidence` for speech, `Digits` for keypresses.' },
    { q: 'What happens if <Gather> gets no input?', a: 'Twilio skips the action and runs the next verb after Gather.' },
    { q: 'How do you hang up a live call from code?', a: '`client.calls(sid).update({ status: \'completed\' })`.' },
    { q: 'statusCallbackEvent options?', a: '`initiated`, `ringing`, `answered`, `completed`.' },
    { q: 'Final call statuses?', a: '`completed`, `busy`, `no-answer`, `failed`, `canceled`.' },
    { q: 'Why make status handlers idempotent?', a: 'Webhooks can repeat or arrive out of order.' },
    { q: 'Signature header Twilio sends?', a: '`X-Twilio-Signature`.' },
    { q: 'Signature algorithm?', a: 'HMAC-SHA1 of URL + sorted POST params, keyed by the Auth Token, Base64 encoded.' },
    { q: 'Most common signature validation bug?', a: 'Wrong URL behind a proxy (http vs https or internal host).' },
    { q: 'Send an SMS?', a: '`client.messages.create({ to, from, body })`.' },
    { q: 'Reply to an inbound SMS?', a: 'Return `<Message>` TwiML via `MessagingResponse`.' },
    { q: 'What is an SMS segment?', a: 'A billing unit of ~160 GSM-7 chars (70 with UCS-2/emoji).' },
    { q: 'What is A2P 10DLC?', a: 'US registration for business SMS from 10-digit local numbers.' },
    { q: '<Start><Stream> vs <Connect><Stream>?', a: 'Start = one-way fork, call continues; Connect = bidirectional, call stays in the stream.' },
    { q: 'Media stream audio format?', a: 'μ-law (G.711), 8 kHz, mono, base64.' },
    { q: 'How to pass data to a media stream?', a: '`<Parameter>` inside `<Stream>`; read it from `start.customParameters`.' },
    { q: 'How to stop bot audio on interruption?', a: 'Send a `clear` event with the streamSid.' },
    { q: 'What is a mark message?', a: 'A named marker Twilio echoes back when your audio before it finished playing.' },
    { q: 'Biggest latency win in a voice agent?', a: 'Stream everything and start TTS on the first LLM sentence.' },
    { q: 'Zoho auth header?', a: '`Authorization: Zoho-oauthtoken <access_token>`.' },
    { q: 'Zoho access token lifetime?', a: 'About 1 hour; refresh with the refresh token.' },
    { q: 'What is a Zoho grant token?', a: 'A short-lived one-time code exchanged for access and refresh tokens.' },
    { q: 'What is a Zoho Self Client?', a: 'A server-side client where you generate a grant code in the API Console without a redirect.' },
    { q: 'Why does the Zoho data center matter?', a: 'Accounts and API domains differ (.com, .eu, .in...); tokens only work on the right one.' },
    { q: 'Needed to get a Zoho refresh token?', a: '`access_type=offline` in the authorization request.' },
    { q: 'Mandatory field to create a Zoho Lead?', a: '`Last_Name` by default; layouts can add more.' },
    { q: 'Avoid duplicate leads?', a: 'Upsert with `duplicate_check_fields` like Email.' },
    { q: 'Max records per Zoho insert/upsert call?', a: '100.' },
    { q: 'How does Zoho rate limit?', a: 'API credits per 24 hours (by edition/licenses) plus concurrency; 429 when exceeded.' },
    { q: 'Run workflows for API-created records?', a: 'Pass `trigger: ["workflow"]` (empty array to skip).' },
    { q: 'Secure a Zoho webhook?', a: 'HTTPS, secret header checked in constant time, and re-fetch the record.' },
    { q: 'Idempotency key for provisioning?', a: 'The Zoho Deal id, enforced by a unique index.' },
    { q: 'Catch missed webhooks?', a: 'A scheduled reconciliation job.' },
    { q: 'Embed Jitsi quickly?', a: '`new JitsiMeetExternalAPI(domain, { roomName, parentNode, jwt })`.' },
    { q: 'Custom Jitsi UI?', a: 'Use lib-jitsi-meet instead of the IFrame API.' },
    { q: 'Clean up a Jitsi iframe?', a: '`api.dispose()` in the useEffect cleanup.' },
    { q: 'Key Jitsi JWT claims?', a: '`aud`, `iss`, `sub`, `room`, `exp`, `context.user`.' },
    { q: 'JaaS JWT algorithm?', a: 'RS256 with a `kid` header; self-hosted is usually HS256.' },
    { q: 'JaaS room name format?', a: '`<AppID>/<room>`.' },
    { q: 'Jitsi internal signalling protocol?', a: 'XMPP via Prosody.' },
    { q: 'What is Jicofo?', a: 'The conference focus that manages rooms and picks a videobridge.' },
    { q: 'What is Jitsi Videobridge?', a: 'An SFU that forwards media streams between participants.' },
    { q: 'What records Jitsi meetings?', a: 'Jibri — one instance per concurrent recording.' },
    { q: 'Why your own WebSocket signalling with Jitsi?', a: 'For business events: schedule, waiting room, admit, presence, attendance.' },
    { q: 'Scale Socket.IO across servers?', a: 'Redis adapter (plus sticky sessions for polling).' },
    { q: 'STUN vs TURN?', a: 'STUN finds your public address; TURN relays media when direct fails.' },
    { q: 'Common cause of black video when self-hosting?', a: 'UDP 10000 blocked or wrong public IP on the videobridge; no TURN.' },
    { q: 'Twilio "application error" on a call?', a: 'Check the Twilio Debugger: timeout, non-2xx or invalid TwiML.' },
  ],
};
