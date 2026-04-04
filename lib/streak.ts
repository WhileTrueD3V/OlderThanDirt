import { getTodayUTC } from './gameUtils';

const KEY = 'otd_streak';

interface StreakData {
  streak: number;
  lastDate: string; // YYYY-MM-DD UTC
}

function read(): StreakData {
  if (typeof window === 'undefined') return { streak: 0, lastDate: '' };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StreakData) : { streak: 0, lastDate: '' };
  } catch {
    return { streak: 0, lastDate: '' };
  }
}

export function getStreakData(): StreakData & { todayDone: boolean } {
  const data = read();
  return { ...data, todayDone: data.lastDate === getTodayUTC() };
}

export function recordDailyCompletion(): number {
  const today = getTodayUTC();
  const { streak, lastDate } = read();
  if (lastDate === today) return streak; // already recorded today

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yd = yesterday.toISOString().slice(0, 10);

  const newStreak = lastDate === yd ? streak + 1 : 1;
  localStorage.setItem(KEY, JSON.stringify({ streak: newStreak, lastDate: today }));
  return newStreak;
}
