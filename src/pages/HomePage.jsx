import { Link } from 'react-router-dom';
import { allProblems, allTopics, stacks, PRIORITY_LABEL } from '../data/index.js';
import { useStudy } from '../context/StudyContext.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

export default function HomePage() {
  const { learned, bookmarks, solved, lastVisited, resetProgress } = useStudy();
  const solvedCount = allProblems.filter((p) => solved[p.key]).length;
  const done = allTopics.filter((t) => learned[t.key]).length;
  const mustTopics = allTopics.filter((t) => t.priority === 'must');
  const mustDone = mustTopics.filter((t) => learned[t.key]).length;

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Your interview prep 📘</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Simple explanations, basic → advanced. Learn a topic, tick it off, and revise with flip cards and rapid-fire Q&A.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="text-sm text-slate-500">Overall</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">
            {done}
            <span className="text-base font-medium text-slate-400"> / {allTopics.length}</span>
          </div>
          <div className="mt-2">
            <ProgressBar done={done} total={allTopics.length} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="text-sm text-slate-500">{PRIORITY_LABEL.must} topics</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">
            {mustDone}
            <span className="text-base font-medium text-slate-400"> / {mustTopics.length}</span>
          </div>
          <div className="mt-2">
            <ProgressBar done={mustDone} total={mustTopics.length} />
          </div>
        </div>
        <Link
          to="/problems"
          className="rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700"
        >
          <div className="text-sm text-slate-500">Problems solved</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">
            {solvedCount}
            <span className="text-base font-medium text-slate-400"> / {allProblems.length}</span>
          </div>
          <div className="mt-2">
            <ProgressBar done={solvedCount} total={allProblems.length} />
          </div>
        </Link>
        <Link
          to="/bookmarks"
          className="rounded-2xl border border-slate-200 p-4 hover:border-amber-300 dark:border-slate-800 dark:hover:border-amber-800"
        >
          <div className="text-sm text-slate-500">Saved to revise</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">★ {Object.keys(bookmarks).length}</div>
          <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">Open bookmarks →</div>
        </Link>
      </div>

      {lastVisited && (
        <Link
          to={`/stack/${lastVisited.stackId}/${lastVisited.topicId}`}
          className="mt-4 flex items-center justify-between rounded-2xl bg-indigo-600 px-5 py-4 text-white hover:bg-indigo-700"
        >
          <div>
            <div className="text-xs uppercase tracking-wide text-indigo-200">Continue where you left off</div>
            <div className="font-semibold">{lastVisited.title}</div>
          </div>
          <span className="text-xl">→</span>
        </Link>
      )}

      <h2 className="mt-10 mb-3 text-lg font-bold">All stacks</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {stacks.map((s) => {
          const d = s.topics.filter((t) => learned[t.key]).length;
          return (
            <Link
              key={s.id}
              to={`/stack/${s.id}`}
              className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-indigo-700"
            >
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <span className="text-xl">{s.icon}</span>
                {s.title}
              </div>
              {s.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{s.description}</p>}
              <div className="mt-3">
                <ProgressBar done={d} total={s.topics.length} label={`${s.topics.length} topics`} />
              </div>
            </Link>
          );
        })}
      </div>

      {done > 0 && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => window.confirm('Reset all "learned" ticks? Bookmarks are kept.') && resetProgress()}
            className="text-xs text-slate-400 hover:text-rose-500 hover:underline"
          >
            Reset progress
          </button>
        </div>
      )}
    </div>
  );
}
