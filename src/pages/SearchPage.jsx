import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { searchProblems, searchTopics } from '../lib/search.js';
import TopicCard from '../components/TopicCard.jsx';
import { DifficultyBadge } from '../components/ProblemCard.jsx';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const results = searchTopics(q);
  const problems = searchProblems(q);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Search</h1>
      {!q.trim() ? (
        <p className="mt-2 text-slate-500">Type in the search box above to search every stack and topic.</p>
      ) : (
        <>
          <p className="mt-2 text-slate-500">
            {results.length} topic{results.length === 1 ? '' : 's'} and {problems.length} problem
            {problems.length === 1 ? '' : 's'} for “{q}”
          </p>
          <div className="mt-4 space-y-2.5">
            {results.map((t) => (
              <TopicCard key={t.key} topic={t} stackTitle={t.stackTitle} />
            ))}
          </div>
          {problems.length > 0 && (
            <>
              <h2 className="mt-8 mb-3 text-lg font-bold">🧩 Interview problems</h2>
              <div className="space-y-2">
                {problems.map((p) => (
                  <Link
                    key={p.key}
                    to={`/stack/${p.stackId}/problems#${p.id}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                        {p.stackTitle}
                      </div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{p.title}</div>
                    </div>
                    <DifficultyBadge difficulty={p.difficulty} />
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
