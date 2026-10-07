import { useState } from 'react';
import { Link } from 'react-router-dom';
import RichText from './RichText.jsx';
import { LevelBadge, PriorityBadge } from './Badges.jsx';
import { BookmarkStar } from './TopicActions.jsx';

// Front: topic + one-line summary. Back: the 30-second spoken answer.
export default function FlipCard({ topic, stackTitle }) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((f) => !f);

  return (
    <div className="flip">
      <div
        className={`flip-inner cursor-pointer ${flipped ? 'flipped' : ''}`}
        onClick={toggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle())}
        role="button"
        tabIndex={0}
        aria-label={`${topic.title}. ${flipped ? 'Showing answer' : 'Showing question'}. Press to flip.`}
      >
        <div className="flip-face flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              {stackTitle}
            </span>
            <BookmarkStar topicKey={topic.key} />
          </div>
          <div className="flex flex-1 flex-col justify-center py-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{topic.title}</h3>
            <p className="mt-3 text-[17px] leading-7 text-slate-600 dark:text-slate-300">{topic.summary}</p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              <LevelBadge level={topic.level} />
              <PriorityBadge priority={topic.priority} />
            </div>
            <span className="text-xs text-slate-400">Tap to flip ↻</span>
          </div>
        </div>
        <div className="flip-face flip-back flex min-h-56 flex-col rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm dark:border-indigo-900 dark:bg-indigo-950/40">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
            🎤 30-second answer · {topic.title}
          </div>
          <RichText text={topic.spoken} className="mt-2 flex-1 text-[15px] text-slate-800 dark:text-slate-200" />
          <div className="mt-3 flex items-center justify-between gap-2 text-xs">
            <Link
              to={`/stack/${topic.stackId}/${topic.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-indigo-700 hover:underline dark:text-indigo-300"
            >
              Open full topic →
            </Link>
            <span className="text-slate-400">Tap to flip back ↻</span>
          </div>
        </div>
      </div>
    </div>
  );
}
