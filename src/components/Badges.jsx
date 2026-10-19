import { LEVEL_LABEL, PRIORITY_LABEL } from '../data/index.js';
import { FOCUS_KEYS } from '../lib/focus.js';

const LEVEL_STYLE = {
  basic: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900',
  intermediate: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900',
  advanced: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900',
};

const PRIORITY_STYLE = {
  must: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900',
  good: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900',
  rare: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
};

const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap';

export const LEVEL_DOT = {
  basic: 'bg-emerald-500',
  intermediate: 'bg-sky-500',
  advanced: 'bg-violet-500',
};

export function LevelBadge({ level }) {
  return <span className={`${base} ${LEVEL_STYLE[level] || PRIORITY_STYLE.rare}`}>{LEVEL_LABEL[level] || level}</span>;
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`${base} ${PRIORITY_STYLE[priority] || PRIORITY_STYLE.rare}`}>
      {PRIORITY_LABEL[priority] || priority}
    </span>
  );
}

export function FrequencyNote({ frequency }) {
  if (!frequency) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
      🎯 Asked: <span className="font-medium">{frequency}</span>
    </span>
  );
}

export function FocusBadge({ topicKey }) {
  if (!FOCUS_KEYS.has(topicKey)) return null;
  return (
    <span
      className={`${base} bg-orange-100 text-orange-800 ring-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:ring-orange-800`}
      title="On your interview focus list"
    >
      🔥 Interview focus
    </span>
  );
}

export function TopicBadges({ topic }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <FocusBadge topicKey={topic.key} />
      <LevelBadge level={topic.level} />
      <PriorityBadge priority={topic.priority} />
      <FrequencyNote frequency={topic.frequency} />
    </div>
  );
}
