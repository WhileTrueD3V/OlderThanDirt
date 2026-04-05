'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Topic, CountryCode } from '@/types/game';
import { GameEvent } from '@/types/game';
import { getEventsForGame, getDailyEvents, getDailyTopic, getTodayUTC, TOPICS } from '@/lib/gameUtils';
import { recordGame, getProgress, Title } from '@/lib/titles';
import { markDateCompleted } from '@/lib/dailyRecord';
import { saveGameResult } from '@/lib/gameHistory';
import GameNav from './GameNav';
import GameBoard from './GameBoard';
import DailyList from './DailyList';
import AdminPanel from './AdminPanel';

interface Props {
  initialTopic: Topic;
  initialCountry: CountryCode;
  initialIsDaily: boolean;
}

export default function GameApp({ initialTopic, initialCountry, initialIsDaily }: Props) {
  const [, startTransition] = useTransition();

  const [topic, setTopic] = useState<Topic>(initialTopic);
  const [country, setCountry] = useState<CountryCode>(initialCountry);
  const [isDaily, setIsDaily] = useState(initialIsDaily);
  // null = showing daily list, string = playing that date's puzzle
  const [dailyDate, setDailyDate] = useState<string | null>(null);
  const [gameKey, setGameKey] = useState('init');
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [currentEvents, setCurrentEvents] = useState<GameEvent[]>(() =>
    getEventsForGame(initialTopic, initialCountry, [])
  );

  // Title unlock notification
  const [unlockedTitle, setUnlockedTitle] = useState<Title | null>(null);
  const [titleProgress, setTitleProgress] = useState(() =>
    typeof window !== 'undefined' ? getProgress() : null
  );

  // Admin panel
  const [showAdmin, setShowAdmin] = useState(false);
  const sequenceRef = useRef<{ topic: Topic | 'daily'; time: number }[]>([]);
  const SECRET_SEQUENCE: (Topic | 'daily')[] = ['popculture', 'daily', 'inventions', 'food'];

  useEffect(() => {
    setTitleProgress(getProgress());
  }, []);

  function pushSequence(item: Topic | 'daily') {
    const now = Date.now();
    const seq = [...sequenceRef.current, { topic: item, time: now }].filter(
      (s) => now - s.time < 5000
    );
    sequenceRef.current = seq;
    const topics = seq.map((s) => s.topic);
    const n = SECRET_SEQUENCE.length;
    if (topics.length >= n && topics.slice(-n).join(',') === SECRET_SEQUENCE.join(',')) {
      sequenceRef.current = [];
      setShowAdmin(true);
    }
  }

  function selectTopic(t: Topic) {
    pushSequence(t);
    startTransition(() => {
      const evts = getEventsForGame(t, country, []);
      setTopic(t);
      setIsDaily(false);
      setDailyDate(null);
      setCurrentEvents(evts);
      setUsedIds(evts.map((e) => e.id));
      setGameKey(Math.random().toString(36).slice(2));
    });
  }

  function selectCountry(c: CountryCode) {
    startTransition(() => {
      const evts = getEventsForGame(topic, c, []);
      setCountry(c);
      setIsDaily(false);
      setDailyDate(null);
      setCurrentEvents(evts);
      setUsedIds(evts.map((e) => e.id));
      setGameKey(Math.random().toString(36).slice(2));
    });
  }

  function goDaily() {
    pushSequence('daily');
    setIsDaily(true);
    setDailyDate(null);
  }

  function selectDailyDate(dateStr: string) {
    startTransition(() => {
      const t = getDailyTopic(dateStr);
      const evts = getDailyEvents(dateStr);
      setTopic(t);
      setDailyDate(dateStr);
      setCurrentEvents(evts);
      setGameKey(`daily-${dateStr}`);
    });
  }

  function handleGameComplete(score: number) {
    // Save locally
    saveGameResult({ topic, country, score, isDaily });
    // Save to Redis (fire-and-forget)
    fetch('/api/record-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, country, score, isDaily }),
    }).catch(() => { /* silently ignore if offline */ });
    const newTitle = recordGame(score >= 3);
    setTitleProgress(getProgress());
    if (newTitle) setUnlockedTitle(newTitle);
    if (isDaily && dailyDate) markDateCompleted(dailyDate);
  }

  function playAgain() {
    startTransition(() => {
      const nextUsed = [...usedIds, ...currentEvents.map((e) => e.id)];
      const evts = getEventsForGame(topic, country, nextUsed);
      setUsedIds(nextUsed);
      setCurrentEvents(evts);
      setGameKey(Math.random().toString(36).slice(2));
    });
  }

  const topicInfo = TOPICS.find((t) => t.id === topic)!;
  const showDailyList = isDaily && dailyDate === null;

  if (showAdmin) return <AdminPanel onClose={() => setShowAdmin(false)} />;

  return (
    <>
      <GameNav
        currentTopic={topic}
        currentCountry={country}
        isDaily={isDaily}
        titleProgress={titleProgress}
        onSelectTopic={selectTopic}
        onSelectCountry={selectCountry}
        onGoDaily={goDaily}
      />

      {/* Title unlock toast */}
      {unlockedTitle && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 fade-in">
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl px-6 py-4 text-center shadow-2xl">
            <div className="text-white font-black text-lg">Title unlocked: {unlockedTitle.name}!</div>
            <div className="text-white/60 text-sm mt-0.5">{unlockedTitle.description}</div>
            <button
              onClick={() => setUnlockedTitle(null)}
              className="mt-3 text-white/50 text-xs hover:text-white/80 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto px-5 py-10">
        {showDailyList ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-md rounded-full px-4 py-1.5 mb-4">
                <span>🔥</span>
                <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                  Daily Puzzles
                </span>
              </div>
              <p className="text-white/40 text-sm">Pick a day to play</p>
            </div>
            <DailyList onSelectDate={selectDailyDate} />
          </>
        ) : (
          <>
            {/* Puzzle title */}
            <div className="text-center mb-10">
              {isDaily && dailyDate ? (
                <div className="flex flex-col items-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-md rounded-full px-4 py-1.5">
                    <span>🔥</span>
                    <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                      Daily · {new Date(dailyDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}
                    </span>
                  </div>
                  <button
                    onClick={goDaily}
                    className="text-white/35 text-xs hover:text-white/60 cursor-pointer transition-colors"
                  >
                    ← All dailies
                  </button>
                </div>
              ) : (
                <p className="text-white/35 text-xs uppercase tracking-widest mb-3">Sort by date</p>
              )}
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                <span className="text-white/20">· </span>
                {topicInfo.label}
                <span className="text-white/20"> ·</span>
              </h1>
            </div>

            <div className="fade-in" key={gameKey}>
              <GameBoard
                events={currentEvents}
                topic={topic}
                country={country}
                isDaily={isDaily}
                onPlayAgain={playAgain}
                onGoHome={goDaily}
                onGameComplete={handleGameComplete}
              />
            </div>
          </>
        )}
      </div>

      <footer className="max-w-xl mx-auto px-5 pb-10 text-center">
        {titleProgress && (
          <div className="mb-4">
            <div className="text-white/30 text-xs mb-2">
              {titleProgress.title.name}
              {titleProgress.nextTitle && (
                <span> · {titleProgress.perfectUntilNext} {titleProgress.perfectUntilNext === 1 ? 'game' : 'games'} (3+/5) to {titleProgress.nextTitle.name}</span>
              )}
            </div>
            {titleProgress.nextTitle && (
              <div className="h-1 bg-white/10 rounded-full max-w-xs mx-auto overflow-hidden">
                <div
                  className="h-full bg-white/40 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((titleProgress.perfectGames - titleProgress.title.minPerfect) /
                      (titleProgress.nextTitle.minPerfect - titleProgress.title.minPerfect)) * 100)}%`
                  }}
                />
              </div>
            )}
          </div>
        )}
        <p className="text-white/20 text-xs">
          OlderThanDirt — how well do you know what came first?
        </p>
      </footer>
    </>
  );
}
