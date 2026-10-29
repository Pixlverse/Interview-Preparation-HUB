import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { stacks } from '../data/index.js';
import { useStudy } from '../context/StudyContext.jsx';
import ProgressBar from './ProgressBar.jsx';
import { LEVEL_DOT } from './Badges.jsx';
import { REVISE_COUNT } from '../data/revise/index.js';

const navCls = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
    isActive
      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`;

export default function Sidebar({ onNavigate }) {
  const { pathname } = useLocation();
  const { learned, bookmarks } = useStudy();
  const activeStack = pathname.startsWith('/stack/') ? pathname.split('/')[2] : null;
  const activeTopic = pathname.startsWith('/stack/') ? pathname.split('/')[3] : null;
  const [open, setOpen] = useState(() => (activeStack ? { [activeStack]: true } : {}));

  // Auto-expand the stack you navigate into.
  useEffect(() => {
    if (activeStack) setOpen((o) => (o[activeStack] ? o : { ...o, [activeStack]: true }));
  }, [activeStack]);

  // Scroll the active topic into view.
  useEffect(() => {
    if (!activeTopic) return;
    const el = document.querySelector(`[data-topic-link="${activeStack}/${activeTopic}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeStack, activeTopic]);

  const bookmarkCount = Object.keys(bookmarks).length;

  return (
    <nav className="flex h-full flex-col">
      <div className="space-y-0.5 border-b border-slate-200 p-3 dark:border-slate-800">
        <NavLink to="/" end className={navCls} onClick={onNavigate}>
          🏠 Dashboard
        </NavLink>
        <NavLink to="/revise-mern" className={navCls} onClick={onNavigate}>
          📝 Revise MERN
          <span className="ml-auto rounded-full bg-indigo-100 px-1.5 text-xs text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {REVISE_COUNT}
          </span>
        </NavLink>
        <NavLink to="/revise" className={navCls} onClick={onNavigate}>
          🃏 Quick Revise
        </NavLink>
        <NavLink to="/rapid-fire" className={navCls} onClick={onNavigate}>
          ⚡ Rapid Fire
        </NavLink>
        <NavLink to="/problems" className={navCls} onClick={onNavigate}>
          🧩 Practice Problems
        </NavLink>
        <NavLink to="/bookmarks" className={navCls} onClick={onNavigate}>
          ★ Bookmarks
          {bookmarkCount > 0 && (
            <span className="ml-auto rounded-full bg-amber-100 px-1.5 text-xs text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              {bookmarkCount}
            </span>
          )}
        </NavLink>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto p-3">
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Stacks</div>
        <ul className="space-y-0.5">
          {stacks.map((s) => {
            const done = s.topics.filter((t) => learned[t.key]).length;
            const isOpen = !!open[s.id];
            const isActive = activeStack === s.id;
            return (
              <li key={s.id}>
                <div
                  className={`flex items-center rounded-lg ${
                    isActive ? 'bg-slate-100 dark:bg-slate-800/70' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                    className="px-2 py-2 text-xs text-slate-400"
                    aria-label={isOpen ? `Collapse ${s.title}` : `Expand ${s.title}`}
                    aria-expanded={isOpen}
                  >
                    <span className={`inline-block transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                  </button>
                  <Link
                    to={`/stack/${s.id}`}
                    onClick={() => {
                      setOpen((o) => ({ ...o, [s.id]: true }));
                      onNavigate?.();
                    }}
                    className="min-w-0 flex-1 py-1.5 pr-3"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                      <span>{s.icon}</span>
                      <span className="truncate">{s.title}</span>
                      <span className="ml-auto shrink-0 text-[11px] tabular-nums text-slate-400">
                        {done}/{s.topics.length}
                      </span>
                    </div>
                    <div className="mt-1">
                      <ProgressBar done={done} total={s.topics.length} size="sm" />
                    </div>
                  </Link>
                </div>
                {isOpen && (
                  <ul className="mb-2 ml-6 mt-0.5 space-y-px border-l border-slate-200 pl-2 dark:border-slate-800">
                    {s.problems.length > 0 && (
                      <li>
                        <Link
                          to={`/stack/${s.id}/problems`}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 rounded-md px-2 py-1 text-[13px] font-medium ${
                            isActive && activeTopic === 'problems'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : 'text-indigo-600 hover:bg-slate-100 dark:text-indigo-400 dark:hover:bg-slate-800'
                          }`}
                        >
                          🧩 <span className="truncate">Interview problems</span>
                          <span className="ml-auto text-[11px] tabular-nums text-slate-400">{s.problems.length}</span>
                        </Link>
                      </li>
                    )}
                    {s.topics.map((t) => {
                      const active = isActive && activeTopic === t.id;
                      return (
                        <li key={t.id}>
                          <Link
                            to={`/stack/${s.id}/${t.id}`}
                            onClick={onNavigate}
                            data-topic-link={t.key}
                            className={`flex items-center gap-2 rounded-md px-2 py-1 text-[13px] ${
                              active
                                ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_DOT[t.level] || 'bg-slate-400'}`}
                              title={t.level}
                            />
                            <span className="truncate">{t.title}</span>
                            {learned[t.key] && <span className="ml-auto text-emerald-500">✓</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
