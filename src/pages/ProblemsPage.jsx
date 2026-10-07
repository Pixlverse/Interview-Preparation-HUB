import { useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
  DIFFICULTIES,
  DIFFICULTY_LABEL,
  PROBLEM_TYPES,
  PROBLEM_TYPE_LABEL,
  allProblems,
  getStack,
  stacks,
} from '../data/index.js';
import { useStudy } from '../context/StudyContext.jsx';
import ProblemCard from '../components/ProblemCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import NotFound from './NotFound.jsx';

const DEFAULT = { difficulty: 'all', type: 'all', status: 'all' };

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-1.5 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

// Used for both /stack/:stackId/problems (one stack) and /problems (every stack).
export default function ProblemsPage() {
  const { stackId } = useParams();
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const { solved } = useStudy();
  const [f, setF] = useState(DEFAULT);

  const pickedStack = stackId || params.get('stack') || 'all';
  const stack = pickedStack === 'all' ? null : getStack(pickedStack);
  if (stackId && !stack) return <NotFound />;

  const base = stack ? stack.problems : allProblems;
  const types = PROBLEM_TYPES.filter((t) => base.some((p) => p.type === t));
  const shown = base.filter(
    (p) =>
      (f.difficulty === 'all' || p.difficulty === f.difficulty) &&
      (f.type === 'all' || p.type === f.type) &&
      (f.status === 'all' || (f.status === 'solved' ? solved[p.key] : !solved[p.key]))
  );
  const done = base.filter((p) => solved[p.key]).length;
  const openId = hash ? decodeURIComponent(hash.slice(1)) : null;
  const set = (k) => (v) => setF({ ...f, [k]: v });

  return (
    <div>
      {stack && (
        <nav className="mb-4 text-sm text-slate-500">
          <Link to={`/stack/${stack.id}`} className="hover:text-indigo-600 hover:underline">
            {stack.icon} {stack.title}
          </Link>
          <span> › Interview problems</span>
        </nav>
      )}
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        🧩 {stack ? `${stack.title} — Interview Problems` : 'Practice Problems'}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Real problems interviewers give. Try it yourself first, open hints one by one, then check the solution and the
        follow-up questions.
      </p>
      <div className="mt-4 max-w-md">
        <ProgressBar done={done} total={base.length} label="Solved" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
        {!stackId && (
          <Select
            label="Stack"
            value={pickedStack}
            onChange={(v) => setParams(v === 'all' ? {} : { stack: v })}
            options={[
              ['all', 'All stacks'],
              ...stacks.filter((s) => s.problems.length).map((s) => [s.id, `${s.icon} ${s.title}`]),
            ]}
          />
        )}
        <Select
          label="Difficulty"
          value={f.difficulty}
          onChange={set('difficulty')}
          options={[['all', 'All'], ...DIFFICULTIES.map((d) => [d, DIFFICULTY_LABEL[d]])]}
        />
        <Select
          label="Type"
          value={f.type}
          onChange={set('type')}
          options={[['all', 'All'], ...types.map((t) => [t, PROBLEM_TYPE_LABEL[t]])]}
        />
        <Select
          label="Status"
          value={f.status}
          onChange={set('status')}
          options={[
            ['all', 'All'],
            ['unsolved', 'Not solved'],
            ['solved', 'Solved'],
          ]}
        />
        <span className="ml-auto text-xs text-slate-500">{shown.length} shown</span>
      </div>

      <div className="mt-4 space-y-2.5">
        {shown.map((p) => (
          <ProblemCard
            key={p.key}
            problem={p}
            index={stack ? stack.problems.indexOf(p) : undefined}
            stackTitle={stack ? undefined : getStack(p.stackId)?.title}
            defaultOpen={openId === p.id}
          />
        ))}
        {!shown.length && (
          <p className="py-10 text-center text-slate-500">
            {base.length ? 'No problems match these filters.' : 'No problems for this stack yet.'}
          </p>
        )}
      </div>
    </div>
  );
}
