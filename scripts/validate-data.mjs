// Checks every stack data file for missing fields and common mistakes.
// Usage:  npm run validate              (all files)
//         node scripts/validate-data.mjs react nodejs   (only some stacks)
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const only = process.argv.slice(2);
const files = readdirSync(dataDir)
  .filter((f) => f.endsWith('.js') && f !== 'index.js')
  .filter((f) => !only.length || only.includes(f.replace(/\.js$/, '')));

const LEVELS = ['basic', 'intermediate', 'advanced'];
const PRIORITIES = ['must', 'good', 'rare'];
const FREQS = ['very common', 'common', 'occasional'];
const TEXT_FIELDS = ['title', 'summary', 'what', 'why', 'analogy', 'output', 'spoken', 'takeaway'];
const BANNED = /\b(TODO|TBD|FIXME)\b|lorem ipsum|coming soon/;


// A fenced block can't contain another fence: the renderer would close the outer block early.
// An opening-style fence (with a language, e.g. ```js) found while already inside a block means nesting.
function nestedFence(text) {
  let inside = false;
  for (const line of String(text || '').split('\n')) {
    const m = line.trim().match(/^```(.*)$/);
    if (!m) continue;
    if (inside && m[1].trim()) return true;
    inside = !inside;
  }
  return false;
}

let errors = 0;
let warnings = 0;
let totalTopics = 0;
const err = (f, m) => (errors++, console.log(`  ✗ ${f}: ${m}`));
const warn = (f, m) => (warnings++, console.log(`  ! ${f}: ${m}`));

for (const file of files) {
  let stack;
  try {
    stack = (await import(pathToFileURL(join(dataDir, file)).href)).default;
  } catch (e) {
    err(file, `cannot import: ${e.message}`);
    continue;
  }
  if (!stack || !stack.id || !stack.title || !Array.isArray(stack.topics)) {
    err(file, 'default export must be { id, title, icon, description, definitionTitle, definition, topics: [], rapidFire: [] }');
    continue;
  }
  if (`${stack.id}.js` !== file) err(file, `stack id "${stack.id}" should match file name`);
  if (typeof stack.definition !== 'string' || !stack.definition.trim()) err(file, 'missing stack "definition" (shown as "What is …?" on the stack page)');
  console.log(`${stack.icon || ''} ${stack.title} (${file}) — ${stack.topics.length} topics, ${stack.rapidFire?.length || 0} rapid-fire`);
  totalTopics += stack.topics.length;

  const ids = new Set();
  let lastLevel = 0;
  stack.topics.forEach((t, i) => {
    const where = `${file} › ${t.id || `topic #${i + 1}`}`;
    if (!t.id || !/^[a-z0-9-]+$/.test(t.id)) err(where, 'id must be kebab-case');
    if (ids.has(t.id)) err(where, 'duplicate id');
    ids.add(t.id);
    for (const f of TEXT_FIELDS) if (typeof t[f] !== 'string' || !t[f].trim()) err(where, `missing "${f}"`);
    if (!LEVELS.includes(t.level)) err(where, `level must be one of ${LEVELS.join('/')}`);
    if (!PRIORITIES.includes(t.priority)) err(where, `priority must be one of ${PRIORITIES.join('/')}`);
    if (!FREQS.includes(t.frequency)) err(where, `frequency must be one of ${FREQS.join('/')}`);
    const lv = LEVELS.indexOf(t.level);
    if (lv < lastLevel) warn(where, 'topics should be ordered basic → intermediate → advanced');
    lastLevel = Math.max(lastLevel, lv);
    const code = Array.isArray(t.code) ? t.code : [];
    if (!code.length || code.some((c) => !c || typeof c.code !== 'string' || !c.code.trim()))
      err(where, '"code" must be a non-empty array of { title, lang, code }');
    if (!Array.isArray(t.questions) || t.questions.length < 3) err(where, 'needs at least 3 interview questions');
    else t.questions.forEach((q, j) => (!q.q || !q.a) && err(where, `question ${j + 1} needs q and a`));
    if (!Array.isArray(t.mistakes) || t.mistakes.length < 2) err(where, 'needs at least 2 mistakes/traps');
    if ([t.what, t.why, t.analogy, t.output, t.spoken, ...(t.questions || []).map((q) => q.a), ...(t.mistakes || [])].some(nestedFence)) err(where, 'nested ``` code fence (a code block inside a code block) — it breaks rendering');
    if (BANNED.test(JSON.stringify(t))) warn(where, 'contains TODO/TBD/placeholder text');
  });
  (stack.rapidFire || []).forEach((r, j) => (!r.q || !r.a) && err(file, `rapidFire ${j + 1} needs q and a`));
}

console.log(`\n${files.length} files, ${totalTopics} topics, ${errors} errors, ${warnings} warnings`);
process.exit(errors ? 1 : 0);
