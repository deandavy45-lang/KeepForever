export function formatDate(iso: string | null): string {
  if (!iso) return 'Undated';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Groups timeline items by year, newest first. */
export function groupByYear<T extends { occurredOn: string | null; createdAt: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const it of items) {
    const y = (it.occurredOn ?? it.createdAt).slice(0, 4);
    groups.set(y, [...(groups.get(y) ?? []), it]);
  }
  return [...groups.entries()].map(([year, data]) => ({ year, data }));
}
