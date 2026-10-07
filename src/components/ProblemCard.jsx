import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import RichText from './RichText.jsx';
import { DIFFICULTY_LABEL, PROBLEM_TYPE_LABEL, getTopic } from '../data/index.js';
import { useStudy } from '../context/StudyContext.jsx';

const DIFF_STYLE = {
  easy: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900',
  hard: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900',
};
const pill = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap';
const btn =
  'rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800';

export function DifficultyBadge({ difficulty }) {
  return <span className={`${pill} ${DIFF_STYLE[difficulty] || DIFF_STYLE.easy}`}>{DIFFICULTY_LABEL[difficulty] || difficulty}</span>;
}

// One interview problem: question first, then hints one at a time, then the full solution.
export default function ProblemCard({ problem, index, stackTitle, defaultOpen = false }) {
  const { solved, toggleSolved } = useStudy();
  const [open, setOpen] = useState(defaultOpen);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const ref = useRef(null);
  const isSolved = !!solved[problem.key];
  const hints = problem.hints || [];
  const related = problem.relatedTopic ? getTopic(problem.stackId, problem.relatedTopic) : null;

  useEffect(() => {
    if (defaultOpen) ref.current?.scrollIntoView({ block: 'start' });
  }, [defaultOpen]);

  return (
    <div
      ref={ref}
      id={problem.id}
      className={`scroll-mt-4 rounded-xl border bg-white dark:bg-slate-900 ${
        isSolved ? 'border-emerald-300 dark:border-emerald-900' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span className={`mt-0.5 text-sm ${isSolved ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>
          {isSolved ? '✔' : '○'}
        </span>
        <div className="min-w-0 flex-1">
          {stackTitle && (
            <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              {stackTitle}
            </div>
          )}
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {index !== undefined && <span className="mr-1.5 text-slate-400">{index + 1}.</span>}
            {problem.title}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className={`${pill} bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700`}>
              {PROBLEM_TYPE_LABEL[problem.type] || problem.type}
            </span>
            {problem.frequency && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">🎯 Asked: {problem.frequency}</span>
            )}
          </div>
        </div>
        <span className={`mt-1 text-xs text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
      </button>

      {open && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3 dark:border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">The problem</div>
          <RichText text={problem.question} className="mt-1 text-[15px] text-slate-800 dark:text-slate-200" />

          {hints.slice(0, hintsShown).map((h, i) => (
            <div
              key={i}
              className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-sm dark:border-amber-900/70 dark:bg-amber-950/20"
            >
              <span className="font-semibold text-amber-700 dark:text-amber-300">💡 Hint {i + 1}: </span>
              <RichText text={h} className="inline [&>p]:inline" />
            </div>
          ))}

          <div className="mt-4 flex flex-wrap gap-2">
            {hintsShown < hints.length && !showSolution && (
              <button type="button" className={btn} onClick={() => setHintsShown((n) => n + 1)}>
                💡 Show hint {hintsShown + 1} of {hints.length}
              </button>
            )}
            <button type="button" className={btn} onClick={() => setShowSolution((s) => !s)}>
              {showSolution ? '🙈 Hide solution' : '✅ Show solution'}
            </button>
            <label
              className={`inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                isSolved
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-emerald-600"
                checked={isSolved}
                onChange={() => toggleSolved(problem.key)}
                aria-label="Mark problem as solved"
              />
              {isSolved ? 'Solved' : 'Mark solved'}
            </label>
          </div>

          {showSolution && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Solution
              </div>
              <RichText text={problem.solution} className="text-[15px] text-slate-800 dark:text-slate-200" />

              {problem.followUps?.length > 0 && (
                <div className="mt-5">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Follow-up questions the interviewer may ask
                  </div>
                  <div className="space-y-2">
                    {problem.followUps.map((f, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                        <div className="font-medium text-slate-900 dark:text-slate-100">↳ {f.q}</div>
                        <RichText text={f.a} className="mt-1 text-sm text-slate-700 dark:text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {related && (
                <Link
                  to={`/stack/${problem.stackId}/${related.id}`}
                  className="mt-4 inline-block text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-300"
                >
                  📚 Revise the topic: {related.title} →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
