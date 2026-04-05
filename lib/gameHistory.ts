import { Topic, CountryCode } from '@/types/game';

export interface GameRecord {
  id: string;
  date: string;        // ISO timestamp
  topic: Topic;
  country: CountryCode;
  score: number;       // 0–5
  isDaily: boolean;
}

const KEY = 'otd_history';
const MAX = 500;

export function saveGameResult(record: Omit<GameRecord, 'id' | 'date'>): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getGameHistory();
    const entry: GameRecord = {
      ...record,
      id: Math.random().toString(36).slice(2),
      date: new Date().toISOString(),
    };
    history.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(history.slice(0, MAX)));
  } catch { /* ignore */ }
}

export function getGameHistory(): GameRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameRecord[]) : [];
  } catch {
    return [];
  }
}

export function getAdminStats() {
  const history = getGameHistory();
  const total = history.length;
  const qualifying = history.filter((g) => g.score >= 3).length;
  const avgScore = total > 0
    ? Math.round((history.reduce((s, g) => s + g.score, 0) / total) * 10) / 10
    : 0;

  const byTopic: Record<string, { played: number; qualifying: number }> = {};
  for (const g of history) {
    if (!byTopic[g.topic]) byTopic[g.topic] = { played: 0, qualifying: 0 };
    byTopic[g.topic].played++;
    if (g.score >= 3) byTopic[g.topic].qualifying++;
  }

  const scoreDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const g of history) scoreDistribution[g.score]++;

  return { total, qualifying, avgScore, byTopic, scoreDistribution, history };
}
