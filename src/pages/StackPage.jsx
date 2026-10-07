import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getStack } from '../data/index.js';
import { useStudy } from '../context/StudyContext.jsx';
import { applyFilters, DEFAULT_FILTERS } from '../lib/filters.js';
import ProgressBar from '../components/ProgressBar.jsx';
import FilterBar from '../components/FilterBar.jsx';
import TopicCard from '../components/TopicCard.jsx';
import RichText from '../components/RichText.jsx';
import NotFound from './NotFound.jsx';

export default function StackPage() {
  const { stackId } = useParams();
  const stack = getStack(stackId);
  const { learned } = useStudy();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  if (!stack) return <NotFound />;

  const done = stack.topics.filter((t) => learned[t.key]).length;
  const shown = applyFilters(stack.topics, filters, learned);
  const firstUnlearned = stack.topics.find((t) => !learned[t.key]) || stack.topics[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {stack.icon} {stack.title}
        </h1>
        {stack.description && <p className="mt-2 text-slate-600 dark:text-slate-400">{stack.description}</p>}
        {stack.definition && (
          <section className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900 dark:bg-indigo-950/30">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
              📖 {stack.definitionTitle || `What is ${stack.title}?`}
            </h2>
            <RichText text={stack.definition} className="text-[15.5px] text-slate-700 dark:text-slate-300" />
          </section>
        )}
        <div className="mt-4 max-w-md">
          <ProgressBar done={done} total={stack.topics.length} label="Your progress" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {firstUnlearned && (
            <Link
              to={`/stack/${stack.id}/${firstUnlearned.id}`}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
            >
              {done ? 'Continue learning →' : 'Start learning →'}
            </Link>
          )}
          {stack.problems.length > 0 && (
            <Link
              to={`/stack/${stack.id}/problems`}
              className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950"
            >
              🧩 Interview Problems ({stack.problems.length})
            </Link>
          )}
          <Link
            to={`/revise?stack=${stack.id}`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
          >
            🃏 Quick Revise
          </Link>
          <Link
            to={`/rapid-fire?stack=${stack.id}`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
          >
            ⚡ Rapid Fire
          </Link>
        </div>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} count={shown.length} />

      <div className="mt-4 space-y-2.5">
        {shown.map((t) => (
          <TopicCard key={t.key} topic={t} index={stack.topics.indexOf(t)} />
        ))}
        {!shown.length && <p className="py-10 text-center text-slate-500">No topics match these filters.</p>}
      </div>
    </div>
  );
}
