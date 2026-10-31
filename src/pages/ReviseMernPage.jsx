import { useState } from 'react';
import { REVISE_COUNT, REVISE_GROUPS } from '../data/revise/index.js';
import RichText from '../components/RichText.jsx';

export default function ReviseMernPage() {
  // Off: read straight through. On: test yourself, tap a question to see its answer.
  const [quiz, setQuiz] = useState(false);
  const [open, setOpen] = useState({});

  const toggleQuiz = () => {
    setQuiz((q) => !q);
    setOpen({});
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">📝 Revise MERN</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        The {REVISE_COUNT} questions most likely to come up across {REVISE_GROUPS.length} topics, each with a short answer
        you can say out loud. Read it top to bottom just before the interview.
      </p>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={toggleQuiz}
          aria-pressed={quiz}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
            quiz
              ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
              : 'border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900'
          }`}
        >
          {quiz ? '🙈 Answers hidden: tap a question' : '🙈 Hide answers (test yourself)'}
        </button>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        {REVISE_GROUPS.map((g) => (
          <a
            key={g.id}
            href={`#${g.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(g.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="rounded-full border border-slate-300 px-3 py-1 hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:hover:bg-indigo-950/30"
          >
            {g.icon} {g.title}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-12">
        {REVISE_GROUPS.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {g.icon} {g.title}
              </h2>
              <span className="text-sm tabular-nums text-slate-500">{g.items.length} questions</span>
            </div>
            {g.note && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{g.note}</p>}

            <ol className="mt-4 space-y-3">
              {g.items.map((item, i) => {
                const key = `${g.id}-${i}`;
                const shown = !quiz || open[key];
                return (
                  <li
                    key={key}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <button
                      type="button"
                      disabled={!quiz}
                      onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                      aria-expanded={shown}
                      className="flex w-full gap-2 text-left font-semibold text-slate-900 disabled:cursor-text dark:text-white"
                    >
                      <span className="shrink-0 tabular-nums text-indigo-600 dark:text-indigo-400">{i + 1}.</span>
                      <span>{item.q}</span>
                    </button>
                    {shown && <RichText text={item.a} className="mt-2 text-[0.95rem] text-slate-700 dark:text-slate-300" />}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
