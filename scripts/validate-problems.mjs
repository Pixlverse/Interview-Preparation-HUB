// Checks every interview-problems file in src/data/problems/.
// Usage:  node scripts/validate-problems.mjs              (all files)
//         node scripts/validate-problems.mjs react nodejs (only some stacks)
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const dir = join(dataDir, 'problems');
const only = process.argv.slice(2);
const files = (existsSync(dir) ? readdirSync(dir) : [])
  .filter((f) => f.endsWith('.js'))
  .filter((f) => !only.length || only.includes(f.replace(/\.js$/, '')));

const DIFFS = ['easy', 'medium', 'hard'];
const TYPES = ['coding', 'output', 'debug', 'query', 'scenario', 'design'];
const FREQS = ['very common', 'common', 'occasional'];
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
let total = 0;
const err = (f, m) => (errors++, console.log(`  ✗ ${f}: ${m}`));
const warn = (f, m) => (warnings++, console.log(`  ! ${f}: ${m}`));

for (const file of files) {
  let data;
  try {
    data = (await import(pathToFileURL(join(dir, file)).href)).default;
  } catch (e) {
    err(file, `cannot import: ${e.message}`);
    continue;
  }
  if (!data || !data.stackId || !Array.isArray(data.problems)) {
    err(file, 'default export must be { stackId, problems: [] }');
    continue;
  }
  if (`${data.stackId}.js` !== file) err(file, `stackId "${data.stackId}" should match file name`);
  let topicIds = new Set();
  const stackFile = join(dataDir, `${data.stackId}.js`);
  if (!existsSync(stackFile)) err(file, `no stack file src/data/${data.stackId}.js`);
  else topicIds = new Set((await import(pathToFileURL(stackFile).href)).default.topics.map((t) => t.id));

  const counts = { easy: 0, medium: 0, hard: 0 };
  const ids = new Set();
  data.problems.forEach((p, i) => {
    const where = `${file} › ${p.id || `problem #${i + 1}`}`;
    if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) err(where, 'id must be kebab-case');
    if (ids.has(p.id)) err(where, 'duplicate id');
    ids.add(p.id);
    for (const f of ['title', 'question', 'solution'])
      if (typeof p[f] !== 'string' || !p[f].trim()) err(where, `missing "${f}"`);
    if (!DIFFS.includes(p.difficulty)) err(where, `difficulty must be one of ${DIFFS.join('/')}`);
    else counts[p.difficulty]++;
    if (!TYPES.includes(p.type)) err(where, `type must be one of ${TYPES.join('/')}`);
    if (!FREQS.includes(p.frequency)) err(where, `frequency must be one of ${FREQS.join('/')}`);
    if (!Array.isArray(p.hints) || p.hints.length < 1 || p.hints.some((h) => typeof h !== 'string' || !h.trim()))
      err(where, 'needs 1-3 non-empty hints');
    if (!Array.isArray(p.followUps) || p.followUps.length < 1) err(where, 'needs at least 1 follow-up');
    else p.followUps.forEach((q, j) => (!q.q || !q.a) && err(where, `follow-up ${j + 1} needs q and a`));
    if (p.relatedTopic && !topicIds.has(p.relatedTopic)) warn(where, `relatedTopic "${p.relatedTopic}" not found in ${data.stackId}.js`);
    const fences = (p.solution || '').match(/```/g)?.length || 0;
    if (fences % 2) err(where, 'unclosed ``` code fence in solution');
    if (((p.question || '').match(/```/g)?.length || 0) % 2) err(where, 'unclosed ``` code fence in question');
    if ([p.question, p.solution, ...(p.hints || []), ...(p.followUps || []).map((f) => f.a)].some(nestedFence)) err(where, 'nested ``` code fence (a code block inside a code block) — it breaks rendering');
    if (BANNED.test(JSON.stringify(p))) warn(where, 'contains TODO/TBD/placeholder text');
  });
  total += data.problems.length;
  console.log(`🧩 ${data.stackId} — ${data.problems.length} problems (easy ${counts.easy}, medium ${counts.medium}, hard ${counts.hard})`);
}

console.log(`\n${files.length} problem files, ${total} problems, ${errors} errors, ${warnings} warnings`);
process.exit(errors ? 1 : 0);
