const KEY = 'otd_completed_dates';

function readCompleted(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function isDateCompleted(dateStr: string): boolean {
  return readCompleted().has(dateStr);
}

export function markDateCompleted(dateStr: string): void {
  const set = readCompleted();
  set.add(dateStr);
  localStorage.setItem(KEY, JSON.stringify([...set]));
}
