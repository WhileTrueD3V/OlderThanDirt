export interface Title {
  name: string;
  emoji: string;
  minGames: number;
  description: string;
}

export const TITLES: Title[] = [
  { name: 'Novice',      emoji: '🌱', minGames: 0,   description: 'Just getting started' },
  { name: 'Apprentice',  emoji: '📖', minGames: 10,  description: 'Getting the hang of it' },
  { name: 'Scholar',     emoji: '🔍', minGames: 30,  description: 'History is starting to click' },
  { name: 'Historian',   emoji: '📜', minGames: 75,  description: 'You know your dates' },
  { name: 'Expert',      emoji: '⭐', minGames: 150, description: 'Impressively well-read' },
  { name: 'Master',      emoji: '🏆', minGames: 300, description: 'A walking encyclopedia' },
  { name: 'Legend',      emoji: '👑', minGames: 500, description: 'Older than dirt itself' },
];

const KEY = 'otd_progress';

interface Progress {
  gamesPlayed: number;
  titleIndex: number; // last notified title index
}

function read(): Progress {
  if (typeof window === 'undefined') return { gamesPlayed: 0, titleIndex: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : { gamesPlayed: 0, titleIndex: 0 };
  } catch {
    return { gamesPlayed: 0, titleIndex: 0 };
  }
}

function write(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function getProgress(): Progress & { title: Title; nextTitle: Title | null; gamesUntilNext: number } {
  const p = read();
  const titleIdx = [...TITLES].reverse().findIndex((t) => p.gamesPlayed >= t.minGames);
  const currentTitle = TITLES[TITLES.length - 1 - titleIdx] ?? TITLES[0];
  const currentIdx = TITLES.indexOf(currentTitle);
  const nextTitle = TITLES[currentIdx + 1] ?? null;
  const gamesUntilNext = nextTitle ? nextTitle.minGames - p.gamesPlayed : 0;
  return { ...p, title: currentTitle, nextTitle, gamesUntilNext };
}

/** Call after each completed game. Returns new title if just unlocked, else null. */
export function recordGame(): Title | null {
  const p = read();
  const before = getProgress().title;
  p.gamesPlayed += 1;
  write(p);
  const after = getProgress().title;
  return after.minGames !== before.minGames ? after : null;
}
