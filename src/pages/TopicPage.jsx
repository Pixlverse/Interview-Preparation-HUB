import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getStack, stacks } from '../data/index.js';
import { useStudy } from '../context/StudyContext.jsx';
import RichText from '../components/RichText.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import { TopicBadges } from '../components/Badges.jsx';
import { BookmarkStar, LearnedCheckbox } from '../components/TopicActions.jsx';
import NotFound from './NotFound.jsx';

function Section({ n, title, icon, children, tone = 'plain' }) {
  const tones = {
    plain: '',
    highlight:
      'rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 dark:border-indigo-900 dark:bg-indigo-950/30',
    warn: 'rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/70 dark:bg-amber-950/20',
    success:
      'rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900 dark:bg-emerald-950/30',
  };
  return (
    <section className={`scroll-mt-6 ${tones[tone]}`}>
      <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white dark:bg-slate-100 dark:text-slate-900">
          {n}
        </span>
        <span>
          {icon} {title}
        </span>
      </h2>
      <div className="text-[15.5px] text-slate-700 dark:text-slate-300">{children}</div>
    </section>
  );
}

const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

export default function TopicPage() {
  const { stackId, topicId } = useParams();
  const navigate = useNavigate();
  const { setLastVisited } = useStudy();
  const stack = getStack(stackId);
  const index = stack ? stack.topics.findIndex((t) => t.id === topicId) : -1;
  const topic = index >= 0 ? stack.topics[index] : null;

  const prev = topic ? stack.topics[index - 1] : null;
  const next = topic ? stack.topics[index + 1] : null;
  const stackIdx = stacks.findIndex((s) => s.id === stackId);
  const nextStack = !next ? stacks[stackIdx + 1] : null;

  useEffect(() => {
    if (topic) setLastVisited({ stackId, topicId, title: topic.title });
  }, [stackId, topicId, topic, setLastVisited]);

  // Left / right arrow keys move between topics.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft' && prev) navigate(`/stack/${stackId}/${prev.id}`);
      if (e.key === 'ArrowRight' && next) navigate(`/stack/${stackId}/${next.id}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, stackId, navigate]);

  if (!topic) return <NotFound />;

  const codes = asArray(topic.code).map((c) => (typeof c === 'string' ? { code: c, lang: 'javascript' } : c));
  const mistakes = asArray(topic.mistakes);

  return (
    <article>
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
        <Link to={`/stack/${stack.id}`} className="hover:text-indigo-600 hover:underline">
          {stack.icon} {stack.title}
        </Link>
        <span>›</span>
        <span className="tabular-nums">
          Topic {index + 1} of {stack.topics.length}
        </span>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{topic.title}</h1>
        {topic.summary && <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{topic.summary}</p>}
        <div className="mt-4">
          <TopicBadges topic={topic} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <LearnedCheckbox topicKey={topic.key} />
          <BookmarkStar topicKey={topic.key} withLabel />
        </div>
      </header>

      <div className="space-y-10">
        <Section n={1} icon="💡" title="What is it?">
          <RichText text={topic.what} />
        </Section>

        <Section n={2} icon="🎯" title="Why do we use it?">
          <RichText text={topic.why} />
        </Section>

        <Section n={3} icon="🏠" title="Real-life analogy" tone="success">
          <RichText text={topic.analogy} />
        </Section>

        <Section n={4} icon="💻" title="Practical example">
          {codes.map((c, i) => (
            <CodeBlock key={i} code={c.code} lang={c.lang || 'javascript'} title={c.title} />
          ))}
        </Section>

        <Section n={5} icon="▶️" title="What happens / output">
          <RichText text={topic.output} />
        </Section>

        <Section n={6} icon="❓" title="Common interview questions">
          <div className="space-y-3">
            {asArray(topic.questions).map((q, i) => (
              <details
                key={i}
                open
                className="group rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-slate-100">
                  <span className="mr-2 text-indigo-500">Q{i + 1}.</span>
                  {q.q}
                </summary>
                <RichText text={q.a} className="mt-2 text-slate-700 dark:text-slate-300" />
              </details>
            ))}
          </div>
        </Section>

        <Section n={7} icon="🎤" title="30-second interview answer" tone="highlight">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
            Say this out loud
          </p>
          <RichText text={topic.spoken} className="text-[16px] text-slate-800 dark:text-slate-200" />
        </Section>

        <Section n={8} icon="⚠️" title="Common mistakes & follow-up traps" tone="warn">
          <ul className="space-y-2">
            {mistakes.map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 text-amber-500">▸</span>
                <RichText text={m} className="flex-1" />
              </li>
            ))}
          </ul>
        </Section>

        <Section n={9} icon="🔑" title="Key takeaway">
          <p className="rounded-xl border-l-4 border-indigo-500 bg-slate-50 px-4 py-3 font-medium text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            {topic.takeaway}
          </p>
        </Section>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
        <div>
          {prev && (
            <Link
              to={`/stack/${stack.id}/${prev.id}`}
              className="block rounded-xl border border-slate-200 p-3 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700"
            >
              <div className="text-xs text-slate-500">← Previous</div>
              <div className="truncate font-medium">{prev.title}</div>
            </Link>
          )}
        </div>
        <div className="text-right">
          {next && (
            <Link
              to={`/stack/${stack.id}/${next.id}`}
              className="block rounded-xl border border-slate-200 p-3 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700"
            >
              <div className="text-xs text-slate-500">Next →</div>
              <div className="truncate font-medium">{next.title}</div>
            </Link>
          )}
          {nextStack && (
            <Link
              to={`/stack/${nextStack.id}`}
              className="block rounded-xl border border-dashed border-indigo-300 p-3 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950/40"
            >
              <div className="text-xs text-slate-500">Stack finished 🎉 Next stack →</div>
              <div className="truncate font-medium">
                {nextStack.icon} {nextStack.title}
              </div>
            </Link>
          )}
        </div>
      </div>
      <p className="mt-3 hidden text-center text-xs text-slate-400 sm:block">Tip: use ← → arrow keys to move between topics.</p>
    </article>
  );
}
