import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allTopics, getStack, stacks } from '../data/index.js';
import { useStudy } from '../context/StudyContext.jsx';
import { applyFilters, DEFAULT_FILTERS } from '../lib/filters.js';
import FilterBar from '../components/FilterBar.jsx';
import FlipCard from '../components/FlipCard.jsx';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuickRevisePage() {
  const [params, setParams] = useSearchParams();
  const source = params.get('stack') || 'all';
  const { learned, bookmarks } = useStudy();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [seed, setSeed] = useState(0);

  const base = useMemo(() => {
    if (source === 'all') return allTopics;
    if (source === 'bookmarks') return allTopics.filter((t) => bookmarks[t.key]);
    return getStack(source)?.topics || [];
  }, [source, bookmarks]);

  const filtered = applyFilters(base, filters, learned);
  // Re-shuffle only when the user asks (seed changes) or the list changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cards = useMemo(() => (seed ? shuffle(filtered) : filtered), [seed, filtered.map((t) => t.key).join()]);

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">🃏 Quick Revise</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Front: the one-line summary. Tap a card to see the 30-second answer you can say out loud.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <select
          value={source}
          onChange={(e) => setParams({ stack: e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          aria-label="Choose what to revise"
        >
          <option value="all">All stacks</option>
          <option value="bookmarks">★ Bookmarks only</option>
          {stacks.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          🔀 Shuffle
        </button>
        {seed > 0 && (
          <button type="button" onClick={() => setSeed(0)} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            Original order
          </button>
        )}
      </div>

      <div className="mt-3">
        <FilterBar filters={filters} setFilters={setFilters} count={cards.length} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cards.map((t) => (
          <FlipCard key={t.key} topic={t} stackTitle={getStack(t.stackId)?.title} />
        ))}
      </div>
      {!cards.length && <p className="py-10 text-center text-slate-500">No cards match. Try another stack or filter.</p>}
    </div>
  );
}
