import { Link } from 'react-router-dom';
import { TopicBadges } from './Badges.jsx';
import { BookmarkStar, LearnedCheckbox } from './TopicActions.jsx';

export default function TopicCard({ topic, index, stackTitle }) {
  return (
    <Link
      to={`/stack/${topic.stackId}/${topic.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <LearnedCheckbox topicKey={topic.key} compact />
        </div>
        <div className="min-w-0 flex-1">
          {stackTitle && (
            <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              {stackTitle}
            </div>
          )}
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">
            {index !== undefined && <span className="mr-1.5 text-slate-400">{index + 1}.</span>}
            {topic.title}
          </h3>
          {topic.summary && <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{topic.summary}</p>}
          <div className="mt-2">
            <TopicBadges topic={topic} />
          </div>
        </div>
        <BookmarkStar topicKey={topic.key} />
      </div>
    </Link>
  );
}
