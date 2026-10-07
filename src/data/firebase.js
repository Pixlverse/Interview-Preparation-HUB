// Firebase — topics ordered basic -> intermediate -> advanced.
// See CONTENT_GUIDE.md for the topic format. All web examples use the modular (v9+) SDK.

export default {
  id: 'firebase',
  title: 'Firebase',
  icon: '🔥',
  description: 'Google\'s backend-as-a-service: Firestore, Auth, realtime listeners, security rules, Cloud Functions, push notifications, costs, and when to pick it over a MERN backend.',
  definitionTitle: 'What is Firebase?',
  definition: `**Firebase** is Google's **Backend-as-a-Service (BaaS)** platform. It gives you ready-made backend pieces so you can build apps without writing and running your own server:

- **Firestore**, a NoSQL cloud database with real-time updates
- **Authentication**
- **Cloud Functions** for server code
- **Cloud Storage** for files
- **FCM** for push notifications
- **Hosting**

Security is controlled with **Security Rules**.

**One-line answer:** "Firebase is Google's Backend-as-a-Service platform that provides a real-time database, authentication, serverless functions, storage and push notifications out of the box."`,
  topics: [
    {
      id: 'firebase-overview',
      title: 'What is Firebase? Setup with the Modular SDK',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Firebase is a set of Google-hosted backend services you call directly from the frontend; the modular SDK imports only the functions you use.',
      what: `**Firebase** is a **Backend-as-a-Service (BaaS)** from Google. Instead of writing your own Node server and database, you use ready-made services:

- **Firestore** — a NoSQL document database with realtime updates.
- **Realtime Database** — an older, JSON-tree realtime database.
- **Authentication** — sign-in with email, Google, phone and more.
- **Cloud Functions** — your own server code that runs on events.
- **Cloud Storage** — file uploads (images, videos).
- **Cloud Messaging (FCM)** — push notifications.
- **Hosting** — static and web app hosting.

Your frontend talks to these services **directly**. **Security rules** decide what each user may read or write.

#### Deeper version
Since **v9**, the web SDK is **modular**: you import functions (\`getFirestore\`, \`doc\`, \`getDoc\`) instead of calling methods on a big \`firebase\` object. Unused code is removed by the bundler (**tree-shaking**), so the bundle is smaller.

The \`firebaseConfig\` object (with \`apiKey\`) is **not a secret**. It only identifies your project. Real protection comes from **security rules**, Auth, and optionally **App Check** (proves requests come from your real app).

On the server, you use the **Admin SDK** (\`firebase-admin\`), which has full access and ignores security rules.`,
      why: `Firebase lets a small team ship a realtime app with auth in days, without managing servers, scaling, or WebSocket infrastructure. You pay per usage and Google handles uptime.`,
      analogy: `A MERN backend is cooking at home: you buy ingredients, cook, wash dishes. Firebase is a food court: ready kitchens for each need (database, auth, files). You just order. But you eat what the menu offers, and every plate has a price.`,
      code: [
        {
          title: 'Initialize Firebase once (firebase.js)',
          lang: 'javascript',
          code: `// npm install firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Public project identifiers — safe in frontend code
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: 'my-app.firebaseapp.com',
  projectId: 'my-app',
  storageBucket: 'my-app.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abc123',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);   // Firestore instance
export const auth = getAuth(app);      // Auth instance`,
        },
        {
          title: 'Old (namespaced) vs modular style',
          lang: 'javascript',
          code: `// v8 namespaced style (old):
// firebase.firestore().collection('users').doc('u1').get();

// v9+ modular style (current):
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase.js';

const snap = await getDoc(doc(db, 'users', 'u1'));
console.log(snap.exists() ? snap.data() : 'no such user');`,
        },
      ],
      output: `The first file runs once when your app loads. It creates the Firebase app and exports \`db\` and \`auth\` for the rest of the code.

The second block reads the document \`users/u1\`. If it exists it prints its data, like \`{ name: 'Asha', plan: 'pro' }\`; otherwise it prints "no such user". Only \`doc\` and \`getDoc\` are bundled, not the whole SDK.`,
      questions: [
        {
          q: 'What is Firebase?',
          a: 'A Google Backend-as-a-Service with a database (Firestore/Realtime Database), Auth, Cloud Functions, Storage, Hosting and push notifications that apps call directly.',
        },
        {
          q: 'Is the Firebase apiKey a secret?',
          a: 'No. It only identifies the project. Data is protected by security rules, Auth, and optionally App Check.',
        },
        {
          q: 'What changed in the v9 modular SDK?',
          a: 'You import standalone functions (`getDoc(doc(db, ...))`) instead of chaining methods on a global object, which enables tree-shaking and smaller bundles.',
        },
        {
          q: 'Client SDK vs Admin SDK?',
          a: 'The client SDK runs in browsers/apps and is limited by security rules. The Admin SDK runs on trusted servers with a service account and bypasses rules.',
        },
      ],
      spoken: `"Firebase is Google's backend-as-a-service. It gives me Firestore as a realtime NoSQL database, Authentication, Cloud Functions for server code, Storage, Hosting and push notifications. The frontend talks to these services directly, and security rules decide who can read or write what. I use the modular v9-plus SDK, where I import functions like getFirestore and getDoc, so bundles stay small. The config object with the apiKey is not a secret; real protection comes from rules, auth and App Check. On the server I use the Admin SDK, which bypasses rules."`,
      mistakes: [
        'Thinking the `apiKey` must be hidden — and then not writing proper security rules, which is the real protection.',
        'Calling `initializeApp` in many files and getting "app already exists" errors. Initialize once and export.',
        'Mixing v8 and v9 syntax from old tutorials (`firebase.firestore()` with modular imports).',
        'Follow-up trap: "So is Firebase serverless?" For you, yes — no servers to manage. But it still has limits and costs per operation, and complex logic usually moves into Cloud Functions.',
      ],
      takeaway: 'Firebase = hosted backend services called from the client, protected by security rules, used via the tree-shakable modular SDK.',
    },
    {
      id: 'firestore-basics',
      title: 'Firestore: Documents, Collections and CRUD',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Firestore stores JSON-like documents inside collections; documents can hold subcollections. Use addDoc/setDoc/getDoc/updateDoc/deleteDoc.',
      what: `**Firestore** is a NoSQL **document database**.

- A **document** is one record: a set of fields (like a JSON object). Each has an **id**. Max size is **1 MiB**.
- A **collection** is a group of documents, like \`users\` or \`orders\`.
- A document can have **subcollections**, for example \`users/u1/orders/o1\`.

The path always alternates: collection / document / collection / document.

Basic operations:
- \`addDoc(collection, data)\` — create with an auto id.
- \`setDoc(doc, data)\` — create or **overwrite** with a known id. Add \`{ merge: true }\` to only change given fields.
- \`getDoc\` / \`getDocs\` — read one / many.
- \`updateDoc\` — change some fields (fails if the document does not exist).
- \`deleteDoc\` — delete one document.

#### Deeper version
- **Deleting a document does not delete its subcollections.** They stay as "orphans". Delete them separately (Admin SDK, CLI, or a Cloud Function).
- Special values: \`serverTimestamp()\` (time set by the server, not the user's clock), \`increment(1)\` (atomic counter), \`arrayUnion\` / \`arrayRemove\` (change arrays safely), \`deleteField()\`.
- Field types include strings, numbers, booleans, maps (nested objects), arrays, timestamps, geopoints and **references** to other documents.
- Reads are **strongly consistent**, and every read of a document counts as a billed read.`,
      why: `Firestore gives you a database you can use directly from the frontend, with realtime updates and offline support, and it scales automatically without you managing servers or indexes for simple queries.`,
      analogy: `A collection is a drawer, documents are folders in the drawer, and fields are the pages inside a folder. A folder can contain a smaller drawer of its own (a subcollection). Throwing away a folder does not throw away the smaller drawer inside it — you must empty that yourself.`,
      code: [
        {
          title: 'CRUD with the modular SDK',
          lang: 'javascript',
          code: `import {
  collection, doc, addDoc, setDoc, getDoc, updateDoc, deleteDoc,
  serverTimestamp, increment, arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase.js';

// Create with auto id
const ref = await addDoc(collection(db, 'posts'), {
  title: 'Hello Firestore',
  authorId: 'u1',
  likes: 0,
  tags: ['intro'],
  createdAt: serverTimestamp(),
});
console.log('new id:', ref.id);

// Create / overwrite with a known id (merge keeps other fields)
await setDoc(doc(db, 'users', 'u1'), { name: 'Asha', plan: 'pro' }, { merge: true });

// Read one
const snap = await getDoc(doc(db, 'posts', ref.id));
console.log(snap.data().title);

// Update some fields (atomic helpers)
await updateDoc(doc(db, 'posts', ref.id), { likes: increment(1), tags: arrayUnion('firebase') });

// Delete
await deleteDoc(doc(db, 'posts', ref.id));`,
        },
      ],
      output: `The code prints an auto-generated id like \`new id: 7fKq2Xc9...\`, then \`Hello Firestore\`.

\`setDoc\` with \`merge: true\` creates \`users/u1\` or updates only \`name\` and \`plan\`, keeping any other fields. The update makes \`likes\` 1 and \`tags\` \`['intro', 'firebase']\` — even if two users click "like" at the same moment, \`increment\` does not lose a count. Finally the post is deleted (but any subcollection under it would remain).`,
      questions: [
        {
          q: 'What is the difference between setDoc and updateDoc?',
          a: '`setDoc` creates or fully overwrites a document (or merges with `{ merge: true }`). `updateDoc` only changes given fields and fails if the document does not exist.',
        },
        {
          q: 'What is a subcollection?',
          a: 'A collection inside a document, like `users/u1/orders`. Good for data that grows without limit and belongs to a parent.',
        },
        {
          q: 'Does deleting a document delete its subcollections?',
          a: 'No. Subcollections stay. You must delete them separately, for example with a recursive delete from the Admin SDK or CLI.',
        },
        {
          q: 'Why use serverTimestamp() instead of new Date()?',
          a: 'The client clock can be wrong or faked. `serverTimestamp()` is set by Firestore when the write is committed.',
        },
        {
          q: 'What is the maximum document size?',
          a: '1 MiB. Large or growing lists should go in a subcollection, not one huge array field.',
        },
      ],
      spoken: `"Firestore is a NoSQL document database. Data lives in documents, which are like JSON objects with an id, grouped into collections, and a document can have subcollections. With the modular SDK I use addDoc for auto ids, setDoc with merge to create or update with a known id, getDoc and getDocs to read, updateDoc for partial updates, and deleteDoc. I use serverTimestamp for trusted times and increment or arrayUnion for safe concurrent updates. Two gotchas: documents are limited to one mebibyte, and deleting a document does not delete its subcollections."`,
      mistakes: [
        'Using `setDoc` without `merge` and wiping fields you did not include.',
        'Storing an ever-growing list (comments, messages) as an array inside one document — it hits the 1 MiB limit and every read downloads it all.',
        'Read-modify-write counters (`likes: snap.data().likes + 1`) that lose updates under concurrency. Use `increment()`.',
        'Follow-up trap: "Can a document and a collection have the same path depth?" No — paths alternate collection/document. `doc(db, \'users\')` is invalid; a doc path needs an even number of segments.',
      ],
      takeaway: 'Collections hold documents, documents hold fields and subcollections; use the atomic helpers and remember subcollections survive deletes.',
    },
    {
      id: 'firebase-auth',
      title: 'Firebase Authentication',
      level: 'basic',
      priority: 'must',
      frequency: 'very common',
      summary: 'Firebase Auth handles sign-up and sign-in (email, Google, phone...), keeps the session, and gives you an ID token (a JWT) to prove who the user is.',
      what: `**Firebase Authentication** is a ready-made login system. It supports email/password, Google, GitHub, Apple, phone (SMS), anonymous sign-in and more.

Main functions:
- \`createUserWithEmailAndPassword\`, \`signInWithEmailAndPassword\`
- \`signInWithPopup(auth, new GoogleAuthProvider())\`
- \`signOut(auth)\`
- \`onAuthStateChanged(auth, callback)\` — runs when the user logs in, logs out, or when the page loads and the saved session is restored.

Each user has a unique \`uid\`. Security rules use it as \`request.auth.uid\`.

#### Deeper version
After sign-in, the SDK holds:
- an **ID token** — a JWT valid for about **1 hour**, refreshed automatically by the SDK;
- a **refresh token** — long-lived, used to get new ID tokens.

To call **your own backend** (for example an Express API), send the ID token: \`await user.getIdToken()\` → \`Authorization: Bearer <token>\`. The server verifies it with the Admin SDK (\`verifyIdToken\`).

**Custom claims** (for example \`{ role: 'admin' }\`) are set on the server with the Admin SDK. They appear inside the ID token and in rules as \`request.auth.token.role\`. The client sees new claims only after the token refreshes (\`getIdToken(true)\` forces it).

Persistence (where the session is saved) defaults to local storage-like persistence in browsers; you can change it with \`setPersistence\`.`,
      why: `Building secure auth yourself means password hashing, email verification, OAuth flows, token rotation and reset emails. Firebase Auth gives all of it, and it plugs directly into security rules.`,
      analogy: `Firebase Auth is a building's reception desk. It checks your ID once, then gives you a visitor badge (ID token) that expires every hour. A desk keeps renewing it for you as long as you have your membership card (refresh token). Every door (security rule) just checks the badge.`,
      code: [
        {
          title: 'Sign up, sign in, and watch auth state',
          lang: 'javascript',
          code: `import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut,
} from 'firebase/auth';
import { auth } from './firebase.js';

export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const logOut = () => signOut(auth);

// Runs on page load (session restore), login and logout
onAuthStateChanged(auth, (user) => {
  if (user) console.log('Logged in as', user.uid, user.email);
  else console.log('Logged out');
});`,
        },
        {
          title: 'React hook + calling your own API',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.js';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = still checking
  useEffect(() => onAuthStateChanged(auth, setUser), []); // returns unsubscribe
  return user;
}

export async function callApi(path) {
  const token = await auth.currentUser.getIdToken(); // fresh JWT (auto-refreshed)
  const res = await fetch(\`/api\${path}\`, { headers: { Authorization: \`Bearer \${token}\` } });
  return res.json();
}`,
        },
      ],
      output: `After \`signIn('asha@acme.com', 'secret123')\` the listener prints \`Logged in as kT9x... asha@acme.com\`. On refresh, the session is restored and the listener prints it again without the user typing anything. After \`logOut()\` it prints "Logged out".

The hook starts as \`undefined\` (so you can show a spinner instead of flashing the login page), then becomes the user object or \`null\`. \`callApi\` sends a valid ID token to your Express backend, which verifies it with the Admin SDK.`,
      questions: [
        {
          q: 'How do you know if a user is logged in on page load?',
          a: 'Use `onAuthStateChanged`. `auth.currentUser` may be `null` right after load because the session is restored asynchronously.',
        },
        {
          q: 'How do you authenticate requests to your own backend?',
          a: 'Send `await user.getIdToken()` as a Bearer token and verify it on the server with `admin.auth().verifyIdToken(token)` (modular: `getAuth().verifyIdToken`).',
        },
        {
          q: 'How do you implement roles like admin?',
          a: 'Set custom claims from the server with the Admin SDK (`setCustomUserClaims(uid, { role: \'admin\' })`), then check `request.auth.token.role` in rules or the decoded token on the server.',
        },
        {
          q: 'How long does an ID token live?',
          a: 'About one hour. The SDK refreshes it automatically using the refresh token.',
        },
      ],
      spoken: `"Firebase Auth gives me ready login with email, Google, phone and more. I listen with onAuthStateChanged, because on page load the session is restored asynchronously and currentUser can be null at first. Each user has a uid, which I use in security rules. When I call my own Node API, I send the ID token, a JWT valid for about an hour that the SDK refreshes automatically, and the server verifies it with the Admin SDK. For roles I set custom claims on the server and force a token refresh on the client so they take effect."`,
      mistakes: [
        'Reading `auth.currentUser` right on page load and redirecting to login before the session is restored.',
        'Storing roles in a user document that the user can edit themselves. Use custom claims or server-only writable fields.',
        'Sending the user\'s uid (not the ID token) to your backend and trusting it.',
        'Follow-up trap: "You set an admin claim but the user is still not admin — why?" The old ID token is cached for up to an hour. Call `getIdToken(true)` or have the user sign in again.',
      ],
      takeaway: 'Use onAuthStateChanged for state, ID tokens for your backend, and custom claims set by the server for roles.',
    },
    {
      id: 'firestore-queries-indexes',
      title: 'Firestore Queries and Indexes',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Build queries with query(), where(), orderBy() and limit(); simple ones use automatic indexes, multi-field ones need composite indexes; paginate with cursors.',
      what: `A **query** asks for documents in one collection that match conditions:

\`query(collection(db, 'posts'), where('authorId', '==', 'u1'), orderBy('createdAt', 'desc'), limit(10))\`

Operators: \`==\`, \`!=\`, \`<\`, \`<=\`, \`>\`, \`>=\`, \`in\`, \`not-in\`, \`array-contains\`, \`array-contains-any\`. You can also combine conditions with \`or()\` and \`and()\`.

Firestore queries are always backed by an **index**, which is why they are fast even with millions of documents.
- **Single-field indexes** are created automatically for every field.
- **Composite indexes** (on several fields together) must be created by you — for example, \`where('authorId', '==', ...)\` plus \`orderBy('createdAt')\`. If missing, the error message includes a **link** that creates it for you.

#### Deeper version
- Queries are **shallow**: reading \`users\` does not return \`users/u1/orders\`. To query all subcollections with the same name, use a **collection group** query (\`collectionGroup(db, 'orders')\`).
- **Pagination**: use cursors (\`startAfter(lastDocSnapshot)\`). \`offset\`-style skipping still bills you for skipped documents.
- **No full-text search** and no joins. Use a search service (Algolia, Typesense, Elasticsearch) synced by a Cloud Function, and denormalize instead of joins.
- Limits on \`in\` / \`array-contains-any\` lists and rules about combining range filters and ordering have changed over time (for example, newer versions allow range filters on more than one field). Check the current docs.
- Keep composite indexes in \`firestore.indexes.json\` in your repo and deploy them with the Firebase CLI.
- \`getCountFromServer(q)\` returns a count without downloading documents (billed much cheaper than reading them all).`,
      why: `Fast, predictable queries are the reason Firestore scales: query speed depends on the number of results, not the size of the collection. But the index rules shape how you design your data, so you must know them.`,
      analogy: `An index is the alphabetical index at the back of a textbook. A single-field index finds "all pages about React". A composite index is a special index sorted by "chapter, then page number" — the library does not print it until you ask, but it gives you a link to request it.`,
      code: [
        {
          title: 'Filtering, ordering and paginating',
          lang: 'javascript',
          code: `import {
  collection, collectionGroup, query, where, orderBy, limit,
  startAfter, getDocs, getCountFromServer,
} from 'firebase/firestore';
import { db } from './firebase.js';

// Needs a composite index: (authorId ASC, createdAt DESC)
const firstPage = query(
  collection(db, 'posts'),
  where('authorId', '==', 'u1'),
  orderBy('createdAt', 'desc'),
  limit(10),
);
const snap = await getDocs(firstPage);
snap.forEach((d) => console.log(d.id, d.data().title));

// Next page: continue after the last document of the previous page
const last = snap.docs[snap.docs.length - 1];
const nextPage = query(firstPage, startAfter(last));
const snap2 = await getDocs(nextPage);

// All "orders" subcollections across all users
const bigOrders = await getDocs(query(collectionGroup(db, 'orders'), where('total', '>', 1000)));

// Count without reading every document
const count = await getCountFromServer(query(collection(db, 'posts'), where('authorId', '==', 'u1')));
console.log('posts by u1:', count.data().count);`,
        },
        {
          title: 'firestore.indexes.json (deployed with the CLI)',
          lang: 'json',
          code: `{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "authorId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}`,
        },
      ],
      output: `The first time you run the posts query without the index, Firestore throws \`FAILED_PRECONDITION: The query requires an index\` with a link. After the index is built, it prints the 10 newest posts by \`u1\`. \`nextPage\` returns the following 10, starting after the last one you saw. The collection group query returns orders over 1000 from every user, and the count query prints something like \`posts by u1: 37\` while only billing a small aggregation cost.`,
      questions: [
        {
          q: 'When do you need a composite index in Firestore?',
          a: 'When a query filters or orders on more than one field, for example equality on `authorId` plus `orderBy(\'createdAt\')`. The error message gives a link to create it.',
        },
        {
          q: 'How do you paginate in Firestore?',
          a: 'With cursors: `startAfter(lastDocSnapshot)` together with `orderBy` and `limit`. Avoid offsets because skipped documents are still billed.',
        },
        {
          q: 'What is a collection group query?',
          a: 'A query across all collections with the same id at any depth, like every `orders` subcollection under every user.',
        },
        {
          q: 'How do you do full-text search with Firestore?',
          a: 'Firestore does not support it. Sync data to a search engine (Algolia, Typesense, Elasticsearch) using a Cloud Function trigger.',
        },
        {
          q: 'Are Firestore queries shallow?',
          a: 'Yes. Reading a document or collection does not load its subcollections.',
        },
      ],
      spoken: `"I build Firestore queries with query, where, orderBy and limit. Every query uses an index: single-field indexes are automatic, but combining filters and ordering on different fields needs a composite index, which I keep in firestore.indexes.json and deploy with the CLI. Queries are shallow, so for subcollections across users I use collection group queries. I paginate with cursors like startAfter instead of offsets, because skipped documents are still billed. Firestore has no joins or full-text search, so I denormalize and sync to a search engine with a Cloud Function, and use getCountFromServer for counts."`,
      mistakes: [
        'Not committing composite indexes to the repo, so a new environment breaks with "requires an index".',
        'Fetching a whole collection and filtering in JavaScript — slow and every document is a billed read.',
        'Expecting `LIKE` / contains-text search. `array-contains` matches an exact array element, not part of a string.',
        'Follow-up trap: "Why is query speed independent of collection size?" Because every query walks an index and returns only the matching range — cost and time scale with the result set, not the total documents.',
      ],
      takeaway: 'Every query rides an index; plan composite indexes, paginate with cursors, and denormalize instead of joins.',
    },
    {
      id: 'realtime-listeners',
      title: 'Realtime Updates with onSnapshot',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'onSnapshot subscribes to a document or query and calls you on every change; always unsubscribe, and remember each changed document is a billed read.',
      what: `\`getDoc\` reads once. \`onSnapshot\` **subscribes**: it calls your function now with the current data, and again every time the data changes. No polling and no WebSocket code — Firestore keeps the connection for you.

\`onSnapshot\` returns an **unsubscribe** function. Call it when you no longer need updates (for example in a React \`useEffect\` cleanup).

\`snapshot.docChanges()\` tells you exactly what changed: \`added\`, \`modified\` or \`removed\`.

#### Deeper version
- **Latency compensation**: when you write, your own listener fires **immediately** with the local change, before the server confirms. \`snapshot.metadata.hasPendingWrites\` is \`true\` for that local event. This makes UIs feel instant.
- **Offline**: listeners can serve cached data and sync when the connection returns (with persistence enabled on web).
- **Billing**: the first snapshot costs one read per document returned. After that, each added/changed document costs one read. If the listener is disconnected for a long time (around 30 minutes), it may re-read all results when it reconnects.
- Listen to **small, specific queries** (with \`limit\`). A listener on a huge collection is expensive and slow.
- Handle the error callback: if security rules deny access, the listener stops.`,
      why: `Chats, live dashboards, interview status boards and collaborative apps need instant updates. onSnapshot gives realtime sync with a few lines, without running your own Socket.IO server.`,
      analogy: `getDoc is phoning a shop to ask "is my order ready?". onSnapshot is subscribing to their SMS alerts: you get a message every time the status changes. Unsubscribe when you no longer care — and each SMS costs a little.`,
      code: [
        {
          title: 'Live chat messages in React',
          lang: 'jsx',
          code: `import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';

export function ChatMessages({ roomId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50),                                      // keep the listener small
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        snap.docChanges().forEach((c) => console.log(c.type, c.doc.id)); // added/modified/removed
        setMessages(snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          pending: d.metadata.hasPendingWrites,       // true until the server confirms
        })));
      },
      (err) => console.error('listener stopped:', err.code), // e.g. permission-denied
    );
    return unsubscribe;                               // cleanup on unmount or room change
  }, [roomId]);

  return (
    <ul>
      {messages.map((m) => <li key={m.id} style={{ opacity: m.pending ? 0.5 : 1 }}>{m.text}</li>)}
    </ul>
  );
}`,
        },
      ],
      output: `On mount, the listener fires once with up to 50 messages (logs \`added\` for each). When someone sends a message, it fires again with one \`added\` change and the list updates instantly for everyone in the room.

When **you** send a message, it appears immediately at half opacity (\`pending: true\`), then a second event arrives with \`pending: false\` after the server confirms. When \`roomId\` changes or the component unmounts, \`unsubscribe\` stops the old listener.`,
      questions: [
        {
          q: 'How do you get realtime updates in Firestore?',
          a: 'Use `onSnapshot(docOrQuery, callback)`. It fires immediately with current data and again on every change. It returns an unsubscribe function.',
        },
        {
          q: 'How are listeners billed?',
          a: 'One read per document in the first result, then one read per document added or changed. Long disconnections can cause a full re-read.',
        },
        {
          q: 'What is hasPendingWrites?',
          a: 'A metadata flag that is true when the snapshot includes local writes not yet confirmed by the server (latency compensation).',
        },
        {
          q: 'Why must you unsubscribe?',
          a: 'Otherwise listeners keep running after the component is gone: memory leaks, setState on unmounted components, and extra billed reads.',
        },
      ],
      spoken: `"For realtime features I use onSnapshot on a document or a query. It fires right away with the current data and then on every change, and docChanges tells me what was added, modified or removed. It returns an unsubscribe function, which I return from my useEffect cleanup. Firestore applies my own writes locally first, so the UI is instant, and hasPendingWrites tells me if the server has confirmed. On cost, every document in the first snapshot and every changed document is a read, so I keep listeners on small, limited queries."`,
      mistakes: [
        'Forgetting to return the unsubscribe function from `useEffect` — listeners pile up on every route change.',
        'Listening to an entire large collection instead of a limited query.',
        'Ignoring the error callback; a rules change silently stops updates.',
        'Follow-up trap: "Why did my listener fire twice for one write?" The first event is the local (pending) write, the second is the server confirmation — check `metadata.hasPendingWrites`.',
      ],
      takeaway: 'onSnapshot = live data with one call; keep queries small and always unsubscribe.',
    },
    {
      id: 'rtdb-vs-firestore',
      title: 'Realtime Database vs Firestore',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'Realtime Database is one big JSON tree billed by bandwidth, great for presence and tiny frequent updates; Firestore has documents, richer queries and per-operation billing.',
      what: `Firebase has **two** databases:

- **Realtime Database (RTDB)** — the original. All data is **one big JSON tree**. Very low latency. Billed mainly by **data downloaded and stored**, not per operation. Queries are simple (sort/filter on one property).
- **Cloud Firestore** — newer. **Documents and collections**, richer queries with indexes, better scaling, multi-region options. Billed **per document read/write/delete**.

For most new apps, Firestore is the default choice.

#### Deeper version
When RTDB still wins:
- **Presence** ("who is online"): RTDB has \`onDisconnect()\` — the server writes a value when a client disconnects, even if the app crashed. Firestore has no built-in equivalent; the common pattern uses RTDB for presence and a Cloud Function to mirror it into Firestore.
- **Very frequent tiny updates** (cursor positions, typing indicators, game state): per-operation billing in Firestore gets expensive; RTDB bandwidth billing can be cheaper.

Downsides of RTDB: reading a node downloads **all its children** (deep data is costly), weaker querying, and scaling across many connections may require sharding into multiple database instances.

Security: RTDB uses its own JSON rules language (\`.read\`, \`.write\`, \`.validate\`), different from Firestore rules.`,
      why: `Interviewers ask this to see if you understand trade-offs, not just APIs. Picking the right one affects cost, query power and how you build features like presence.`,
      analogy: `RTDB is one giant shared whiteboard: super fast to scribble on, but if you want one corner you often end up photographing a big area. Firestore is a filing cabinet with an index: a bit more formal, easy to find exactly the folders you want, and you pay per folder you open.`,
      code: [
        {
          title: 'Presence with RTDB onDisconnect',
          lang: 'javascript',
          code: `import { getDatabase, ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { app } from './firebase.js';

const rtdb = getDatabase(app);

export function trackPresence(uid) {
  const statusRef = ref(rtdb, \`status/\${uid}\`);
  const connectedRef = ref(rtdb, '.info/connected'); // special path: am I connected?

  onValue(connectedRef, async (snap) => {
    if (snap.val() === false) return;
    // Tell the SERVER what to write if we disappear (tab closed, network lost)
    await onDisconnect(statusRef).set({ state: 'offline', lastSeen: serverTimestamp() });
    await set(statusRef, { state: 'online', lastSeen: serverTimestamp() });
  });
}`,
        },
        {
          title: 'The same "read once" in both databases',
          lang: 'javascript',
          code: `import { get, ref } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';

// RTDB: path in a JSON tree (downloads the node and ALL children)
const rtdbSnap = await get(ref(rtdb, 'users/u1'));
console.log(rtdbSnap.val());

// Firestore: one document (subcollections are NOT downloaded)
const fsSnap = await getDoc(doc(db, 'users', 'u1'));
console.log(fsSnap.data());`,
        },
      ],
      output: `In the presence example, when the user connects their status becomes \`online\`. If they close the tab or lose the network, the RTDB server itself runs the stored \`onDisconnect\` write and sets \`offline\` with a timestamp. Other users listening to \`status/u1\` see the change.

In the second block, both print the user object, but the RTDB read also downloads everything nested under \`users/u1\` (which could be large), while Firestore returns only that document's fields.`,
      questions: [
        {
          q: 'Firestore or Realtime Database for a new app?',
          a: 'Usually Firestore: richer queries, better structure and scaling. Use RTDB for presence or many tiny high-frequency updates where bandwidth billing is cheaper.',
        },
        {
          q: 'How do you build online/offline presence?',
          a: 'With RTDB `.info/connected` plus `onDisconnect().set(...)`, optionally mirrored to Firestore by a Cloud Function.',
        },
        {
          q: 'How is billing different?',
          a: 'RTDB bills mainly for GB stored and downloaded. Firestore bills per document read, write and delete, plus storage and network.',
        },
        {
          q: 'Why is deep nesting bad in RTDB?',
          a: 'Reading a node returns all its children, so deep trees download much more data than needed. Keep RTDB data flat.',
        },
      ],
      spoken: `"Firebase has two databases. Realtime Database is one big JSON tree with very low latency, billed mainly by bandwidth and storage, with simple queries. Firestore uses documents and collections, has indexed compound queries, scales better, and bills per read, write and delete. For new apps I default to Firestore. I still use RTDB for presence because onDisconnect lets the server mark a user offline even if the app crashes, and for very frequent tiny updates where per-operation billing would be expensive. In RTDB I keep data flat because reading a node downloads all children."`,
      mistakes: [
        'Deeply nesting data in RTDB, so loading a list also downloads every nested detail.',
        'Building presence in Firestore with "last active" writes every few seconds — expensive and not reliable on crashes.',
        'Assuming the two databases share rules or queries — they have different APIs and rule languages.',
        'Follow-up trap: "Can you use both in one project?" Yes, and it is common: Firestore for main data, RTDB for presence and live cursors.',
      ],
      takeaway: 'Firestore by default; RTDB for presence and tiny high-frequency updates.',
    },
    {
      id: 'security-rules',
      title: 'Firestore Security Rules',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Rules run on Google\'s servers for every client request and decide allow or deny using request.auth, the existing data (resource) and the incoming data (request.resource).',
      what: `Because the browser talks to Firestore directly, you need a guard on the server side. **Security rules** are that guard. They run on Google's servers for every read and write from the client SDK.

A rule matches a path and says when to allow an operation:

\`match /users/{userId} { allow read, write: if request.auth.uid == userId; }\`

Key variables:
- \`request.auth\` — the signed-in user (\`uid\`, and \`token\` with custom claims). \`null\` if not signed in.
- \`resource.data\` — the document **as it is now** in the database.
- \`request.resource.data\` — the document **as it would be after** the write.
- \`request.time\` — server time of the request.

Operations: \`read\` (= \`get\` + \`list\`) and \`write\` (= \`create\` + \`update\` + \`delete\`).

#### Deeper version
- **Rules are not filters.** A query must be written so that **every** possible result is allowed; otherwise the whole query is denied. If the rule says "only your own posts", the query must include \`where('authorId', '==', uid)\`.
- **Validation** lives in rules too: check types, sizes, allowed keys (\`keys().hasOnly([...])\`), and that \`createdAt == request.time\`.
- \`get()\` and \`exists()\` let a rule read another document (for example the user's role). Each one costs a billed read and there is a limit per request.
- The **Admin SDK bypasses rules** completely. Rules protect against clients, not against your server code.
- Test rules with the Emulator and \`@firebase/rules-unit-testing\` before deploying.
- Add **App Check** to reduce abuse from scripts that are not your real app.`,
      why: `Without rules, anyone with your public config could read or delete your whole database. Rules are the authorization layer that replaces the checks you would write in Express middleware.`,
      analogy: `Rules are a security guard at every door of the building. The guard checks your badge (request.auth), what is in the room now (resource), and what you are trying to carry in (request.resource). The cleaning staff with the master key (Admin SDK) walk past the guard.`,
      code: [
        {
          title: 'firestore.rules for users and posts',
          lang: 'text',
          code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() { return request.auth != null; }
    function isAdmin() { return signedIn() && request.auth.token.role == 'admin'; }

    // Each user can read/write only their own profile
    match /users/{userId} {
      allow read, update: if signedIn() && request.auth.uid == userId;
      allow create: if signedIn() && request.auth.uid == userId
                    && request.resource.data.keys().hasOnly(['name', 'photoUrl', 'createdAt']);
      allow delete: if isAdmin();
    }

    // Public posts, only the author can change them
    match /posts/{postId} {
      allow read: if true;
      allow create: if signedIn()
        && request.resource.data.authorId == request.auth.uid
        && request.resource.data.title is string
        && request.resource.data.title.size() <= 200
        && request.resource.data.createdAt == request.time;
      allow update: if signedIn() && resource.data.authorId == request.auth.uid
        && request.resource.data.authorId == resource.data.authorId; // cannot change owner
      allow delete: if signedIn() && (resource.data.authorId == request.auth.uid || isAdmin());
    }
  }
}`,
        },
        {
          title: '"Rules are not filters" in practice',
          lang: 'javascript',
          code: `// Rule: allow read: if resource.data.ownerId == request.auth.uid;

// DENIED: could return other users' docs, so the whole query fails
await getDocs(collection(db, 'invoices'));

// ALLOWED: the query itself guarantees every result passes the rule
await getDocs(query(collection(db, 'invoices'), where('ownerId', '==', auth.currentUser.uid)));`,
        },
      ],
      output: `A signed-in user \`u1\` can read and update \`users/u1\` but gets \`permission-denied\` for \`users/u2\`. Creating a post works only if \`authorId\` is their own uid, the title is a string of at most 200 characters, and \`createdAt\` is set with \`serverTimestamp()\` (so it equals \`request.time\`). Nobody can change a post's author. An admin (custom claim \`role: 'admin'\`) can delete any post.

In the second block, the unfiltered query is rejected entirely even if some invoices belong to the user. The filtered query succeeds.`,
      questions: [
        {
          q: 'What is the difference between resource and request.resource?',
          a: '`resource.data` is the existing document; `request.resource.data` is the document after the proposed write. Use the first for ownership checks and the second for validation.',
        },
        {
          q: 'What does "rules are not filters" mean?',
          a: 'Firestore does not drop disallowed documents from a query. If the query could return any document the rules deny, the whole query fails. Add matching `where` clauses.',
        },
        {
          q: 'Do security rules apply to the Admin SDK?',
          a: 'No. The Admin SDK uses a service account and bypasses rules. Your server code must do its own checks.',
        },
        {
          q: 'How do you implement role-based access in rules?',
          a: 'Use custom claims (`request.auth.token.role`) set by the server, or `get()` a role document (costs a read per evaluation).',
        },
        {
          q: 'How do you test rules?',
          a: 'Run them in the Firebase Emulator and write tests with `@firebase/rules-unit-testing` that assert allowed and denied operations.',
        },
      ],
      spoken: `"Since clients talk to Firestore directly, security rules are my authorization layer. They run on Google's servers for every client request. I check request.auth for the user and custom claims, resource.data for the existing document, and request.resource.data for what is being written — that is where I validate types, sizes, allowed keys, and server timestamps. Rules are not filters, so my queries must include the same conditions, like where ownerId equals my uid. The Admin SDK bypasses rules, so server code needs its own checks. I test rules in the emulator before deploying."`,
      mistakes: [
        'Shipping test-mode rules (`allow read, write: if true`) or rules with an expired date to production.',
        'Only checking `request.auth != null` — any signed-in user can then read or edit everyone\'s data.',
        'Validating on the client only. Anyone can call the API directly; validation must also be in rules.',
        'Using many `get()` calls in rules — each is a billed read and they have per-request limits.',
        'Follow-up trap: "Can rules hide some fields of a document?" No. Rules allow or deny whole documents. Put private fields in a separate document or subcollection with stricter rules.',
      ],
      takeaway: 'Rules are server-side guards: auth for who, resource for what exists, request.resource for what is written — and they are not filters.',
    },
    {
      id: 'cloud-functions',
      title: 'Cloud Functions: Triggers and HTTPS Functions',
      level: 'intermediate',
      priority: 'must',
      frequency: 'very common',
      summary: 'Serverless Node functions that run on events (Firestore writes, auth, schedules) or HTTP requests; use them for trusted logic, secrets and third-party APIs.',
      what: `**Cloud Functions for Firebase** let you run your own Node.js code on Google's servers without managing a server.

Types of functions:
- **HTTPS functions** (\`onRequest\`) — a normal HTTP endpoint, like an Express route. Good for webhooks (Stripe, Twilio).
- **Callable functions** (\`onCall\`) — called from your app with \`httpsCallable\`. Firebase automatically passes the user's auth info.
- **Background triggers** — run when something happens: a Firestore document is created/updated/deleted, a file is uploaded to Storage, a user signs up.
- **Scheduled functions** (\`onSchedule\`) — cron jobs.

Functions use the **Admin SDK**, so they can do trusted work the client must not: charge payments, send emails, keep secret API keys, update counters.

#### Deeper version
- **2nd gen** functions (imports from \`firebase-functions/v2/...\`) run on Cloud Run: one instance can handle many concurrent requests, with longer timeouts and more memory options.
- **Cold starts**: a new instance must boot, adding latency. Use \`minInstances\` for latency-sensitive endpoints (costs money).
- Background triggers are delivered **at least once**: they may run twice. Make them **idempotent** (use \`event.id\` or check state).
- **Infinite loops**: a function triggered on \`posts/{id}\` writes that updates the same post triggers itself again. Guard with a condition.
- Store secrets with \`defineSecret\` (Secret Manager), not in code.
- Auth trigger APIs differ between generations (classic user-created triggers vs newer blocking functions like \`beforeUserCreated\`) — check the docs for the version you use.`,
      why: `The client cannot be trusted with secrets or business rules like "charge this card" or "increase this counter for everyone". Cloud Functions are your trusted backend, without running servers.`,
      analogy: `Cloud Functions are like motion-sensor lights. They are off (and free) most of the time, switch on when something happens (a door opens = document created), do their job, and turn off. The first switch-on after a long time takes a moment to warm up (cold start).`,
      code: [
        {
          title: 'Trigger, callable and HTTPS functions (2nd gen)',
          lang: 'javascript',
          code: `// functions/index.js
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

// 1) Trigger: keep a post counter on the author (runs at least once -> idempotent guard)
export const onPostCreated = onDocumentCreated('posts/{postId}', async (event) => {
  const post = event.data?.data();
  if (!post) return;
  const marker = db.doc(\`processedEvents/\${event.id}\`);
  await db.runTransaction(async (tx) => {
    if ((await tx.get(marker)).exists) return;           // already processed
    tx.set(marker, { at: FieldValue.serverTimestamp() });
    tx.update(db.doc(\`users/\${post.authorId}\`), { postCount: FieldValue.increment(1) });
  });
});

// 2) Callable: auth is checked for you
export const createTeam = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Please sign in');
  const { name } = request.data;
  if (typeof name !== 'string' || name.length > 60) throw new HttpsError('invalid-argument', 'Bad name');
  const ref = await db.collection('teams').add({ name, ownerId: request.auth.uid });
  return { teamId: ref.id };
});

// 3) HTTPS: e.g. a webhook endpoint
export const health = onRequest({ region: 'asia-south1' }, (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// 4) Scheduled cleanup every day
export const cleanup = onSchedule('every 24 hours', async () => {
  const old = await db.collection('invites').where('expiresAt', '<', new Date()).limit(400).get();
  const batch = db.batch();
  old.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
});`,
        },
        {
          title: 'Calling the callable from the web app',
          lang: 'javascript',
          code: `import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase.js';

const createTeam = httpsCallable(getFunctions(app), 'createTeam');
const { data } = await createTeam({ name: 'Platform Team' });
console.log('team id:', data.teamId);`,
        },
      ],
      output: `When a post is created, \`onPostCreated\` increments the author's \`postCount\`. If Google delivers the same event twice, the \`processedEvents\` marker makes the second run do nothing.

The web app calls \`createTeam\` and logs \`team id: abc123\`. If the user is not signed in, the call rejects with an \`unauthenticated\` error. \`health\` answers \`{"ok":true,...}\` at its HTTPS URL, and \`cleanup\` deletes expired invites once a day.`,
      questions: [
        {
          q: 'onCall vs onRequest?',
          a: '`onCall` is for your own app: the SDK sends auth and data automatically and you return JSON. `onRequest` is a raw HTTP endpoint — used for webhooks and public APIs, where you handle auth yourself.',
        },
        {
          q: 'What is a cold start and how do you reduce it?',
          a: 'The delay when a new instance boots. Reduce it with `minInstances`, smaller dependencies, lazy imports, and 2nd gen concurrency.',
        },
        {
          q: 'Why must background functions be idempotent?',
          a: 'Event delivery is at least once, so a function may run twice for the same event. Use the event id or state checks to avoid double effects.',
        },
        {
          q: 'How do you avoid an infinite trigger loop?',
          a: 'Do not blindly write to the same document that triggered the function; check whether the change is needed first, or write to a different document.',
        },
        {
          q: 'Where do you keep API keys for functions?',
          a: 'In Secret Manager via `defineSecret`, bound to the function — never in source code or the client.',
        },
      ],
      spoken: `"Cloud Functions are my trusted serverless backend in Firebase. I use background triggers like onDocumentCreated for side effects such as counters or syncing to a search index, callable functions when my app needs a secure action with auth passed automatically, HTTPS functions for webhooks like Stripe, and scheduled functions for cleanup. Triggers are at-least-once, so I make them idempotent, and I avoid writing back to the triggering document to prevent loops. I keep secrets in Secret Manager, and for latency-sensitive endpoints I use min instances to reduce cold starts."`,
      mistakes: [
        'Putting secret keys (Stripe, OpenAI) in the frontend instead of in a function with Secret Manager.',
        'Non-idempotent triggers that double-count or double-email on retries.',
        'A trigger that updates its own document and runs forever (and bills forever).',
        'Not awaiting promises — the function ends before the work finishes.',
        'Follow-up trap: "Do Cloud Functions bypass security rules?" Yes, they use the Admin SDK, so validate inputs and check `request.auth` yourself.',
      ],
      takeaway: 'Functions are your trusted backend: triggers for side effects, callables for app actions, HTTPS for webhooks — keep them idempotent.',
    },
    {
      id: 'admin-sdk',
      title: 'Firebase Admin SDK on the Server',
      level: 'intermediate',
      priority: 'must',
      frequency: 'common',
      summary: 'The Admin SDK gives a Node server full, rule-bypassing access: verify ID tokens, set custom claims, manage users, read/write Firestore, and send FCM messages.',
      what: `The **Admin SDK** (\`firebase-admin\`) is the server-side library. It uses a **service account** (a Google identity for your server), not a user. It has **full access** and **ignores security rules**.

Common uses in a Node/Express backend:
- **Verify ID tokens** from the client: \`getAuth().verifyIdToken(token)\`.
- **Custom claims** for roles: \`getAuth().setCustomUserClaims(uid, { role: 'admin' })\`.
- **User management**: create, disable, delete users, generate password-reset links.
- **Firestore** reads and writes from trusted code.
- **FCM** push notifications.

#### Deeper version
- **Credentials**: on Google Cloud (Cloud Functions, Cloud Run) call \`initializeApp()\` with no arguments — it uses the environment's default credentials. Elsewhere (AWS, your VPS), use a service-account key via \`GOOGLE_APPLICATION_CREDENTIALS\` or \`cert(...)\`, stored as a secret. Never commit the key JSON.
- The Admin Firestore API looks like the old chained style: \`db.collection('users').doc(uid).get()\`.
- \`verifyIdToken(token, true)\` also checks if the token was **revoked** (costs an extra lookup). Use it for sensitive actions after \`revokeRefreshTokens(uid)\`.
- **Session cookies** (\`createSessionCookie\`) are an option for server-rendered apps (like Next.js) that want an httpOnly cookie instead of sending the ID token on each request.`,
      why: `Many teams use Firebase Auth with their own MERN backend. The Admin SDK is the bridge: it lets Express trust Firebase users and lets server code do privileged things clients must never do.`,
      analogy: `Client SDKs are visitor badges that only open certain doors. The Admin SDK is the building manager's master key: it opens everything, so it must never leave the manager's office (your server).`,
      code: [
        {
          title: 'Express middleware that verifies Firebase users',
          lang: 'javascript',
          code: `// npm install firebase-admin express
import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = getFirestore();
const app = express();
app.use(express.json());

async function requireUser(req, res, next) {
  const token = (req.get('Authorization') || '').replace('Bearer ', '');
  try {
    req.user = await getAuth().verifyIdToken(token); // { uid, email, role?, ... }
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

const requireAdmin = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ error: 'forbidden' });

app.post('/admin/make-admin/:uid', requireUser, requireAdmin, async (req, res) => {
  await getAuth().setCustomUserClaims(req.params.uid, { role: 'admin' });
  await db.collection('auditLog').add({
    action: 'make-admin', target: req.params.uid, by: req.user.uid, at: FieldValue.serverTimestamp(),
  });
  res.json({ ok: true });
});

app.listen(4000);`,
        },
      ],
      output: `A request without a valid \`Authorization: Bearer <idToken>\` header gets \`401 invalid token\`. A normal signed-in user gets \`403 forbidden\`. An admin can promote another user: their custom claim is set and an audit log entry is written (the Admin SDK writes even though client rules might forbid writes to \`auditLog\`).

The promoted user sees the new role after their ID token refreshes (within an hour, or immediately with \`getIdToken(true)\`).`,
      questions: [
        {
          q: 'How do you use Firebase Auth with an Express backend?',
          a: 'The client sends its ID token as a Bearer token; Express verifies it with `getAuth().verifyIdToken()` from the Admin SDK and uses the decoded `uid` and claims.',
        },
        {
          q: 'Does the Admin SDK respect security rules?',
          a: 'No. It has full access. Your server code is responsible for authorization.',
        },
        {
          q: 'How do you initialize the Admin SDK outside Google Cloud?',
          a: 'With a service-account key passed via `cert()` or the `GOOGLE_APPLICATION_CREDENTIALS` env var, stored in a secret manager — never committed.',
        },
        {
          q: 'How do you force-logout a user?',
          a: '`revokeRefreshTokens(uid)` stops new ID tokens. Existing ID tokens remain valid until expiry unless you verify with `checkRevoked = true`.',
        },
      ],
      spoken: `"The Admin SDK is Firebase's server library. It runs with a service account and bypasses security rules, so it only lives on trusted servers. In a MERN-style backend, I use it to verify the ID token the client sends, then I trust the decoded uid and custom claims in my Express middleware. I also use it to set custom claims for roles, manage users, write to Firestore from trusted code, and send push notifications. On Google Cloud I call initializeApp with no arguments; elsewhere I load the service account from a secret, never from the repo."`,
      mistakes: [
        'Committing the service-account JSON to Git — it is a full-access key to your project.',
        'Using the Admin SDK in frontend code (it is server-only and would expose the key).',
        'Forgetting that the Admin SDK skips rules and therefore skipping authorization checks in the API.',
        'Follow-up trap: "After revoking tokens, why can the user still call the API?" ID tokens stay valid until expiry. Use `verifyIdToken(token, true)` to check revocation on sensitive routes.',
      ],
      takeaway: 'Admin SDK = server-only master key: verify tokens, set claims, do privileged work — and authorize yourself.',
    },
    {
      id: 'fcm-push-notifications',
      title: 'FCM Push Notifications',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'The client gets an FCM registration token and saves it; the server sends messages to tokens or topics with the Admin SDK; a service worker shows background notifications on web.',
      what: `**Firebase Cloud Messaging (FCM)** sends push notifications to Android, iOS and web browsers for free.

Flow:
1. The app asks the user for **notification permission**.
2. The app gets an **FCM registration token** — an address for this device/browser — with \`getToken\`.
3. The app sends the token to your backend, which stores it on the user.
4. Your server sends a message to that token (or to a **topic** like \`news\`) with the **Admin SDK**.
5. If the app is in the foreground, \`onMessage\` receives it. In the background, the **service worker** (web) or the OS shows it.

#### Deeper version
- **Notification vs data messages**: a \`notification\` payload is shown automatically by the system in the background. A \`data\` payload is custom key-value data (values must be **strings**) that your code handles.
- On web you need a **VAPID key** (from the Firebase console) and a \`firebase-messaging-sw.js\` service worker served from your site root.
- Tokens change and expire. When sending fails with errors like \`messaging/registration-token-not-registered\`, **delete** that token from your DB.
- One user can have many tokens (phone, laptop). Store a set, not a single value.
- Send to many devices with \`sendEachForMulticast\` (batches up to 500 tokens) or topics.
- The old legacy FCM HTTP API was shut down; use the **HTTP v1 API**, which the Admin SDK uses.
- iOS needs APNs setup; Safari web push has its own requirements — check current docs.`,
      why: `Push notifications bring users back: "your interview starts in 10 minutes", "new message", "payment failed". FCM gives one API for all platforms without paying per message.`,
      analogy: `The FCM token is a device's mailbox number. The app tells your server its mailbox number; your server hands letters to the FCM post office with that number. If the post office says "this mailbox no longer exists", remove it from your address book.`,
      code: [
        {
          title: 'Web client: permission, token, foreground messages',
          lang: 'javascript',
          code: `import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase.js';

const messaging = getMessaging(app);

export async function enablePush() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;
  const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FCM_VAPID_KEY });
  await callApi('/push-tokens', { method: 'POST', body: JSON.stringify({ token }) }); // save on server
  return token;
}

// App is open: handle it yourself (for example a toast)
onMessage(messaging, (payload) => {
  showToast(payload.notification?.title, payload.notification?.body);
});`,
        },
        {
          title: 'Service worker (public/firebase-messaging-sw.js)',
          lang: 'javascript',
          code: `// Service workers use the compat scripts; match the version to your installed firebase package
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIza-your-public-key',
  projectId: 'my-app',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abc123',
});

// Messages with a "notification" payload are shown automatically in the background.
// This handler is for extra logic (logging, data-only messages).
firebase.messaging().onBackgroundMessage((payload) => {
  console.log('Background message', payload.data);
});`,
        },
        {
          title: 'Server: send and clean up dead tokens',
          lang: 'javascript',
          code: `import { getMessaging } from 'firebase-admin/messaging';

export async function notifyUser(user, interview) {
  const res = await getMessaging().sendEachForMulticast({
    tokens: user.pushTokens,                       // up to 500 per call
    notification: { title: 'Interview soon', body: 'Your interview starts in 10 minutes.' },
    data: { interviewId: String(interview.id) },   // data values must be strings
    webpush: { fcmOptions: { link: \`https://app.myapp.com/interviews/\${interview.id}\` } },
  });

  const dead = res.responses
    .map((r, i) => (!r.success && r.error?.code === 'messaging/registration-token-not-registered' ? user.pushTokens[i] : null))
    .filter(Boolean);
  if (dead.length) await removeTokens(user.id, dead);
  console.log(\`sent \${res.successCount}, failed \${res.failureCount}\`);
}`,
        },
      ],
      output: `After the user clicks "Enable notifications", the browser asks for permission, the app gets a token and saves it. Later, the server's \`notifyUser\` sends to all of the user's devices. If the tab is open, \`onMessage\` shows a toast. If the tab is closed, the browser shows a system notification; clicking it opens the interview link.

The server logs \`sent 2, failed 1\` if one of three tokens was stale, and removes that token so it is not used again.`,
      questions: [
        {
          q: 'How does FCM know which device to send to?',
          a: 'Each app instance gets a registration token via `getToken`. Your backend stores it and sends messages to it (or to topics the token is subscribed to).',
        },
        {
          q: 'Notification message vs data message?',
          a: 'A notification message is displayed automatically by the system when the app is in the background. A data message is custom string key-values that your code handles.',
        },
        {
          q: 'What do you need for web push with FCM?',
          a: 'Notification permission, a VAPID key passed to `getToken`, and a `firebase-messaging-sw.js` service worker at the site root.',
        },
        {
          q: 'How do you handle invalid tokens?',
          a: 'Check the per-token send results and delete tokens that return `registration-token-not-registered` or invalid-token errors.',
        },
      ],
      spoken: `"With FCM, the client asks for notification permission and gets a registration token, which it sends to my backend. A user can have several tokens, one per device, so I store a list. My server sends messages with the Admin SDK, for example sendEachForMulticast with a notification payload and string data values. On web I need a VAPID key and a firebase-messaging-sw.js service worker for background messages, and onMessage handles foreground ones. I check every send result and delete tokens that are no longer registered, otherwise the token list fills with dead entries."`,
      mistakes: [
        'Storing only one token per user, so notifications reach only the last device.',
        'Never cleaning up dead tokens.',
        'Sending numbers or objects in `data` — values must be strings.',
        'Asking for notification permission on page load; users block it. Ask after a clear user action.',
        'Follow-up trap: "Why does my web notification not show when the tab is open?" In the foreground FCM delivers to `onMessage` instead of showing a system notification; you must display it yourself.',
      ],
      takeaway: 'Client gets and saves tokens; server sends with the Admin SDK; service worker handles background; clean dead tokens.',
    },
    {
      id: 'transactions-batched-writes',
      title: 'Transactions and Batched Writes',
      level: 'intermediate',
      priority: 'good',
      frequency: 'common',
      summary: 'A batched write commits several writes atomically; a transaction also reads first and retries if the data changed, for safe read-then-write logic.',
      what: `Sometimes several writes must happen **all together or not at all** (atomic).

- **Batched write** (\`writeBatch\`): group many \`set\`, \`update\`, \`delete\` operations and \`commit()\` them as one unit. No reads inside.
- **Transaction** (\`runTransaction\`): read documents, decide, then write. If another client changes those documents before you commit, Firestore **retries** your function with fresh data.

Use a transaction when the write depends on the current value, like "book this seat only if it is still free".

#### Deeper version
- In a transaction, do **all reads before any writes**.
- The transaction function may run **several times**, so it must not have side effects (no emails, no \`setState\`) inside it.
- Client-side transactions need a connection; they fail when offline. Batched writes work offline and sync later.
- Server (Admin SDK) transactions use locks, while client transactions use optimistic retries.
- Per-request size and operation limits apply (historically 500 operations per batch); check the current docs for exact numbers.
- For a single counter, \`increment()\` is simpler than a transaction. Very hot counters (many writes per second on one document) need **distributed counters** (shards) because a single document handles only about one sustained write per second.`,
      why: `Without atomic writes, a crash or race can leave data half-updated: money moved out of one account but not into another, or two candidates booked into the same interview slot.`,
      analogy: `A batched write is posting several letters in one sealed envelope — they all arrive together or none do. A transaction is checking the cinema seat map, choosing a seat, and if someone else took it before you paid, the system shows you the updated map and you try again.`,
      code: [
        {
          title: 'Book an interview slot safely (transaction)',
          lang: 'javascript',
          code: `import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';

export async function bookSlot(slotId, candidateId) {
  const slotRef = doc(db, 'slots', slotId);
  const bookingRef = doc(db, 'bookings', \`\${slotId}_\${candidateId}\`);

  return runTransaction(db, async (tx) => {
    const slot = await tx.get(slotRef);                     // 1) reads first
    if (!slot.exists()) throw new Error('Slot not found');
    if (slot.data().bookedBy) throw new Error('Slot already taken');

    tx.update(slotRef, { bookedBy: candidateId });          // 2) then writes
    tx.set(bookingRef, { slotId, candidateId, at: serverTimestamp() });
    return 'booked';
  });
}`,
        },
        {
          title: 'Mark many notifications as read (batch)',
          lang: 'javascript',
          code: `import { writeBatch, doc } from 'firebase/firestore';

export async function markAllRead(uid, notificationIds) {
  const batch = writeBatch(db);
  notificationIds.forEach((id) => {
    batch.update(doc(db, 'users', uid, 'notifications', id), { read: true });
  });
  await batch.commit(); // all updates succeed or none do
}`,
        },
      ],
      output: `If two candidates click "Book" on the same slot at the same moment, both transactions read \`bookedBy: null\`. The first commits. The second detects the slot changed, retries, now sees \`bookedBy\` set, and throws "Slot already taken". Exactly one booking exists.

\`markAllRead\` updates every notification in one atomic commit; if one id does not exist, the whole batch fails and nothing changes.`,
      questions: [
        {
          q: 'Batched write vs transaction?',
          a: 'A batch is atomic writes only. A transaction reads then writes atomically and retries if the read data changed meanwhile.',
        },
        {
          q: 'Why can a transaction function run more than once?',
          a: 'Client transactions are optimistic: if documents you read changed before commit, Firestore reruns the function with fresh data.',
        },
        {
          q: 'How do you handle a counter with many writes per second?',
          a: 'Use a distributed counter: split the count across N shard documents, increment a random shard, and sum shards when reading.',
        },
        {
          q: 'Do transactions work offline?',
          a: 'Client-side transactions do not; they need the server. Batched writes can be queued offline.',
        },
      ],
      spoken: `"When several writes must succeed together I use a batched write, which commits set, update and delete operations atomically. When a write depends on current data, like booking an interview slot only if it is still free, I use runTransaction: I do all reads first, then writes, and if someone else changed the data before commit, Firestore retries my function with fresh values. Because it can rerun, I keep side effects out of the transaction. For simple counters I use increment, and for very hot counters I use sharded distributed counters."`,
      mistakes: [
        'Writing before reading inside a transaction — Firestore requires reads first.',
        'Sending emails or updating UI state inside the transaction function, which may run several times.',
        'Using read-then-write without a transaction and getting double bookings under load.',
        'Follow-up trap: "Is a batch faster than individual writes?" It reduces round trips and is atomic, but it is not a bulk-import tool; for huge imports use the Admin SDK `BulkWriter`.',
      ],
      takeaway: 'Batch for atomic writes, transaction for read-then-write; no side effects inside, reads before writes.',
    },
    {
      id: 'cloud-storage-uploads',
      title: 'Cloud Storage for File Uploads',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Upload files straight from the browser to Cloud Storage with uploadBytesResumable, protect them with Storage rules, and save the path or URL in Firestore.',
      what: `**Cloud Storage for Firebase** stores files: profile photos, resumes, recordings. The browser uploads **directly** to storage — your server does not handle the bytes.

Steps:
1. Create a reference (a path) like \`users/u1/resume.pdf\`.
2. Upload with \`uploadBytes\` (simple) or \`uploadBytesResumable\` (progress, pause/resume).
3. Get a URL with \`getDownloadURL\` and save it (or just the path) in Firestore.

**Storage rules** protect files, like Firestore rules, and can check size and content type.

#### Deeper version
- \`getDownloadURL\` returns a URL with a token: anyone with the URL can read the file until you revoke the token. For private files, store the **path** and serve access through rules or short-lived **signed URLs** generated by the Admin SDK on the server.
- Use a Cloud Function on \`onObjectFinalized\` to process uploads (make thumbnails, scan files, extract text).
- Storage is backed by a Google Cloud Storage bucket, so lifecycle rules (auto-delete after N days) and CDN-style caching are available.`,
      why: `Sending large files through your own API wastes server memory and bandwidth. Direct uploads with rules are faster, cheaper and scale automatically.`,
      analogy: `Instead of handing a parcel to the receptionist (your server) who then walks it to the warehouse, the customer drops it at the warehouse door themselves. A guard at the door (Storage rules) checks the parcel size and label.`,
      code: [
        {
          title: 'Upload a resume with progress',
          lang: 'javascript',
          code: `import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { app, db } from './firebase.js';

const storage = getStorage(app);

export function uploadResume(uid, file, onProgress) {
  const fileRef = ref(storage, \`users/\${uid}/resume.pdf\`);
  const task = uploadBytesResumable(fileRef, file, { contentType: 'application/pdf' });

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (s) => onProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await updateDoc(doc(db, 'users', uid), { resumePath: fileRef.fullPath, resumeUrl: url });
        resolve(url);
      },
    );
  });
}`,
        },
        {
          title: 'storage.rules: owner-only, PDF under 5 MB',
          lang: 'text',
          code: `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{uid}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null && request.auth.uid == uid
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType == 'application/pdf';
    }
  }
}`,
        },
      ],
      output: `While uploading, \`onProgress\` receives 0, 25, 60, 100. When finished, the file path and download URL are saved on the user document and the promise resolves with the URL.

If a user tries to upload a 20 MB file, an image, or into another user's folder, the rules reject it with \`storage/unauthorized\`.`,
      questions: [
        {
          q: 'How do you upload files with Firebase?',
          a: 'Create a storage `ref`, call `uploadBytes` or `uploadBytesResumable`, then save the path or `getDownloadURL` result in Firestore.',
        },
        {
          q: 'How do you restrict file size and type?',
          a: 'In Storage rules with `request.resource.size` and `request.resource.contentType`.',
        },
        {
          q: 'Are download URLs private?',
          a: 'No — anyone with the tokenized URL can read the file. For private files, use rules-protected access or short-lived signed URLs from the server.',
        },
      ],
      spoken: `"For files I use Cloud Storage. The browser uploads directly with uploadBytesResumable, so I get progress events and my server never handles the bytes. Storage rules check that only the owner can write to their folder and limit size and content type. After upload I store the file path, and sometimes the download URL, in Firestore. Download URLs are bearer links, so for private documents like resumes I prefer serving short-lived signed URLs from the server. A Cloud Function on object finalize can generate thumbnails or scan files."`,
      mistakes: [
        'Validating file type and size only in the frontend; rules must enforce it.',
        'Treating `getDownloadURL` links as private.',
        'Saving only the URL and losing the path, which makes later deletes and moves harder.',
        'Follow-up trap: "What happens to the file when you delete the Firestore document?" Nothing — they are separate systems. Delete the file too, for example in an `onDocumentDeleted` function.',
      ],
      takeaway: 'Upload directly from the client, guard with Storage rules, store the path, and use signed URLs for private files.',
    },
    {
      id: 'emulator-offline',
      title: 'Local Emulator Suite and Offline Persistence',
      level: 'intermediate',
      priority: 'good',
      frequency: 'occasional',
      summary: 'Develop and test against local emulators for Auth, Firestore and Functions; enable Firestore\'s local cache so the app works offline and syncs later.',
      what: `**Emulator Suite**: the Firebase CLI can run local versions of Auth, Firestore, Realtime Database, Functions, Storage and more (\`firebase emulators:start\`). Your app connects to them instead of the real project. Benefits: no cost, no risk to real data, fast tests, and you can test **security rules**.

**Offline persistence**: Firestore can keep a local cache (IndexedDB in the browser). Reads come from the cache when offline; writes are queued and sent when the connection returns. Listeners keep working.

#### Deeper version
- Connect with \`connectFirestoreEmulator(db, '127.0.0.1', 8080)\` and \`connectAuthEmulator(auth, 'http://127.0.0.1:9099')\`, only in development.
- Use \`firebase emulators:exec "npm test"\` in CI to start emulators, run tests and stop them.
- On the web, persistence is configured when creating Firestore: \`initializeFirestore(app, { localCache: persistentLocalCache(...) })\`. The older \`enableIndexedDbPersistence\` function is deprecated in newer SDK versions. Mobile SDKs enable persistence by default.
- Offline writes resolve their promise only after the server confirms, so do not \`await\` writes before updating the UI when offline-first matters — rely on listeners and \`hasPendingWrites\`.`,
      why: `Testing against production is slow, costly and dangerous, and rules bugs are security bugs. Offline support makes apps usable on bad mobile networks — a real advantage of Firebase over a plain REST backend.`,
      analogy: `The emulator is a flight simulator: crash as often as you like, nobody gets hurt and it costs nothing. Offline persistence is writing in a notebook during a flight and syncing to the cloud when the plane lands.`,
      code: [
        {
          title: 'Connect to emulators and enable offline cache',
          lang: 'javascript',
          code: `import { initializeApp } from 'firebase/app';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator,
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const app = initializeApp(firebaseConfig);

// Offline cache shared across browser tabs
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
export const auth = getAuth(app);

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}`,
        },
        {
          title: 'Run emulators and tests',
          lang: 'bash',
          code: `# Start local emulators with the UI (default UI port 4000)
firebase emulators:start --only auth,firestore,functions

# In CI: start emulators, run tests, shut down
firebase emulators:exec --only firestore "npm test"`,
        },
      ],
      output: `In development, all reads, writes and sign-ins go to the local emulators; you can inspect data in the Emulator UI and wipe it anytime. In production the same code talks to the real project.

With the persistent cache, if the user loses network, the app still shows cached data, new writes appear instantly in the UI (pending), and they sync automatically when the network returns.`,
      questions: [
        {
          q: 'Why use the Firebase Emulator Suite?',
          a: 'Free, safe local development and automated tests — especially for security rules and Cloud Functions triggers — without touching production data.',
        },
        {
          q: 'How does Firestore work offline?',
          a: 'With a local cache: reads are served from the cache, writes are queued and synced later, and listeners fire with local changes.',
        },
        {
          q: 'How do you enable offline persistence on web in newer SDKs?',
          a: '`initializeFirestore(app, { localCache: persistentLocalCache() })`, optionally with a multi-tab manager. Older code used `enableIndexedDbPersistence`, now deprecated.',
        },
      ],
      spoken: `"I develop against the Firebase Emulator Suite: local Auth, Firestore and Functions, connected only in dev mode. That means no cost, no risk to real data, and I can unit-test security rules. In CI I run tests with emulators exec. For offline support on web, I create Firestore with a persistent local cache and a multi-tab manager. Then reads come from the cache when offline, writes are queued and synced later, and listeners show changes immediately with hasPendingWrites, which makes the app feel fast on bad networks."`,
      mistakes: [
        'Accidentally connecting production builds to emulators, or tests to the real project.',
        'Awaiting a write while offline and freezing the UI — the promise waits for the server.',
        'Copying old `enableIndexedDbPersistence` code without checking it is deprecated in your SDK version.',
        'Follow-up trap: "Can you test Cloud Functions triggers locally?" Yes — the Functions emulator runs triggers when you write to the Firestore emulator.',
      ],
      takeaway: 'Emulators for safe local dev and rules tests; persistent local cache for offline-first apps.',
    },
    {
      id: 'data-modeling-costs',
      title: 'Firestore Data Modeling and Costs (Reads, Writes, Denormalization)',
      level: 'advanced',
      priority: 'must',
      frequency: 'very common',
      summary: 'Model data for your screens, not like SQL tables: denormalize, avoid huge documents, and remember you pay per document read, write and delete.',
      what: `In Firestore you **design data around your queries** (your screens), not around perfect normalized tables.

Billing is mainly:
- **Reads** — every document returned by a get, query or listener update.
- **Writes** and **deletes** — every document changed.
- Plus storage and network. There is a daily free quota; exact prices and quotas change, so check the current pricing page.

So the main rules:
- **Denormalize**: copy small pieces of data where you read them. A post stores \`authorName\` and \`authorPhoto\` so a feed needs 1 read per post, not 2.
- **Subcollections** for lists that grow without limit (messages, orders).
- **Aggregate on write**: keep \`commentCount\` on the post (updated by a function) instead of counting every time.
- **Limit and paginate** every list and listener.

#### Deeper version
- **Fan-out cost**: denormalized data must be updated in many places when it changes (user renames → update all their posts). Do it in a Cloud Function. Copy data that changes **rarely**.
- **Hotspots**: one document handles about **1 sustained write per second**. Use distributed counters for hot counters. Sequential document ids (timestamps) in a high-write collection can also create hotspots — auto ids avoid this.
- **Read amplification traps**: a listener on a busy collection, \`offset\` pagination, rules using \`get()\`, and re-renders that re-create listeners all multiply reads.
- **Many-to-many**: store arrays of ids for small sets (\`memberIds\` with \`array-contains\`), or a join collection (\`memberships/{teamId_userId}\`) for large ones.
- **Cost guardrails**: set budget alerts, watch usage in the console, and cache stable data (for example in memory or with a CDN in front of a function).`,
      why: `Most Firebase horror stories ("we got a huge bill overnight") come from bad modeling: unbounded listeners, N+1 reads, or a loop of triggers. Good modeling keeps the app fast and the bill predictable — interviewers love asking about this trade-off.`,
      analogy: `SQL modeling is like a library with one copy of each book and a catalog to join them. Firestore modeling is like a newspaper: the same photo of the author is printed on every article page, because readers should get everything in one look — and if the author changes their photo, you reprint those pages.`,
      code: [
        {
          title: 'Normalized (N+1 reads) vs denormalized (1 read per post)',
          lang: 'javascript',
          code: `// Normalized: 20 posts + 20 author lookups = 40 reads per feed load
const posts = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20)));
const feed = await Promise.all(posts.docs.map(async (p) => {
  const author = await getDoc(doc(db, 'users', p.data().authorId)); // extra read each time
  return { ...p.data(), authorName: author.data().name };
}));

// Denormalized: the post already carries what the feed needs = 20 reads
// posts/{postId}: { title, authorId, authorName, authorPhoto, commentCount, createdAt }
const feed2 = (await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20))))
  .docs.map((d) => ({ id: d.id, ...d.data() }));`,
        },
        {
          title: 'Keeping copies in sync with a Cloud Function',
          lang: 'javascript',
          code: `import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';

export const syncAuthorName = onDocumentUpdated('users/{uid}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  if (before.name === after.name && before.photoUrl === after.photoUrl) return; // nothing to fan out

  const db = getFirestore();
  const posts = await db.collection('posts').where('authorId', '==', event.params.uid).get();
  const writer = db.bulkWriter();                    // handles batching and retries
  posts.docs.forEach((p) => writer.update(p.ref, { authorName: after.name, authorPhoto: after.photoUrl }));
  await writer.close();
});`,
        },
      ],
      output: `The normalized feed costs about 40 reads per page load and makes 21 network requests. The denormalized feed costs 20 reads with one request — half the cost and much faster. With 10,000 daily users opening the feed 5 times, that difference is about a million reads per day.

When a user changes their name, \`syncAuthorName\` updates all their posts in the background. The early return prevents useless writes (and loops) when other fields of the user change.`,
      questions: [
        {
          q: 'How is Firestore billed?',
          a: 'Per document read, write and delete, plus storage and network egress. Listeners bill one read per document in the first result and per changed document after that.',
        },
        {
          q: 'Why denormalize in Firestore?',
          a: 'There are no joins, and every extra document fetched is a billed read and a network round trip. Copying small, rarely changing fields makes reads cheap and fast.',
        },
        {
          q: 'What is the downside of denormalization?',
          a: 'Updates must fan out to every copy. Handle it in Cloud Functions, and only copy fields that rarely change.',
        },
        {
          q: 'How would you model chat in Firestore?',
          a: '`rooms/{roomId}` with `memberIds` and `lastMessage` (for the room list), and a `messages` subcollection queried with `orderBy(createdAt)` + `limit` and paginated with cursors.',
        },
        {
          q: 'How do you keep a like counter on a viral post?',
          a: 'A single document handles about one write per second sustained, so use a distributed counter with several shard documents and sum them when reading (or periodically aggregate).',
        },
      ],
      spoken: `"In Firestore I model data around my screens, because there are no joins and I pay per document read, write and delete. So I denormalize small, rarely changing fields — like putting the author's name on each post — so a feed is one read per post instead of two. Unbounded lists go in subcollections, counts are kept on the parent with functions, and every query and listener is limited and paginated with cursors. The cost of denormalization is fan-out updates, which I do in Cloud Functions. I also watch for hotspots, about one write per second per document, and use sharded counters there."`,
      mistakes: [
        'Modeling like SQL and doing N+1 lookups for every list item.',
        'Unbounded listeners on whole collections, which re-bill many reads.',
        'Putting everything in one giant document (1 MiB limit, write contention, huge downloads).',
        'Denormalizing fields that change often, creating constant expensive fan-outs.',
        'Follow-up trap: "Does reading a document with a big array cost more reads?" No — one document is one read regardless of size, but you pay more in bandwidth and hit the 1 MiB limit, so big arrays are still a bad idea.',
      ],
      takeaway: 'Model for your reads, denormalize what rarely changes, limit everything, and remember every document touched costs money.',
    },
    {
      id: 'when-to-use-firebase',
      title: 'When to Use Firebase vs a MERN Backend',
      level: 'advanced',
      priority: 'must',
      frequency: 'common',
      summary: 'Firebase wins for fast MVPs, realtime and mobile/offline apps; a MERN backend wins for complex queries, heavy business logic, predictable costs and no vendor lock-in. Many teams mix both.',
      what: `**Choose Firebase when:**
- You need to ship an MVP fast with a small team.
- The app is realtime (chat, live dashboards) or mobile-first with offline needs.
- Auth, push notifications and file uploads are core features.
- Data access patterns are simple and known (per-user data, feeds).

**Choose a MERN (Node + MongoDB) backend when:**
- You need complex queries, aggregations, reporting, joins or full-text search.
- There is heavy business logic, many third-party integrations (Stripe, Twilio, Zoho), or long-running jobs.
- You want predictable costs at scale and full control over infrastructure.
- Avoiding **vendor lock-in** (being tied to one provider) matters.

#### Deeper version
**Hybrid is very common and often best:**
- **Firebase Auth + your Express API**: the client signs in with Firebase, sends the ID token, and Express verifies it with the Admin SDK. You get managed auth with full backend control.
- **MongoDB for core data + Firestore for realtime UI state** (presence, notifications, live status), written by the backend.
- **FCM only** for push, regardless of your backend.

Trade-offs to mention in interviews:
- **Cost model**: Firebase is cheap at small scale and per-operation at large scale; a badly designed listener can be expensive. A server costs a fixed amount and scales in steps.
- **Security model**: Firebase moves authorization into security rules; MERN keeps it in middleware. Rules are powerful but harder to test and review for complex logic.
- **Querying**: MongoDB aggregation pipelines are far richer than Firestore queries.
- **Migration**: moving off Firebase later means rewriting data access and rules, so design boundaries early (a data-access layer).`,
      why: `This is a classic senior-level question. Interviewers want to hear trade-offs and a reasoned decision, not "Firebase is easy" or "MERN is better".`,
      analogy: `Firebase is a furnished apartment: move in today, but you cannot knock down walls and the rent grows with usage. A MERN backend is building your own house: it takes longer, but you control every room. Many people rent first and build later — or rent a furnished studio next to their house for guests (hybrid).`,
      code: [
        {
          title: 'Hybrid: Firebase Auth + Express + MongoDB',
          lang: 'javascript',
          code: `import express from 'express';
import mongoose from 'mongoose';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
await mongoose.connect(process.env.MONGO_URL);
const Order = mongoose.model('Order', new mongoose.Schema({ uid: String, total: Number, status: String }));

const app = express();
app.use(express.json());

app.use(async (req, res, next) => {             // Firebase Auth for identity
  try {
    req.user = await getAuth().verifyIdToken((req.get('Authorization') || '').replace('Bearer ', ''));
    next();
  } catch {
    res.status(401).end();
  }
});

app.post('/orders', async (req, res) => {
  const order = await Order.create({ uid: req.user.uid, total: req.body.total, status: 'paid' }); // MongoDB = source of truth
  // Firestore = realtime UI state the client listens to with onSnapshot
  await getFirestore().doc(\`users/\${req.user.uid}/live/lastOrder\`).set({ id: String(order._id), status: 'paid' });
  res.status(201).json(order);
});

// Complex reporting stays in MongoDB
app.get('/reports/revenue', async (req, res) => {
  const data = await Order.aggregate([{ $group: { _id: '$status', revenue: { $sum: '$total' } } }]);
  res.json(data);
});

app.listen(4000);`,
        },
      ],
      output: `The client signs in with Firebase and calls the API with its ID token. Creating an order saves it in MongoDB (the system of record) and writes a small realtime document to Firestore. The client's \`onSnapshot\` on \`users/{uid}/live/lastOrder\` updates the UI instantly. The revenue report uses a MongoDB aggregation — something Firestore cannot do well.`,
      questions: [
        {
          q: 'When would you choose Firebase over a Node/Mongo backend?',
          a: 'For fast MVPs, realtime or offline-first mobile apps, and when auth, push and uploads are central and queries are simple.',
        },
        {
          q: 'When is Firebase a bad fit?',
          a: 'Complex queries and reporting, heavy server-side business logic, strict cost predictability at high volume, or a strong need to avoid vendor lock-in.',
        },
        {
          q: 'Can you use Firebase Auth with your own backend?',
          a: 'Yes. The client sends the Firebase ID token; the backend verifies it with the Admin SDK and uses the uid. This is a very common hybrid.',
        },
        {
          q: 'How do you reduce lock-in if you start on Firebase?',
          a: 'Put data access behind your own service/repository layer, keep business logic in functions you can move, and avoid spreading Firestore calls through UI components.',
        },
      ],
      spoken: `"I choose Firebase when speed and realtime matter: an MVP with a small team, chat or live dashboards, mobile apps that need offline support, or when auth and push are core. I choose a Node and MongoDB backend when I need complex queries and aggregations, heavy business logic and integrations like Stripe or Twilio, predictable costs at scale, or no vendor lock-in. In practice I often mix them: Firebase Auth for identity, an Express API that verifies ID tokens with the Admin SDK, MongoDB as the source of truth, and Firestore or FCM for realtime updates and notifications."`,
      mistakes: [
        'Answering "Firebase is easier" without discussing cost, querying, security model and lock-in.',
        'Calling Firestore directly from every component, making a later migration very painful.',
        'Assuming Firebase is always cheaper. It is at small scale; per-operation billing can surprise you at large scale.',
        'Follow-up trap: "How would you migrate off Firebase Auth?" Export users with the Admin SDK or CLI (including password hashes and hashing parameters), import them into the new system, and support both token types during the transition.',
      ],
      takeaway: 'Firebase for speed, realtime and mobile; MERN for complex logic and control; a hybrid often gives the best of both.',
    },
  ],
  rapidFire: [
    { q: 'What is Firebase?', a: 'Google\'s Backend-as-a-Service: database, auth, functions, storage, hosting, push.' },
    { q: 'Is the Firebase apiKey secret?', a: 'No. Security comes from rules, Auth and App Check.' },
    { q: 'Why the modular v9+ SDK?', a: 'Function imports enable tree-shaking and smaller bundles.' },
    { q: 'Firestore data structure?', a: 'Collections of documents; documents can have subcollections.' },
    { q: 'Max Firestore document size?', a: '1 MiB.' },
    { q: 'addDoc vs setDoc?', a: 'addDoc creates with an auto id; setDoc writes to a known id (overwrites unless merge).' },
    { q: 'setDoc vs updateDoc?', a: 'updateDoc changes fields and fails if the doc does not exist.' },
    { q: 'Does deleting a doc delete its subcollections?', a: 'No.' },
    { q: 'Safe concurrent counter?', a: '`increment(n)`.' },
    { q: 'Trusted timestamp?', a: '`serverTimestamp()`.' },
    { q: 'When do you need a composite index?', a: 'When a query filters/orders on more than one field.' },
    { q: 'How to paginate Firestore?', a: 'Cursors: `orderBy` + `limit` + `startAfter(lastDoc)`.' },
    { q: 'Query all subcollections named orders?', a: 'A collection group query.' },
    { q: 'Full-text search in Firestore?', a: 'Not supported; sync to Algolia/Typesense/Elasticsearch.' },
    { q: 'Count without reading all docs?', a: '`getCountFromServer(query)`.' },
    { q: 'Realtime updates API?', a: '`onSnapshot`, which returns an unsubscribe function.' },
    { q: 'Why does a listener fire twice for my write?', a: 'Local pending write first, then server confirmation (`hasPendingWrites`).' },
    { q: 'How are listeners billed?', a: 'One read per initial doc, then one per changed doc.' },
    { q: 'RTDB data shape?', a: 'One big JSON tree.' },
    { q: 'RTDB billing?', a: 'Mainly GB stored and downloaded, not per operation.' },
    { q: 'Best tool for online presence?', a: 'RTDB `onDisconnect()` with `.info/connected`.' },
    { q: 'Detect login state on page load?', a: '`onAuthStateChanged`.' },
    { q: 'ID token lifetime?', a: 'About 1 hour, auto-refreshed by the SDK.' },
    { q: 'Roles in Firebase Auth?', a: 'Custom claims set by the Admin SDK.' },
    { q: 'New custom claim not visible?', a: 'Force refresh with `getIdToken(true)`.' },
    { q: 'resource vs request.resource in rules?', a: 'Existing document vs document after the write.' },
    { q: 'Are rules filters?', a: 'No — the query must guarantee every result is allowed.' },
    { q: 'Do rules apply to the Admin SDK?', a: 'No, it bypasses them.' },
    { q: 'Rules for private fields?', a: 'Rules work per document; move private fields to a separate doc.' },
    { q: 'onCall vs onRequest?', a: 'onCall: app calls with auth built in; onRequest: raw HTTP (webhooks).' },
    { q: 'Cloud Function trigger delivery guarantee?', a: 'At least once — make handlers idempotent.' },
    { q: 'Reduce cold starts?', a: '`minInstances`, lighter dependencies, 2nd gen concurrency.' },
    { q: 'Where to store function secrets?', a: 'Secret Manager via `defineSecret`.' },
    { q: 'Verify a Firebase user in Express?', a: '`getAuth().verifyIdToken(token)` from firebase-admin.' },
    { q: 'Check token revocation?', a: '`verifyIdToken(token, true)`.' },
    { q: 'What is an FCM registration token?', a: 'The address of one app instance/browser for push messages.' },
    { q: 'Web push requirements?', a: 'Permission, VAPID key, and `firebase-messaging-sw.js`.' },
    { q: 'FCM data payload rule?', a: 'All values must be strings.' },
    { q: 'Send push to many devices?', a: '`sendEachForMulticast` (up to 500 tokens) or topics.' },
    { q: 'Handle dead FCM tokens?', a: 'Delete tokens that return registration-token-not-registered.' },
    { q: 'Batch vs transaction?', a: 'Batch = atomic writes; transaction = read then write with retries.' },
    { q: 'Transaction rule of order?', a: 'All reads before any writes.' },
    { q: 'Sustained write limit per document?', a: 'About 1 write per second; shard hot counters.' },
    { q: 'Are getDownloadURL links private?', a: 'No — anyone with the URL can read; use signed URLs for private files.' },
    { q: 'Test rules safely?', a: 'Emulator Suite + `@firebase/rules-unit-testing`.' },
    { q: 'Enable offline cache on web (new SDKs)?', a: '`initializeFirestore` with `persistentLocalCache`.' },
    { q: 'Why denormalize in Firestore?', a: 'No joins and every extra doc is a billed read.' },
    { q: 'Cost of denormalization?', a: 'Fan-out updates, usually done in Cloud Functions.' },
    { q: 'Firebase vs MERN in one line?', a: 'Firebase for speed and realtime; MERN for complex logic and control.' },
    { q: 'Common hybrid setup?', a: 'Firebase Auth + Express verifying ID tokens + MongoDB, with FCM for push.' },
  ],
};
