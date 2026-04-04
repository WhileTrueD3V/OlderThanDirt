import { GameEvent, Topic, CountryCode, CountryOption, TopicOption } from '@/types/game';
import { events } from '@/data/events';

export const COUNTRIES: CountryOption[] = [
  { code: 'global', name: 'Worldwide', flag: '🌍' },
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
];

export const TOPICS: TopicOption[] = [
  {
    id: 'food',
    label: 'Food & Drink',
    emoji: '🍕',
    description: 'Chocolate bars, instant ramen, champagne — which came first?',
  },
  {
    id: 'inventions',
    label: 'Inventions',
    emoji: '💡',
    description: 'The light bulb, the iPhone, the printing press — in what order?',
  },
  {
    id: 'popculture',
    label: 'Pop Culture',
    emoji: '🎬',
    description: 'Star Wars, The Simpsons, Pokémon — can you sort them in time?',
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 0x100000000;
  };
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  const rand = seededRandom(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getTodayUTC(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDailyTopic(): Topic {
  const dayNum = Math.floor(Date.now() / 86_400_000); // UTC days since epoch
  const topics: Topic[] = ['food', 'inventions', 'popculture'];
  return topics[dayNum % 3];
}

export function getDailyEvents(topic: Topic): GameEvent[] {
  const pool = events.filter((e) => e.topic === topic);
  // Seed: numeric YYYYMMDD — same for everyone on the same UTC day
  const d = new Date();
  const seed =
    d.getUTCFullYear() * 10000 +
    (d.getUTCMonth() + 1) * 100 +
    d.getUTCDate();
  return seededShuffle(pool, seed).slice(0, 5);
}

export function getEventsForGame(
  topic: Topic,
  country: CountryCode,
  exclude: string[] = []
): GameEvent[] {
  const excludeSet = new Set(exclude);

  // Build pool — strict country filter (no global leakage)
  let pool: GameEvent[];
  if (country === 'global') {
    pool = events.filter((e) => e.topic === topic);
  } else {
    const strict = events.filter(
      (e) => e.topic === topic && e.countries.includes(country)
    );
    // Fall back to all topic events only if genuinely not enough data
    pool = strict.length >= 5 ? strict : events.filter((e) => e.topic === topic);
  }

  // Prefer events not recently seen; reset exclusion if pool runs dry
  const fresh = pool.filter((e) => !excludeSet.has(e.id));
  const source = fresh.length >= 5 ? fresh : pool;

  return shuffleArray(source).slice(0, 5);
}

export function sortByYear(evts: GameEvent[]): GameEvent[] {
  return [...evts].sort((a, b) => a.year - b.year);
}

export function calculateScore(playerOrder: GameEvent[], correctOrder: GameEvent[]): number {
  return playerOrder.filter((event, idx) => event.id === correctOrder[idx].id).length;
}

export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  return String(year);
}

export function getScoreMessage(score: number): string {
  if (score === 5) return 'Perfect! You\'re a history genius 🏆';
  if (score === 4) return 'So close! One out of place 🎯';
  if (score === 3) return 'Not bad! Half right 🧐';
  if (score === 2) return 'History is trickier than you think 😅';
  if (score === 1) return 'One right is better than none 😬';
  return 'A clean sweep... for history 😂';
}

export function getCountryLabel(code: CountryCode): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code.toUpperCase();
}

export function getTopicLabel(id: Topic): string {
  return TOPICS.find((t) => t.id === id)?.label ?? id;
}
