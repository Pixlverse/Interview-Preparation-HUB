import { useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import SearchBar from './components/SearchBar.jsx';
import { useStudy } from './context/StudyContext.jsx';
import HomePage from './pages/HomePage.jsx';
import StackPage from './pages/StackPage.jsx';
import TopicPage from './pages/TopicPage.jsx';
import BookmarksPage from './pages/BookmarksPage.jsx';
import QuickRevisePage from './pages/QuickRevisePage.jsx';
import ReviseMernPage from './pages/ReviseMernPage.jsx';
import RapidFirePage from './pages/RapidFirePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import ProblemsPage from './pages/ProblemsPage.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const { theme, toggleTheme } = useStudy();
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  // Start every page at the top.
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  // Close the drawer with Escape.
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer]);

  return (
    <div className="flex h-full flex-col">
      <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <button
          type="button"
          className="rounded-lg p-1.5 text-xl lg:hidden"
          onClick={() => setDrawer(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
        <Link to="/" className="hidden shrink-0 items-center gap-2 font-bold text-slate-900 sm:flex dark:text-slate-100">
          📘 <span>Interview Prep</span>
        </Link>
        <div className="flex flex-1 justify-center">
          <SearchBar />
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-slate-300 px-2.5 py-1 text-sm dark:border-slate-700"
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 lg:block dark:border-slate-800">
          <Sidebar />
        </aside>

        {drawer && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
            <aside className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl dark:bg-slate-950">
              <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
                <span className="font-bold">📘 Interview Prep</span>
                <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="p-1 text-xl">
                  ✕
                </button>
              </div>
              <div className="h-[calc(100%-3.5rem)]">
                <Sidebar onNavigate={() => setDrawer(false)} />
              </div>
            </aside>
          </div>
        )}

        <main ref={mainRef} className="thin-scroll min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stack/:stackId" element={<StackPage />} />
              <Route path="/stack/:stackId/problems" element={<ProblemsPage />} />
              <Route path="/stack/:stackId/:topicId" element={<TopicPage />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/revise-mern" element={<ReviseMernPage />} />
              <Route path="/revise" element={<QuickRevisePage />} />
              <Route path="/rapid-fire" element={<RapidFirePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
