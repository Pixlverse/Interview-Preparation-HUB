import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { load, save } from '../lib/storage.js';

const StudyContext = createContext(null);

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback));
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue];
}

export function StudyProvider({ children }) {
  const [learned, setLearned] = usePersistentState('learned', {});
  const [bookmarks, setBookmarks] = usePersistentState('bookmarks', {});
  const [solved, setSolved] = usePersistentState('solved', {});
  const [lastVisited, setLastVisited] = usePersistentState('lastVisited', null);
  const [theme, setTheme] = usePersistentState(
    'theme',
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleLearned = useCallback(
    (key) =>
      setLearned((prev) => {
        const next = { ...prev };
        if (next[key]) delete next[key];
        else next[key] = true;
        return next;
      }),
    [setLearned]
  );

  const toggleBookmark = useCallback(
    (key) =>
      setBookmarks((prev) => {
        const next = { ...prev };
        if (next[key]) delete next[key];
        else next[key] = Date.now();
        return next;
      }),
    [setBookmarks]
  );

  const toggleSolved = useCallback(
    (key) =>
      setSolved((prev) => {
        const next = { ...prev };
        if (next[key]) delete next[key];
        else next[key] = true;
        return next;
      }),
    [setSolved]
  );

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [setTheme]);

  const resetProgress = useCallback(() => setLearned({}), [setLearned]);

  const value = useMemo(
    () => ({
      learned,
      bookmarks,
      solved,
      toggleSolved,
      lastVisited,
      theme,
      toggleLearned,
      toggleBookmark,
      toggleTheme,
      setLastVisited,
      resetProgress,
    }),
    [learned, bookmarks, solved, toggleSolved, lastVisited, theme, toggleLearned, toggleBookmark, toggleTheme, setLastVisited, resetProgress]
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used inside <StudyProvider>');
  return ctx;
}
