// Interview problems for the Firebase stack.
// See CONTENT_GUIDE.md ("Interview problems") for the format.

export default {
  stackId: 'firebase',
  problems: [
    {
      id: 'firestore-composite-index-error',
      title: 'Debug: "The query requires an index"',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'firestore-queries-indexes',
      question: `This query worked while it had only the \`where\`. After adding \`orderBy\`, the page shows no orders and the console prints an error.

\`\`\`javascript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'orders'),
  where('userId', '==', uid),
  orderBy('createdAt', 'desc'),
  limit(20)
);
const snap = await getDocs(q);
\`\`\`

\`\`\`text
FirebaseError: [code=failed-precondition]: The query requires an index.
You can create it here: https://console.firebase.google.com/v1/r/project/my-app/firestore/indexes?create_composite=...
\`\`\`

Why does this happen, and how do you fix it properly (so it also works in staging and production)?`,
      hints: [
        'Firestore creates single-field indexes automatically. Which kind of index does a query on two different fields need?',
        'The error message contains a link that pre-fills the index for you.',
        'For all environments, keep indexes in `firestore.indexes.json` and deploy them with the Firebase CLI.',
      ],
      solution: `**Idea:** Firestore only runs queries that an index can answer directly. Equality on \`userId\` + sort on \`createdAt\` touches **two fields**, so it needs a **composite index** (an index on both fields together). Firestore does not create those automatically.

**Quick fix:** click the link in the error. It opens the console with the index pre-filled. Building takes a few minutes.

**Proper fix:** keep indexes in code.

\`\`\`json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
\`\`\`

\`\`\`bash
# firestore.indexes.json is referenced in firebase.json
firebase deploy --only firestore:indexes --project my-app-staging
firebase deploy --only firestore:indexes --project my-app-prod

# Pull indexes you created by clicking in the console back into the file
firebase firestore:indexes > firestore.indexes.json
\`\`\`

Also catch the error in the UI instead of showing an empty list:

\`\`\`javascript
try {
  const snap = await getDocs(q);
} catch (err) {
  if (err.code === 'failed-precondition') console.error('Missing index:', err.message);
  throw err;
}
\`\`\`

**Why it works:** the composite index stores entries sorted by \`userId\` and then \`createdAt\`. Firestore jumps to this user's entries and reads them already in order. That is why Firestore queries stay fast no matter how big the collection is.

**Edge cases:**
- The field order and direction matter. \`createdAt desc\` and \`createdAt asc\` may need different indexes.
- Documents **without** the \`createdAt\` field are not in the index, so they never show up in an \`orderBy('createdAt')\` query.
- The Emulator does not enforce indexes, so this bug often appears only after deploy.`,
      followUps: [
        {
          q: 'Which queries need a composite index?',
          a: 'Ones that combine fields: equality on one field + orderBy/range on another, range filters on several fields, or `array-contains` with orderBy. A query on a single field uses the automatic index.',
        },
        {
          q: 'Do indexes cost money?',
          a: 'Yes, a little: they take storage, and every write updates each index the doc is in. Remove unused indexes and use field overrides to skip indexing big fields you never query (like long text).',
        },
      ],
    },
    {
      id: 'firestore-rules-test-mode-left-on',
      title: 'Debug: the security rules allow everything',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'very common',
      relatedTopic: 'security-rules',
      question: `A security review of your app found that anyone with your Firebase config (it is public in the JS bundle) can read and delete **every** user's data. These are the deployed rules:

\`\`\`text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 12, 1);
    }
  }
}
\`\`\`

1. What is wrong?
2. Write rules for these collections: \`users/{uid}\` (only the owner), \`posts/{postId}\` (anyone logged in can read, only the author can create/edit/delete).`,
      hints: [
        'These are the "test mode" rules the console offers when you create a database. What do they check?',
        '`match /{document=**}` matches every document in the database.',
        'Use `request.auth.uid` (who is calling), `resource.data` (the doc as stored) and `request.resource.data` (the doc after the write).',
      ],
      solution: `**What is wrong:** these are **test-mode** rules. They only check the date, not **who** is asking. Until the date, anyone on the internet can read and write every document. The Firebase config in your bundle is not a secret. It only says which project to talk to. **Rules are the only real protection** for client-side access.

**Fixed rules:**

\`\`\`text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    // users/{uid}: only the owner
    match /users/{uid} {
      allow read, write: if signedIn() && request.auth.uid == uid;
    }

    // posts: any signed-in user reads, only the author writes
    match /posts/{postId} {
      allow read: if signedIn();

      // new post: the authorId in the data must be the caller
      allow create: if signedIn()
        && request.resource.data.authorId == request.auth.uid;

      // edit: must own it now AND cannot change the author
      allow update: if signedIn()
        && resource.data.authorId == request.auth.uid
        && request.resource.data.authorId == resource.data.authorId;

      allow delete: if signedIn() && resource.data.authorId == request.auth.uid;
    }

    // Everything else is denied by default (no match = no access)
  }
}
\`\`\`

**Why it works:** rules run on Google's servers for every client request. No match means "deny", so new collections are private until you write a rule. Checking \`request.resource.data.authorId\` stops a user from creating a post in someone else's name.

**How to check it:**
- Test with the **Emulator** and \`@firebase/rules-unit-testing\` (write tests: "user A cannot read user B").
- Use the **Rules Playground** in the console for quick checks.
- Deploy rules from git with \`firebase deploy --only firestore:rules\`, never by editing in the console.

**Edge case:** the **Admin SDK** (your server, Cloud Functions) ignores rules completely. Rules only protect client access.`,
      followUps: [
        {
          q: 'Should I hide the Firebase config to be safe?',
          a: 'No, you cannot hide it (the browser needs it). Security comes from rules and App Check. App Check also makes it harder for scripts that are not your app to call your backend.',
        },
        {
          q: 'Are Firestore rules filters?',
          a: 'No. If a query could return a document the user may not read, the whole query fails. The query must include the same condition, e.g. `where(\'authorId\', \'==\', uid)` when rules only allow own docs.',
        },
      ],
    },
    {
      id: 'onsnapshot-listener-leak',
      title: 'Debug: Firestore reads exploded after adding live updates',
      difficulty: 'easy',
      type: 'debug',
      frequency: 'common',
      relatedTopic: 'realtime-listeners',
      question: `After this component shipped, the Firestore bill went up 20x. Users also see the same notification two or three times, and the list keeps growing. Find the bugs.

\`\`\`jsx
function Notifications({ userId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    onSnapshot(q, (snap) => {
      snap.docs.forEach((d) => setItems((prev) => [...prev, d.data()]));
    });
  });

  return <List items={items} />;
}
\`\`\``,
      hints: [
        'The effect has no dependency array. How often does it run?',
        '`onSnapshot` returns something. What is it for?',
        'Each snapshot contains ALL matching documents, not only the new ones. What happens when you append them to the old list?',
      ],
      solution: `**Idea:** three bugs.

1. **No dependency array:** the effect runs after **every** render. Each run adds a new listener. Each listener re-reads the documents, so reads multiply.
2. **No unsubscribe:** \`onSnapshot\` returns an \`unsubscribe\` function. Without calling it in the cleanup, listeners keep running after the component unmounts or the user changes. That costs reads and memory.
3. **Appending the full snapshot:** every snapshot has the full result set, so appending creates duplicates. Replace the state instead.

Also add a \`limit\`: a user with 5,000 old notifications should not read all of them.

\`\`\`jsx
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

function Notifications({ userId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(30)                                   // only what the UI shows
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        // replace, do not append: the snapshot is the full current result
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error('notifications listener failed', err)
    );

    return unsubscribe;                           // stop listening on unmount / user change
  }, [userId]);                                   // re-subscribe only when the user changes

  return <List items={items} />;
}
\`\`\`

**Why it works:** there is exactly one listener per \`userId\`. When the component unmounts or the user changes, the old one stops. Each snapshot replaces the list, so no duplicates.

**Cost note:** a listener reads all matching docs once when it starts, and after that only the changed docs. That is cheap with one listener, and expensive with hundreds of leaked ones.`,
      followUps: [
        {
          q: 'How do you get only the changes in a snapshot?',
          a: 'Use `snap.docChanges()`. Each change has a `type` (`added`, `modified`, `removed`) and the doc. Useful for showing a toast only for new items.',
        },
        {
          q: 'How would you find leaked listeners in a big app?',
          a: 'Check the Firestore usage tab for read spikes, log in a custom `useFirestoreQuery` hook when listeners start and stop, and make that hook the only place that calls onSnapshot.',
        },
      ],
    },
    {
      id: 'rules-owner-and-admin-claims',
      title: 'Rules: users edit only their own profile, admins via custom claims',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'security-rules',
      question: `Profiles live in \`users/{uid}\` with fields \`name\`, \`photoUrl\`, \`bio\`, \`plan\` and \`role\`.

Requirements:
- A user can read and update **only their own** profile.
- A user must **not** be able to change \`role\` or \`plan\` (those decide what they can do and what they pay).
- **Admins** can read and update any profile, including \`role\` and \`plan\`.

1. How do you mark a user as admin in a way the user cannot fake?
2. Write the Firestore rules.`,
      hints: [
        'A `role: \'admin\'` field in the user\'s own doc is risky: if the rule has a hole, the user edits it. **Custom claims** live inside the signed ID token and can only be set with the Admin SDK.',
        'In rules, custom claims appear as `request.auth.token.admin`.',
        'To block changes to some fields: `request.resource.data.diff(resource.data).affectedKeys().hasAny([...])`.',
      ],
      solution: `**Idea:** put the admin flag in a **custom claim** (set only by your server). In rules, owners may update only "safe" fields. Admins may do anything.

**1. Make someone admin (server / Cloud Function / script):**

\`\`\`javascript
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

initializeApp();

async function makeAdmin(uid) {
  // Claims are stored in the user record and copied into every new ID token
  await getAuth().setCustomUserClaims(uid, { admin: true });
}
\`\`\`

The user gets the claim the next time their ID token refreshes (within about an hour). To make it apply now, the client calls \`await auth.currentUser.getIdToken(true)\` (force refresh).

**2. Rules:**

\`\`\`text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    // true if the write tries to change any protected field
    function touchesProtectedFields() {
      return request.resource.data.diff(resource.data)
        .affectedKeys()
        .hasAny(['role', 'plan']);
    }

    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();

      // creating your own profile: no role/plan allowed from the client
      allow create: if isOwner(uid)
        && !request.resource.data.keys().hasAny(['role', 'plan']);

      allow update: if isAdmin()
        || (isOwner(uid) && !touchesProtectedFields());

      allow delete: if isAdmin();
    }
  }
}
\`\`\`

**Why it works:**
- The ID token is **signed by Firebase**. The client cannot add \`admin: true\` to it. Only the Admin SDK can.
- \`diff().affectedKeys()\` lists the fields that are added, removed or changed by this write. If \`role\` or \`plan\` is among them, the owner's update is rejected.
- Set \`plan\` from your Stripe webhook using the Admin SDK (which skips rules), so only real payments change it.

**Edge cases:**
- Custom claims are limited to **1000 bytes**. Store flags and short roles, not permission lists.
- Removing admin rights is not instant. Old tokens keep the claim until they expire (up to 1 hour). For instant removal, also revoke refresh tokens (\`getAuth().revokeRefreshTokens(uid)\`) and check revocation on your server.
- Do not add size/type validation for \`name\` and \`bio\` only in the frontend. Add it in rules too (for example \`request.resource.data.bio.size() < 500\`).`,
      followUps: [
        {
          q: 'How would you show the admin menu in React?',
          a: 'Read the claim on the client: `const { claims } = await user.getIdTokenResult(); if (claims.admin) ...`. This is only for UI. Rules and server checks are the real security.',
        },
        {
          q: 'Claims vs a roles collection checked with get() in rules?',
          a: 'Claims cost nothing to check and are tamper-proof, but update slowly and are small. A `roles/{uid}` doc read with `get()` updates instantly and can hold more data, but each check costs a document read.',
        },
      ],
    },
    {
      id: 'transaction-prevent-double-booking',
      title: 'Prevent double booking of an interview slot (transaction)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'transactions-batched-writes',
      question: `Candidates book 30-minute interview slots with an interviewer. Two candidates clicked "Book" on the same slot at the same second, and **both** got a confirmation. The current code:

\`\`\`javascript
const slotRef = doc(db, 'slots', slotId);
const snap = await getDoc(slotRef);
if (snap.data().bookedBy) throw new Error('Slot already booked');
await updateDoc(slotRef, { bookedBy: uid, bookedAt: serverTimestamp() });
\`\`\`

1. Why does this allow double booking?
2. Fix it with a Firestore transaction (modular SDK).
3. Separately: how would you safely keep a \`bookingsCount\` on the interviewer doc?`,
      hints: [
        'Between `getDoc` and `updateDoc`, another client can do the same read. This is a "check-then-act" race.',
        'In `runTransaction(db, async (tx) => ...)`, read with `tx.get` and write with `tx.update`. Firestore retries the function if the doc changed meanwhile.',
        'For a simple counter you do not even need a transaction: `increment(1)`.',
      ],
      solution: `**Idea:** the read and the write must be one atomic unit. A transaction does that: if another client changes the slot after you read it, Firestore throws away your attempt and re-runs your function with fresh data.

\`\`\`javascript
import {
  doc, runTransaction, serverTimestamp, increment,
} from 'firebase/firestore';

async function bookSlot(db, slotId, uid) {
  const slotRef = doc(db, 'slots', slotId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(slotRef);           // all reads first
    if (!snap.exists()) throw new Error('Slot not found');

    const slot = snap.data();
    if (slot.bookedBy) throw new Error('Slot already booked');

    tx.update(slotRef, { bookedBy: uid, bookedAt: serverTimestamp() });

    // counter on the interviewer, in the same atomic unit
    const interviewerRef = doc(db, 'interviewers', slot.interviewerId);
    tx.update(interviewerRef, { bookingsCount: increment(1) });
  });
}

// UI
try {
  await bookSlot(db, slotId, user.uid);
  showToast('Booked!');
} catch (err) {
  showToast(err.message === 'Slot already booked' ? 'Sorry, someone just took this slot.' : 'Booking failed, try again.');
}
\`\`\`

**Why it works:** Firestore tracks the documents you read in the transaction. At commit time, if \`slotRef\` changed since you read it, the commit fails and the function runs again. The second candidate's retry now sees \`bookedBy\` set and throws. Only one booking wins.

**3. The counter:** \`increment(1)\` is applied **on the server** atomically, so two parallel increments give +2, never +1. Outside a transaction you can just call \`updateDoc(ref, { bookingsCount: increment(1) })\`.

**Edge cases:**
- Back it up with **rules**, because a client could skip your function: allow the update only if \`resource.data.bookedBy == null\` and \`request.resource.data.bookedBy == request.auth.uid\`.
- The function can run **more than once**, so no side effects inside it (no emails, no \`setState\`). Do those after it resolves.
- Client transactions need a network connection. They fail when offline.
- A counter doc can handle only about **1 sustained write per second**. For very hot counters, use a **distributed counter** (N shard docs, sum them when reading).`,
      followUps: [
        {
          q: 'Transaction vs batched write?',
          a: 'A batch groups writes so they all succeed or all fail, but it cannot read. Use a transaction when the write depends on a read (like "only if not booked").',
        },
        {
          q: 'How would you also stop one candidate from booking two slots?',
          a: 'Inside the same transaction, read a `candidates/{uid}` doc with an `activeBookingId` field. Throw if it is set, else set it together with the slot. Both docs are then protected by the same transaction.',
        },
      ],
    },
    {
      id: 'cloud-function-create-profile',
      title: 'Cloud Function: create a profile when a user signs up',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'cloud-functions',
      question: `Right now the React app creates \`users/{uid}\` after sign-up. Sometimes the tab closes right after sign-up and the profile is never created, which breaks other screens. Also users could put anything in that doc.

Move profile creation to the server: write a Cloud Function that runs when a Firebase Auth user is created and writes:

\`\`\`text
users/{uid}: { email, name, photoUrl, plan: 'free', role: 'user', createdAt }
\`\`\`

It must be safe if the function runs twice for the same user.`,
      hints: [
        'Auth "user created" triggers exist in the 1st-gen API: `functions.auth.user().onCreate(...)`. In recent `firebase-functions` versions you import them from `firebase-functions/v1`.',
        'Use the Admin SDK (`firebase-admin/firestore`) to write. It bypasses security rules.',
        'Background functions are delivered "at least once". Use `create()` (fails if the doc exists) or `set(..., { merge: true })` so a second run does no harm.',
      ],
      solution: `**Idea:** let the Auth trigger create the profile on the server. It runs even if the browser closes. Use \`create()\` so a duplicate run does nothing.

\`\`\`javascript
// functions/index.js
const functions = require('firebase-functions/v1');   // Auth triggers are 1st-gen
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  const ref = db.doc('users/' + user.uid);

  try {
    // create() fails with ALREADY_EXISTS if the doc is there: safe on retries
    await ref.create({
      email: user.email || null,           // phone-only users have no email
      name: user.displayName || '',
      photoUrl: user.photoURL || null,
      plan: 'free',
      role: 'user',
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    if (err.code === 6) return;            // 6 = ALREADY_EXISTS (gRPC code)
    throw err;                             // real error: let it fail and show in logs
  }
});
\`\`\`

\`\`\`bash
firebase deploy --only functions:createUserProfile
\`\`\`

**Frontend change:** after sign-up, do not create the doc. Listen for it instead (it appears within a second or two):

\`\`\`javascript
const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
  if (snap.exists()) { setProfile(snap.data()); unsub(); }
});
\`\`\`

**Why it works:** the trigger is fired by Firebase itself, not by the browser, so it always runs. The Admin SDK writes \`role\` and \`plan\`, and your rules can now forbid clients from writing those fields. \`create()\` makes it idempotent.

**Edge cases:**
- \`displayName\` is often empty for email/password sign-ups (you set it after with \`updateProfile\`). Let the user fill it in later.
- Add a matching \`functions.auth.user().onDelete\` to clean up the profile and the user's files.
- **Cold starts:** the first run after a quiet period can take a few seconds. The UI should show a loading state, not an error.`,
      followUps: [
        {
          q: 'What about 2nd-gen functions?',
          a: '2nd gen has **blocking** Auth functions (`beforeUserCreated`, `beforeUserSignedIn` from `firebase-functions/v2/identity`). They run before the account is created, so you can reject sign-ups (e.g. wrong email domain) or set custom claims. They need Identity Platform enabled.',
        },
        {
          q: 'Why not just use set() instead of create()?',
          a: '`set()` would overwrite the profile on a retry. If the user had already changed their name, it would be reset. `set(data, { merge: true })` is OK for fields you always want to set, but `create()` states the intent best.',
        },
      ],
    },
    {
      id: 'fcm-send-to-user-devices',
      title: 'Send a push notification to all of a user\'s devices (FCM + Admin SDK)',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'fcm-push-notifications',
      question: `When an interviewer sends a message, the candidate should get a push notification on **every** device where they are logged in (laptop browser, phone).

1. Where and how do you store device tokens?
2. Write a Node function \`notifyUser(uid, { title, body, chatId })\` using the Firebase Admin SDK.
3. Tokens go stale (user uninstalls the app, clears browser data). Handle that.`,
      hints: [
        'Store tokens in a subcollection like `users/{uid}/fcmTokens/{token}`. Using the token as the doc id avoids duplicates.',
        'Use `getMessaging().sendEachForMulticast({ tokens, notification, data })`. It returns one result per token.',
        'Delete tokens whose error code is `messaging/registration-token-not-registered` or `messaging/invalid-registration-token`.',
      ],
      solution: `**Idea:** save one doc per device token. To notify, load all tokens of the user, send one multicast, then delete the tokens FCM says are dead.

**1. Client saves its token (web):**

\`\`\`javascript
import { getMessaging, getToken } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

async function registerDevice(uid) {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const token = await getToken(getMessaging(), { vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY });
  // token as doc id: registering twice does not create duplicates
  await setDoc(doc(db, 'users', uid, 'fcmTokens', token), {
    platform: 'web',
    updatedAt: serverTimestamp(),
  });
}
\`\`\`

**2 + 3. Server sends and cleans up:**

\`\`\`javascript
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

async function notifyUser(uid, { title, body, chatId }) {
  const db = getFirestore();
  const tokensSnap = await db.collection('users/' + uid + '/fcmTokens').get();
  const tokens = tokensSnap.docs.map((d) => d.id);
  if (!tokens.length) return { sent: 0 };

  // max 500 tokens per multicast call
  const res = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: { chatId: String(chatId), type: 'chat_message' }, // data values MUST be strings
    webpush: { fcmOptions: { link: '/chats/' + chatId } },   // click opens the chat
  });

  // responses[i] belongs to tokens[i]
  const deletes = [];
  res.responses.forEach((r, i) => {
    if (!r.success && DEAD_TOKEN_CODES.has(r.error.code)) {
      deletes.push(db.doc('users/' + uid + '/fcmTokens/' + tokens[i]).delete());
    }
  });
  await Promise.all(deletes);

  return { sent: res.successCount, failed: res.failureCount, removed: deletes.length };
}
\`\`\`

**Why it works:** each device has its own token, so sending to all tokens reaches all devices. The results array is in the same order as \`tokens\`, so you know exactly which token failed. Removing dead tokens keeps the list clean and the sends fast.

**Edge cases:**
- Tokens can change. Call \`getToken\` on every app start and save it again (\`updatedAt\` lets you delete tokens not seen for 60+ days).
- On logout, delete that device's token so the next user on the same device does not get the old user's pushes.
- More than 500 tokens: split into chunks of 500.
- Web push needs a service worker (\`firebase-messaging-sw.js\`) to show notifications when the tab is closed.`,
      followUps: [
        {
          q: 'notification vs data payload?',
          a: '`notification` is shown by the OS/browser automatically when the app is in the background. `data` is only key-value strings for your code to handle (e.g. open the right chat). Often you send both.',
        },
        {
          q: 'How would you send to 100,000 users about a new feature?',
          a: 'Use **topics**: clients subscribe to a topic like `product-news`, and the server sends one message `{ topic: \'product-news\', notification }`. No need to load 100,000 tokens.',
        },
      ],
    },
    {
      id: 'realtime-chat-pagination',
      title: 'Realtime chat: live latest messages + "load older" pagination',
      difficulty: 'medium',
      type: 'coding',
      frequency: 'very common',
      relatedTopic: 'realtime-listeners',
      question: `Build the message list for a chat screen. Messages are in \`chats/{chatId}/messages\` with \`text\`, \`senderId\`, \`createdAt\` (server timestamp).

- Show the latest 25 messages **live** (new ones appear instantly).
- A "Load older" button loads 25 more older messages each time.
- Do not re-read the whole chat history on every new message.

Write a React hook \`useChatMessages(chatId)\` with the modular Firebase SDK.`,
      hints: [
        'Newest page: `query(..., orderBy(\'createdAt\', \'desc\'), limit(25))`. Reverse it for display (oldest at the top).',
        'Older pages do not need to be live. Use `getDocs` with `startAfter(oldestDocYouHave)`. For the live part, think about a query from that oldest doc up to now (`endAt`), so nothing falls out of the window.',
        'A message you just sent has `createdAt: null` locally until the server sets it. Use `snap.data({ serverTimestamps: \'estimate\' })`.',
      ],
      solution: `**Idea:** load the newest page once to find an **anchor** (the oldest message on screen). Then keep one live listener on "everything from the anchor up to now". Older pages are one-time reads using a cursor (\`startAfter\`).

\`\`\`javascript
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  collection, query, orderBy, limit, startAfter, endAt, onSnapshot, getDocs,
} from 'firebase/firestore';

const PAGE = 25;

function toMessage(d) {
  // 'estimate': my own pending message shows a local time instead of null
  return { id: d.id, ...d.data({ serverTimestamps: 'estimate' }) };
}

export function useChatMessages(chatId) {
  const [live, setLive] = useState([]);    // anchor..newest, newest first
  const [older, setOlder] = useState([]);  // older pages, newest first
  const [hasMore, setHasMore] = useState(false);
  const oldestRef = useRef(null);          // cursor: oldest doc loaded so far

  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;
    setLive([]); setOlder([]); setHasMore(false); oldestRef.current = null;

    const base = collection(db, 'chats', chatId, 'messages');

    (async () => {
      // 1. Newest page, read once, to find the anchor
      const first = await getDocs(query(base, orderBy('createdAt', 'desc'), limit(PAGE)));
      if (cancelled) return;
      const anchor = first.docs[first.docs.length - 1] || null;
      oldestRef.current = anchor;
      setHasMore(first.docs.length === PAGE);

      // 2. Live: from the newest message down to the anchor (no limit),
      //    so the window grows with new messages and never drops old ones
      const liveQuery = anchor
        ? query(base, orderBy('createdAt', 'desc'), endAt(anchor))
        : query(base, orderBy('createdAt', 'desc'));   // empty chat: listen to all
      unsub = onSnapshot(liveQuery, (snap) => setLive(snap.docs.map(toMessage)));
    })();

    return () => { cancelled = true; unsub(); };
  }, [chatId]);

  // 3. Older pages: one-time reads with a cursor
  const loadOlder = useCallback(async () => {
    if (!oldestRef.current) return;
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'desc'),
      startAfter(oldestRef.current),   // continue after the oldest doc we have
      limit(PAGE)
    );
    const snap = await getDocs(q);     // old messages rarely change: no listener
    if (snap.docs.length) oldestRef.current = snap.docs[snap.docs.length - 1];
    setHasMore(snap.docs.length === PAGE);
    setOlder((prev) => [...prev, ...snap.docs.map(toMessage)]);
  }, [chatId]);

  // newest-first lists -> oldest at the top for display
  const messages = [...live, ...older].reverse();
  return { messages, loadOlder, hasMore };
}
\`\`\`

**Why it works:**
- The live query is "from the anchor to the newest". A new message is added to it, and nothing falls out. Firestore sends only the change, so you pay about **1 read per new message**, not 25.
- The anchor is also where older pages start, so there are no gaps and no duplicates between \`live\` and \`older\`.
- Older pages use a **cursor** (\`startAfter\`). This is cheap and stable, unlike an offset (Firestore still bills skipped docs).

**Edge cases:**
- Only the automatic single-field index on \`createdAt\` is needed.
- The live listener re-reads the first page once when it starts (about 25 reads). That is fine. Reading the whole history on every message is what we avoid.
- In a very long session the live window grows. You can re-anchor (restart the listener) when it gets above a few hundred messages.
- Keep the scroll position when older messages are added at the top (measure scroll height before and after).
- \`cancelled\` stops a slow first read from starting a listener for a chat the user already left.`,
      followUps: [
        {
          q: 'Why not use offset for pagination?',
          a: 'Firestore has no cheap offset: skipped documents are still read and billed, and results shift when new messages arrive. Cursors (`startAfter(doc)`) are cheaper and stable.',
        },
        {
          q: 'How would you show "unread" counts per chat cheaply?',
          a: 'Store `lastMessageAt` on the chat doc and `lastReadAt` per member (e.g. `chats/{id}/members/{uid}`). Show a dot if `lastMessageAt > lastReadAt`. For exact counts keep a counter updated by a Cloud Function, instead of counting messages on the client.',
        },
      ],
    },
    {
      id: 'rules-chat-members-only',
      title: 'Rules: only chat members read messages, and messages cannot be faked',
      difficulty: 'hard',
      type: 'coding',
      frequency: 'common',
      relatedTopic: 'security-rules',
      question: `Data model:

\`\`\`text
chats/{chatId}                    { memberIds: ['uidA', 'uidB'], lastMessage, lastMessageAt }
chats/{chatId}/messages/{msgId}   { senderId, text, createdAt }
\`\`\`

Write Firestore rules so that:
1. Only members can read a chat and its messages.
2. A member can send a message only as **themselves**, with text of 1-2000 characters, a server timestamp, and no extra fields.
3. Messages cannot be edited or deleted by clients.
4. Members can update \`lastMessage\` / \`lastMessageAt\` on the chat, but cannot add or remove members.

Then: the "My chats" screen runs \`query(collection(db, 'chats'))\` and gets **permission-denied** even though the user is in some chats. Why, and what is the right query?`,
      hints: [
        'Messages are in a subcollection, so the message doc does not know the members. Use `get(/databases/$(database)/documents/chats/$(chatId))` to read the parent chat in the rule.',
        'Validate with `request.resource.data.keys().hasOnly([...])`, `is string`, `.size()` and `== request.time`.',
        'Rules are not filters. The query must only ask for docs the user may read.',
      ],
      solution: `**Idea:** check membership on the chat doc (directly for the chat, with \`get()\` for messages). Validate the shape of every new message. Lock down updates with \`affectedKeys()\`.

\`\`\`text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    // Reads the parent chat doc (counts as 1 document read, cached per request)
    function isMember(chatId) {
      return signedIn() && request.auth.uid in
        get(/databases/$(database)/documents/chats/$(chatId)).data.memberIds;
    }

    match /chats/{chatId} {
      allow read: if signedIn() && request.auth.uid in resource.data.memberIds;

      // Creating a chat: you must be one of the members
      allow create: if signedIn()
        && request.auth.uid in request.resource.data.memberIds
        && request.resource.data.memberIds.size() <= 50;

      // Members may only touch the "last message" preview fields
      allow update: if signedIn()
        && request.auth.uid in resource.data.memberIds
        && request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['lastMessage', 'lastMessageAt']);

      allow delete: if false;

      match /messages/{msgId} {
        allow read: if isMember(chatId);

        allow create: if isMember(chatId)
          && request.resource.data.keys().hasOnly(['senderId', 'text', 'createdAt'])
          && request.resource.data.senderId == request.auth.uid     // no faking the sender
          && request.resource.data.text is string
          && request.resource.data.text.size() > 0
          && request.resource.data.text.size() <= 2000
          && request.resource.data.createdAt == request.time;       // must be serverTimestamp()

        allow update, delete: if false;                              // messages are immutable
      }
    }
  }
}
\`\`\`

The client must send \`createdAt: serverTimestamp()\`. In rules that value equals \`request.time\`, so users cannot backdate messages.

**The "My chats" bug:** rules are **not filters**. Firestore does not quietly drop the chats you may not read. It checks if the query **could** return a forbidden doc, and if so, rejects the whole query. \`query(collection(db, 'chats'))\` could return other people's chats, so it is denied.

Correct query (matches the rule's condition):

\`\`\`javascript
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

const q = query(
  collection(db, 'chats'),
  where('memberIds', 'array-contains', user.uid),
  orderBy('lastMessageAt', 'desc'),   // needs a composite index (array-contains + orderBy)
  limit(30)
);
\`\`\`

**Why it works:** every read and write is checked on the server. \`get()\` connects the subcollection to its parent's members. \`hasOnly\` and the type/size checks mean the client cannot add fields like \`isAdmin\` or send a 5 MB message. \`affectedKeys().hasOnly\` stops members from changing \`memberIds\`.

**Edge cases:**
- Each \`get()\` in a rule counts as a **document read** (billing) and a rule can do at most 10 of them per request (20 for some batch operations). For very hot chats, that adds cost.
- Adding members should go through a Cloud Function (Admin SDK), which can apply your own business rules.
- Test these with the Emulator and \`@firebase/rules-unit-testing\`: "non-member cannot read", "member cannot fake senderId", "cannot change memberIds".`,
      followUps: [
        {
          q: 'Where would you update lastMessage: client or Cloud Function?',
          a: 'A Firestore `onDocumentCreated` trigger on messages is safer: clients cannot write a fake preview, and you can also send push notifications there. The client way is faster (one batch write) but needs the rules above.',
        },
        {
          q: 'How would you let a user delete their own message within 5 minutes?',
          a: '`allow delete: if resource.data.senderId == request.auth.uid && request.time < resource.data.createdAt + duration.value(5, \'m\');`',
        },
      ],
    },
    {
      id: 'chat-data-model-min-reads',
      title: 'Design a Firestore chat data model that keeps reads (cost) low',
      difficulty: 'hard',
      type: 'design',
      frequency: 'common',
      relatedTopic: 'data-modeling-costs',
      question: `You are building 1-to-1 and group chat for a recruiting app (candidates talk to recruiters). Expected: 50,000 daily users, each opens the app ~10 times a day, has ~20 chats, and sends ~30 messages a day.

Design the Firestore data model. The **chat list screen** (all my chats with last message, unread badge, other person's name and photo) must load with as few reads as possible. Estimate the reads, and explain your trade-offs.`,
      hints: [
        'Firestore bills per document read. A chat list that reads each chat AND each other user\'s profile AND counts unread messages is very expensive.',
        'Denormalize: copy the data the list needs (last message, names, photos, unread counts) onto the chat document.',
        'Messages in a subcollection, so loading the list never loads messages.',
      ],
      solution: `**Idea:** design for the screens, not for "clean" data. The chat list should be **one query over chat docs**, and each chat doc carries everything the list row shows (denormalization = copying data where it is read).

#### Model

\`\`\`text
users/{uid}
  { name, photoUrl, ... }

chats/{chatId}
  {
    type: 'direct' | 'group',
    memberIds: ['uidA', 'uidB'],                 // for the array-contains query + rules
    members: {                                   // copied profile data for the list row
      uidA: { name: 'Riya', photoUrl: '...' },
      uidB: { name: 'Arjun (Recruiter)', photoUrl: '...' }
    },
    lastMessage: { text: 'See you at 3', senderId: 'uidB', at: <timestamp> },
    lastMessageAt: <timestamp>,                  // for orderBy
    unread: { uidA: 2, uidB: 0 }                 // per-member counter
  }

chats/{chatId}/messages/{msgId}
  { senderId, text, createdAt, attachments? }
\`\`\`

Direct chat id: \`[uidA, uidB].sort().join('_')\`. Opening a chat with someone is then a single \`getDoc\`, no search, and no duplicate direct chats.

#### Writes (a Cloud Function on message create keeps it consistent)

\`\`\`javascript
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

exports.onMessageCreated = onDocumentCreated('chats/{chatId}/messages/{msgId}', async (event) => {
  const msg = event.data.data();
  const chatRef = getFirestore().doc('chats/' + event.params.chatId);
  const chat = (await chatRef.get()).data();

  const update = {
    lastMessage: { text: msg.text.slice(0, 100), senderId: msg.senderId, at: msg.createdAt },
    lastMessageAt: msg.createdAt,
  };
  // +1 unread for everyone except the sender (dot path updates one map key)
  for (const uid of chat.memberIds) {
    if (uid !== msg.senderId) update['unread.' + uid] = FieldValue.increment(1);
  }
  await chatRef.update(update);
});
\`\`\`

Opening a chat resets your counter: \`updateDoc(chatRef, { ['unread.' + uid]: 0 })\`.

#### Read estimate (chat list)

- **Naive design:** 20 chat docs + 20 profile reads + counting unread messages (say 5 each = 100) = **~140 reads per open**. 50,000 users x 10 opens = **70M reads/day**.
- **This design:** one listener on 20 chat docs = **20 reads per open**, then 1 read per changed chat. ~**10M reads/day**, about 7x cheaper, and much faster (one round trip).
- Better still: with **offline persistence** enabled, a reopened listener can be served partly from the local cache. (Firestore may still bill some reads when it re-syncs with the server, so do not rely on it for the estimate.)

#### Trade-offs

- **Stale copies:** if a user changes their photo, the copies in chats are old. Fix with a Cloud Function on \`users/{uid}\` update that updates their chats (rare event, acceptable cost), or accept slightly old photos.
- **Write cost:** each message = 1 message write + 1 chat update. Writes are fewer than reads here, so it is a good deal.
- **Hot docs:** a busy group chat doc updated on every message hits the ~1 write/sec sustained limit per document. For big groups, update the preview at most every few seconds or drop per-member unread counts.
- **Doc size limit 1 MB:** fine for \`members\` in small chats. For groups with thousands of members, use a \`members\` subcollection instead and keep only a count on the chat.`,
      followUps: [
        {
          q: 'Why not put messages in an array inside the chat doc?',
          a: 'The doc would hit the 1 MB limit, every new message rewrites the whole doc, every listener re-downloads all messages, and you cannot paginate or query them. Subcollections scale without limit.',
        },
        {
          q: 'How would you search old messages by text?',
          a: 'Firestore has no full-text search. Sync messages to a search service (Algolia, Typesense, Elasticsearch, or MongoDB Atlas Search) with a Cloud Function and query that, filtered by chat ids the user belongs to.',
        },
      ],
    },
    {
      id: 'when-to-leave-firebase',
      title: 'Scenario: should we move from Firebase to our own Node/MongoDB backend?',
      difficulty: 'hard',
      type: 'scenario',
      frequency: 'occasional',
      relatedTopic: 'when-to-use-firebase',
      question: `Your startup's app was built on Firebase (Auth, Firestore, Cloud Functions, Storage) by a small team. 18 months later:

- The Firestore bill grew from $50 to $4,000 per month.
- Product now wants reports like "average time-to-hire per company per month" and admin search across all candidates.
- Business logic is spread across security rules, client code and 60 Cloud Functions.
- An enterprise customer asks for data residency in India and a complete audit log.

The CTO asks you: "Should we move to our own Node + MongoDB backend?" What do you answer, and how would you migrate if you do?`,
      hints: [
        'First measure: where does the cost come from? Is it the database model, or a few bad queries / listeners?',
        'Look at each requirement separately: reporting, search, audit log, residency. Which ones does Firebase handle badly?',
        'A migration does not have to be "all or nothing". Which part gives the most value to move first?',
      ],
      solution: `**Idea:** do not answer with an opinion. Look at the data, fix cheap problems first, and if you migrate, do it **step by step**, not as a big-bang rewrite.

#### 1. Diagnose the cost first

- Check the Firestore usage dashboard and Cloud Monitoring: which collections and which queries read the most?
- Common causes: leaked \`onSnapshot\` listeners, list screens that read profiles one by one, \`getDocs\` on whole collections for counts (use \`getCountFromServer\` / aggregations instead), no \`limit\`.
- Often a week of fixing these cuts the bill by 50-80%. If the bill is mostly caused by **access patterns Firestore is bad at** (analytics, fan-out), that is a real reason to move.

#### 2. Look at each requirement

- **Reports / aggregations:** weak. Firestore has only simple count/sum/avg. Exporting to **BigQuery** (official extension) works well for this.
- **Admin search:** no full-text search. Needs Algolia/Typesense or MongoDB Atlas Search.
- **Business logic in one place:** possible with Cloud Functions + Admin SDK, but logic split across rules and client code gets messy.
- **Data residency (India):** you choose the Firestore location (e.g. Mumbai) **only when you create the database**. It cannot be moved, so this means a new database + data migration anyway.
- **Audit log:** Firestore triggers can write audit records, but nothing is built in. Your own API makes this natural.

#### 3. A reasonable answer

"Not a big-bang rewrite. Keep **Firebase Auth** (it works, and migrating users with passwords is painful). Move **business data and logic** behind our own Node API with MongoDB, one domain at a time. Use BigQuery or Mongo aggregations for reports."

#### 4. Migration plan (strangler pattern)

1. **Node API** that verifies Firebase ID tokens: \`getAuth().verifyIdToken(token)\` in Express middleware. Users keep logging in as before.
2. Pick one domain (for example "jobs and applications"). Build its endpoints. **Dual write** or sync via Firestore triggers into MongoDB while both are live.
3. Backfill old data with a script (read in pages, upsert into Mongo by id, idempotent so it can rerun).
4. Switch the frontend for that domain from the Firestore SDK to the API (feature flag, gradual rollout).
5. Compare data and metrics, then stop the Firestore writes and lock that collection with rules.
6. Repeat per domain. Realtime features can stay on Firestore, or move to WebSockets/Socket.IO later.

**Why this is a good answer:** it treats Firebase as a tool, not a religion. It fixes cheap problems first, moves only what Firebase is bad at, keeps users logged in, and every step can be rolled back.

**Risks to call out:** you now run servers (scaling, on-call, security patches), you lose offline sync and realtime for free, and the team must keep two systems running during migration. Estimate the team time against the savings.`,
      followUps: [
        {
          q: 'When is Firebase the RIGHT choice?',
          a: 'MVPs and small teams, apps with realtime sync and offline needs (chat, collaborative lists), mobile apps, and data with simple access patterns ("my documents"). You ship very fast without running servers.',
        },
        {
          q: 'How do you migrate Firebase Auth users if you must?',
          a: 'Export users with `firebase auth:export`. Firebase uses a modified scrypt for password hashes; your new system must verify that hash on first login and then re-hash with your own algorithm. Or force a password reset. Social logins move more easily (match by provider + email).',
        },
      ],
    },
  ],
};
