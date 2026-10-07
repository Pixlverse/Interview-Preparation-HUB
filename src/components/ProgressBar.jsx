export default function ProgressBar({ done, total, label, size = 'md' }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const h = size === 'sm' ? 'h-1' : 'h-2';
  return (
    <div className="w-full">
      {label !== undefined && (
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">{label}</span>
          <span className="shrink-0 tabular-nums">
            {done}/{total} · {pct}%
          </span>
        </div>
      )}
      <div
        className={`${h} w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${h} rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
