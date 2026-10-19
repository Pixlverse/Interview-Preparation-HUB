import { Link } from 'react-router-dom';
import { allTopics, getStack } from '../data/index.js';
import { useStudy } from '../context/StudyContext.jsx';
import { FOCUS_GROUPS, FOCUS_KEYS } from '../lib/focus.js';
import ProgressBar from '../components/ProgressBar.jsx';
import TopicCard from '../components/TopicCard.jsx';

const byKey = Object.fromEntries(allTopics.map((t) => [t.key, t]));

export default function FocusPage() {
  const { learned } = useStudy();
  const done = [...FOCUS_KEYS].filter((k) => learned[k]).length;

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">🔥 Interview Focus</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Everything to revise for this role, beyond MERN: LLMs, RAG, GenAI integrations, auth and MongoDB optimisation, plus
        the projects from your resume that match. Tick each topic as you revise it.
      </p>

      <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
        <div className="flex items-center justify-between text-sm font-medium text-orange-900 dark:text-orange-200">
          <span>Revised</span>
          <span className="tabular-nums">
            {done}/{FOCUS_KEYS.size}
          </span>
        </div>
        <div className="mt-2">
          <ProgressBar done={done} total={FOCUS_KEYS.size} />
        </div>
        <Link
          to="/revise?stack=focus"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          🃏 Revise all as flip cards
        </Link>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        {FOCUS_GROUPS.map((g) => (
          <a
            key={g.id}
            href={`#${g.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(g.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="rounded-full border border-slate-300 px-3 py-1 hover:border-orange-400 hover:bg-orange-50 dark:border-slate-700 dark:hover:bg-orange-950/30"
          >
            {g.icon} {g.title}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-10">
        {FOCUS_GROUPS.map((g) => {
          const topics = g.keys.map((k) => byKey[k]).filter(Boolean);
          const groupDone = topics.filter((t) => learned[t.key]).length;
          return (
            <section key={g.id} id={g.id} className="scroll-mt-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {g.icon} {g.title}
                </h2>
                <span className="text-sm tabular-nums text-slate-500">
                  {groupDone}/{topics.length}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{g.note}</p>
              <div className="mt-3 space-y-2.5">
                {topics.map((t, i) => (
                  <TopicCard key={t.key} topic={t} index={i} stackTitle={getStack(t.stackId)?.title} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
