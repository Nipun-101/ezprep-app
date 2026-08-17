const STORAGE_KEY = 'ezp:currentAffairsLastSeenDate';

/** Local calendar date as YYYY-MM-DD (matches API dateKey). */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getLastSeenDateKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function markCurrentAffairsSeen(dateKey: string = toDateKey()): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, dateKey);
    window.dispatchEvent(new CustomEvent('current-affairs-seen'));
  } catch {
    // ignore quota / private mode
  }
}

/** True when the user has not opened Current Affairs today. */
export function hasUnseenCurrentAffairsToday(): boolean {
  return getLastSeenDateKey() !== toDateKey();
}
