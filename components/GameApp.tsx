'use client';

import { useState, useTransition, useEffect } from 'react';
import { Topic, CountryCode } from '@/types/game';
import { GameEvent } from '@/types/game';
import { getEventsForGame, getDailyEvents, getDailyTopic, getTodayUTC, TOPICS } from '@/lib/gameUtils';
import { recordGame, getProgress, Title } from '@/lib/titles';
import GameNav from './GameNav';
import GameBoard from './GameBoard';

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
  const [gameKey, setGameKey] = useState('init');
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [currentEvents, setCurrentEvents] = useState<GameEvent[]>(() =>
    initialIsDaily ? getDailyEvents(initialTopic) : getEventsForGame(initialTopic, initialCountry, [])
  );

  // Title unlock notification
  const [unlockedTitle, setUnlockedTitle] = useState<Title | null>(null);
  const [titleProgress, setTitleProgress] = useState(() =>
    typeof window !== 'undefined' ? getProgress() : null
  );

  useEffect(() => {
    setTitleProgress(getProgress());
  }, []);

  function loadEvents(t: Topic, c: CountryCode, daily: boolean, prevUsed: string[]) {
    const evts = daily ? getDailyEvents(t) : getEventsForGame(t, c, prevUsed);
    setCurrentEvents(evts);
    return evts;
  }

  function selectTopic(t: Topic) {
    startTransition(() => {
      const evts = getEventsForGame(t, country, []);
      setTopic(t);
      setIsDaily(false);
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
      setCurrentEvents(evts);
      setUsedIds(evts.map((e) => e.id));
      setGameKey(Math.random().toString(36).slice(2));
    });
  }

  function goDaily() {
    startTransition(() => {
      const dt = getDailyTopic();
      const evts = getDailyEvents(dt);
      setTopic(dt);
      setIsDaily(true);
      setCurrentEvents(evts);
      setGameKey(`daily-${getTodayUTC()}`);
    });
  }

  function handleGameComplete() {
    const newTitle = recordGame();
    setTitleProgress(getProgress());
    if (newTitle) setUnlockedTitle(newTitle);
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
        {/* Puzzle title */}
        <div className="text-center mb-10">
          {isDaily ? (
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-md rounded-full px-4 py-1.5 mb-4">
              <span>🔥</span>
              <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                Daily Challenge
              </span>
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
            isDaily={isDaily}
            onPlayAgain={playAgain}
            onGoHome={() => selectTopic('popculture')}
            onGameComplete={handleGameComplete}
          />
        </div>
      </div>

      <footer className="max-w-xl mx-auto px-5 pb-10 text-center">
        {titleProgress && (
          <div className="mb-4">
            <div className="text-white/30 text-xs mb-2">
              {titleProgress.title.name}
              {titleProgress.nextTitle && (
                <span> · {titleProgress.gamesUntilNext} games to {titleProgress.nextTitle.name}</span>
              )}
            </div>
            {titleProgress.nextTitle && (
              <div className="h-1 bg-white/10 rounded-full max-w-xs mx-auto overflow-hidden">
                <div
                  className="h-full bg-white/40 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((titleProgress.gamesPlayed - titleProgress.title.minGames) /
                      (titleProgress.nextTitle.minGames - titleProgress.title.minGames)) * 100)}%`
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
