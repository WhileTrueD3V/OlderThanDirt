'use client';

import { useState } from 'react';
import { Topic, CountryCode } from '@/types/game';
import { getEventsForGame, getDailyEvents, getDailyTopic, getTodayUTC, TOPICS } from '@/lib/gameUtils';
import GameNav from './GameNav';
import GameBoard from './GameBoard';

interface Props {
  initialTopic: Topic;
  initialCountry: CountryCode;
  initialIsDaily: boolean;
}

export default function GameApp({ initialTopic, initialCountry, initialIsDaily }: Props) {
  const [topic, setTopic] = useState<Topic>(initialTopic);
  const [country, setCountry] = useState<CountryCode>(initialCountry);
  const [isDaily, setIsDaily] = useState(initialIsDaily);
  const [gameKey, setGameKey] = useState('init');

  const events = isDaily ? getDailyEvents(topic) : getEventsForGame(topic, country);
  const topicInfo = TOPICS.find((t) => t.id === topic)!;

  function selectTopic(t: Topic) {
    setTopic(t);
    setIsDaily(false);
    setGameKey(Math.random().toString(36).slice(2));
  }

  function selectCountry(c: CountryCode) {
    setCountry(c);
    setIsDaily(false);
    setGameKey(Math.random().toString(36).slice(2));
  }

  function goDaily() {
    const dt = getDailyTopic();
    setTopic(dt);
    setIsDaily(true);
    setGameKey(`daily-${getTodayUTC()}`);
  }

  function playAgain() {
    setGameKey(Math.random().toString(36).slice(2));
  }

  return (
    <>
      <GameNav
        currentTopic={topic}
        currentCountry={country}
        isDaily={isDaily}
        onSelectTopic={selectTopic}
        onSelectCountry={selectCountry}
        onGoDaily={goDaily}
      />

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
          <h1 className="text-5xl font-black text-white leading-tight">
            <span className="text-white/20">· </span>
            {topicInfo.label}
            <span className="text-white/20"> ·</span>
          </h1>
        </div>

        <GameBoard
          key={gameKey}
          events={events}
          isDaily={isDaily}
          onPlayAgain={playAgain}
          onGoHome={() => selectTopic('popculture')}
        />
      </div>

      <footer className="max-w-xl mx-auto px-5 pb-10 text-center">
        <p className="text-white/20 text-xs">
          OlderThanDirt — how well do you know what came first?
        </p>
      </footer>
    </>
  );
}
