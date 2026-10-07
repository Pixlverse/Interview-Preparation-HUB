import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRapidFire, getStack, stacks } from '../data/index.js';
import RichText from '../components/RichText.jsx';

export default function RapidFirePage() {
  const [params, setParams] = useSearchParams();
  const stackId = params.get('stack') || stacks[0]?.id;
  const stack = getStack(stackId) || stacks[0];
  const [revealAll, setRevealAll] = useState(false);
  const [open, setOpen] = useState({});
  const [order, setOrder] = useState(null);

  const items = useMemo(() => (stack ? getRapidFire(stack) : []), [stack]);
  const list = order ? order.map((i) => items[i]).filter(Boolean) : items;

  const choose = (id) => {
    setParams({ stack: id });
    setOpen({});
    setOrder(null);
    setRevealAll(false);
  };

  const shuffle = () => {
    const idx = items.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    setOrder(idx);
    setOpen({});
  };

  if (!stack) return null;

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">⚡ Rapid Fire</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        One-line questions for last-minute revision. Answer in your head, then tap to check.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <select
          value={stack.id}
          onChange={(e) => choose(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          aria-label="Choose stack"
        >
          {stacks.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setRevealAll((r) => !r)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          {revealAll ? '🙈 Hide answers' : '👀 Show all answers'}
        </button>
        <button
          type="button"
          onClick={shuffle}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          🔀 Shuffle
        </button>
        <span className="ml-auto text-xs text-slate-500">{list.length} questions</span>
      </div>

      <ol className="mt-6 space-y-2">
        {list.map((item, i) => {
          const shown = revealAll || open[i];
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
                aria-expanded={!!shown}
              >
                <div className="flex gap-3">
                  <span className="shrink-0 font-mono text-sm text-slate-400 tabular-nums">{i + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{item.q}</div>
                    {shown ? (
                      <RichText text={item.a} className="mt-2 text-slate-700 dark:text-slate-300" />
                    ) : (
                      <div className="mt-1 text-xs text-slate-400">Tap to reveal</div>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
