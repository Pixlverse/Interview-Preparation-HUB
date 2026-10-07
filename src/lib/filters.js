export const DEFAULT_FILTERS = { level: 'all', priority: 'all', status: 'all' };

export function applyFilters(topics, filters, learned) {
  return topics.filter((t) => {
    if (filters.level !== 'all' && t.level !== filters.level) return false;
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
    if (filters.status === 'learned' && !learned[t.key]) return false;
    if (filters.status === 'not-learned' && learned[t.key]) return false;
    return true;
  });
}
