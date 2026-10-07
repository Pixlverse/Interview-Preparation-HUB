import { LEVELS, LEVEL_LABEL, PRIORITIES, PRIORITY_LABEL } from '../data/index.js';
import { DEFAULT_FILTERS } from '../lib/filters.js';

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-1.5 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar({ filters, setFilters, count }) {
  const set = (k) => (v) => setFilters({ ...filters, [k]: v });
  const active = Object.keys(DEFAULT_FILTERS).some((k) => filters[k] !== DEFAULT_FILTERS[k]);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
      <Select
        label="Level"
        value={filters.level}
        onChange={set('level')}
        options={[['all', 'All'], ...LEVELS.map((l) => [l, LEVEL_LABEL[l]])]}
      />
      <Select
        label="Priority"
        value={filters.priority}
        onChange={set('priority')}
        options={[['all', 'All'], ...PRIORITIES.map((p) => [p, PRIORITY_LABEL[p]])]}
      />
      <Select
        label="Status"
        value={filters.status}
        onChange={set('status')}
        options={[
          ['all', 'All'],
          ['not-learned', 'Not learned'],
          ['learned', 'Learned'],
        ]}
      />
      {active && (
        <button
          type="button"
          onClick={() => setFilters(DEFAULT_FILTERS)}
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Clear
        </button>
      )}
      {count !== undefined && <span className="ml-auto text-xs text-slate-500">{count} shown</span>}
    </div>
  );
}
