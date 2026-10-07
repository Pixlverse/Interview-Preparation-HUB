import { useState } from 'react';
import { Link } from 'react-router-dom';
import { allTopics, getStack } from '../data/index.js';
import { useStudy } from '../context/StudyContext.jsx';
import { applyFilters, DEFAULT_FILTERS } from '../lib/filters.js';
import FilterBar from '../components/FilterBar.jsx';
import TopicCard from '../components/TopicCard.jsx';

export default function BookmarksPage() {
  const { bookmarks, learned } = useStudy();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const saved = allTopics
    .filter((t) => bookmarks[t.key])
    .sort((a, b) => bookmarks[b.key] - bookmarks[a.key]);
  const shown = applyFilters(saved, filters, learned);

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">★ Bookmarks</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Topics you starred to revise later. Newest first.</p>

      {saved.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
          No bookmarks yet. Tap the ☆ star on any topic to save it here.
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <Link
              to="/revise?stack=bookmarks"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
            >
              🃏 Revise bookmarks as flip cards
            </Link>
          </div>
          <div className="mt-4">
            <FilterBar filters={filters} setFilters={setFilters} count={shown.length} />
          </div>
          <div className="mt-4 space-y-2.5">
            {shown.map((t) => (
              <TopicCard key={t.key} topic={t} stackTitle={getStack(t.stackId)?.title} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
