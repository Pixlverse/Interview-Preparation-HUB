import { useStudy } from '../context/StudyContext.jsx';

// "Mark as learned" checkbox + bookmark star. Used on cards and the topic page.
export function LearnedCheckbox({ topicKey, compact = false }) {
  const { learned, toggleLearned } = useStudy();
  const checked = !!learned[topicKey];
  return (
    <label
      className={`inline-flex cursor-pointer select-none items-center gap-2 rounded-lg ${
        compact ? '' : 'border px-3 py-1.5 text-sm'
      } ${
        checked && !compact
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        className="h-4 w-4 accent-emerald-600"
        checked={checked}
        onChange={() => toggleLearned(topicKey)}
        aria-label="Mark as learned"
      />
      {!compact && (checked ? 'Learned' : 'Mark as learned')}
    </label>
  );
}

export function BookmarkStar({ topicKey, withLabel = false }) {
  const { bookmarks, toggleBookmark } = useStudy();
  const on = !!bookmarks[topicKey];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(topicKey);
      }}
      title={on ? 'Remove from Revise later' : 'Revise later'}
      aria-pressed={on}
      className={`inline-flex items-center gap-1.5 rounded-lg ${
        withLabel ? 'border px-3 py-1.5 text-sm' : 'p-1'
      } ${
        on
          ? 'border-amber-300 text-amber-500 dark:border-amber-800'
          : 'border-slate-300 text-slate-400 hover:text-amber-500 dark:border-slate-700'
      }`}
    >
      <span className="text-lg leading-none">{on ? '★' : '☆'}</span>
      {withLabel && <span className={on ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-300'}>{on ? 'Saved to revise' : 'Revise later'}</span>}
    </button>
  );
}
