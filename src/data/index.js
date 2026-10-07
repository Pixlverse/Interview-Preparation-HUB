// Central registry of all stacks.
// Every file in this folder (except this one) that default-exports a stack object
// is picked up automatically. STACK_ORDER controls the order in the sidebar;
// files not listed there are appended at the end.

const modules = import.meta.glob('./*.js', { eager: true });
// Interview problems live in ./problems/<stack-id>.js (one file per stack).
const problemModules = import.meta.glob('./problems/*.js', { eager: true });
const problemsByStack = Object.fromEntries(
  Object.values(problemModules)
    .map((m) => m.default)
    .filter((p) => p && p.stackId && Array.isArray(p.problems))
    .map((p) => [p.stackId, p.problems])
);

export const STACK_ORDER = [
  'javascript',
  'typescript',
  'html-css',
  'react',
  'nextjs',
  'redux',
  'ui-libraries',
  'nodejs',
  'express',
  'api-design',
  'mongodb',
  'postgresql',
  'redis',
  'firebase',
  'cloud-devops',
  'architecture',
  'payments',
  'ai-llm',
  'twilio-zoho-jitsi',
  'testing',
  'tools',
  'security',
  'web-performance',
  'machine-coding',
  'js-output',
  'dsa',
  'resume',
  'hr',
];

export const LEVELS = ['basic', 'intermediate', 'advanced'];
export const PRIORITIES = ['must', 'good', 'rare'];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
export const PROBLEM_TYPES = ['coding', 'output', 'debug', 'query', 'scenario', 'design'];
export const PROBLEM_TYPE_LABEL = {
  coding: 'Coding',
  output: 'Predict output',
  debug: 'Find the bug',
  query: 'Write a query',
  scenario: 'Scenario',
  design: 'Design',
};

export const LEVEL_LABEL = { basic: 'Basic', intermediate: 'Intermediate', advanced: 'Advanced' };
export const PRIORITY_LABEL = { must: 'Must know', good: 'Good to know', rare: 'Rare' };

const levelRank = (l) => {
  const i = LEVELS.indexOf(l);
  return i === -1 ? 99 : i;
};

const loaded = Object.entries(modules)
  .filter(([path]) => path !== './index.js')
  .map(([, mod]) => mod.default)
  .filter((s) => s && s.id && Array.isArray(s.topics));

loaded.sort((a, b) => {
  const ia = STACK_ORDER.indexOf(a.id);
  const ib = STACK_ORDER.indexOf(b.id);
  return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
});

// Topics are always shown BASIC -> INTERMEDIATE -> ADVANCED.
// The sort is stable, so the author's order is kept inside each level.
export const stacks = loaded.map((s) => ({
  ...s,
  topics: [...s.topics]
    .sort((a, b) => levelRank(a.level) - levelRank(b.level))
    .map((t) => ({ ...t, stackId: s.id, key: `${s.id}/${t.id}` })),
  // Problems are shown easy -> medium -> hard (stable, so the author's order is kept inside each level).
  problems: [...(problemsByStack[s.id] || [])]
    .sort((a, b) => DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty))
    .map((p) => ({ ...p, stackId: s.id, key: `${s.id}/p/${p.id}` })),
}));

export const allProblems = stacks.flatMap((s) => s.problems);

export const allTopics = stacks.flatMap((s) => s.topics);

export const getStack = (id) => stacks.find((s) => s.id === id);

export const getTopic = (stackId, topicId) =>
  getStack(stackId)?.topics.find((t) => t.id === topicId);

// Rapid-fire list for a stack: the hand-written list plus, as a fallback,
// the first interview question of every topic.
export const getRapidFire = (stack) => {
  if (stack.rapidFire && stack.rapidFire.length) return stack.rapidFire;
  return stack.topics
    .filter((t) => t.questions && t.questions.length)
    .map((t) => ({ q: t.questions[0].q, a: t.questions[0].a }));
};
