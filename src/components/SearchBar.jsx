import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

export default function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [value, setValue] = useState(params.get('q') || '');
  const inputRef = useRef(null);

  // Keep the box in sync when the URL changes (e.g. back button).
  useEffect(() => {
    if (location.pathname === '/search') setValue(params.get('q') || '');
  }, [location.pathname, params]);

  // Press "/" anywhere to focus search.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onChange = (e) => {
    const v = e.target.value;
    setValue(v);
    navigate(v.trim() ? `/search?q=${encodeURIComponent(v)}` : '/search', {
      replace: location.pathname === '/search',
    });
  };

  return (
    <div className="relative w-full max-w-md">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">⌕</span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Search all topics…  ( / )"
        className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-indigo-900"
        aria-label="Search all topics"
      />
    </div>
  );
}
