import { allProblems, allTopics, getStack } from '../data/index.js';

// Build a lowercase text index once, so typing stays fast.
const index = allTopics.map((t) => ({
  topic: t,
  title: t.title.toLowerCase(),
  summary: (t.summary || '').toLowerCase(),
  body: [
    t.what,
    t.why,
    t.analogy,
    t.spoken,
    t.takeaway,
    ...(t.questions || []).map((q) => q.q + ' ' + q.a),
    ...(t.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase(),
}));

export function searchTopics(query, limit = 60) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  const results = [];
  for (const item of index) {
    let score = 0;
    let allFound = true;
    for (const w of words) {
      let s = 0;
      if (item.title.includes(w)) s += 10;
      if (item.summary.includes(w)) s += 4;
      if (item.body.includes(w)) s += 1;
      if (s === 0) allFound = false;
      score += s;
    }
    if (item.title.includes(q)) score += 15;
    if (allFound && score > 0) results.push({ topic: item.topic, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((r) => ({ ...r.topic, stackTitle: getStack(r.topic.stackId)?.title }));
}

const problemIndex = allProblems.map((p) => ({
  problem: p,
  title: p.title.toLowerCase(),
  body: [p.question, ...(p.tags || [])].filter(Boolean).join(' ').toLowerCase(),
}));

export function searchProblems(query, limit = 30) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  const results = [];
  for (const item of problemIndex) {
    let score = 0;
    let allFound = true;
    for (const w of words) {
      let s = 0;
      if (item.title.includes(w)) s += 10;
      if (item.body.includes(w)) s += 1;
      if (s === 0) allFound = false;
      score += s;
    }
    if (item.title.includes(q)) score += 15;
    if (allFound && score > 0) results.push({ problem: item.problem, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((r) => ({ ...r.problem, stackTitle: getStack(r.problem.stackId)?.title }));
}
