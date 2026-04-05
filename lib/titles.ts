export interface Title {
  name: string;
  emoji: string;
  minPerfect: number;
  description: string;
}

export const TITLES: Title[] = [
  { name: 'Novice',     emoji: '🌱', minPerfect: 0,   description: 'Just getting started' },
  { name: 'Apprentice', emoji: '📖', minPerfect: 5,   description: 'Getting the hang of it' },
  { name: 'Scholar',    emoji: '🔍', minPerfect: 15,  description: 'History is starting to click' },
  { name: 'Historian',  emoji: '📜', minPerfect: 35,  description: 'You know your dates' },
  { name: 'Expert',     emoji: '⭐', minPerfect: 75,  description: 'Impressively well-read' },
  { name: 'Master',     emoji: '🏆', minPerfect: 150, description: 'A walking encyclopedia' },
  { name: 'Legend',     emoji: '👑', minPerfect: 300, description: 'Older than dirt itself' },
];

const KEY = 'otd_progress';

interface Progress {
  perfectGames: number;
  titleIndex: number;
}

function read(): Progress {
  if (typeof window === 'undefined') return { perfectGames: 0, titleIndex: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { perfectGames: 0, titleIndex: 0 };
    const parsed = JSON.parse(raw);
    // Migrate old format (gamesPlayed) to new (perfectGames)
    return {
      perfectGames: parsed.perfectGames ?? 0,
      titleIndex: parsed.titleIndex ?? 0,
    };
  } catch {
    return { perfectGames: 0, titleIndex: 0 };
  }
}

function write(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function getProgress(): Progress & {
  title: Title;
  nextTitle: Title | null;
  perfectUntilNext: number;
} {
  const p = read();
  const titleIdx = [...TITLES].reverse().findIndex((t) => p.perfectGames >= t.minPerfect);
  const currentTitle = TITLES[TITLES.length - 1 - titleIdx] ?? TITLES[0];
  const currentIdx = TITLES.indexOf(currentTitle);
  const nextTitle = TITLES[currentIdx + 1] ?? null;
  const perfectUntilNext = nextTitle ? nextTitle.minPerfect - p.perfectGames : 0;
  return { ...p, title: currentTitle, nextTitle, perfectUntilNext };
}

/** Call after each completed game. Pass true if score was 3+/5. Returns new title if just unlocked. */
export function recordGame(qualifies: boolean): Title | null {
  if (!qualifies) return null;
  const p = read();
  const before = getProgress().title;
  p.perfectGames += 1;
  write(p);
  const after = getProgress().title;
  return after.minPerfect !== before.minPerfect ? after : null;
}
