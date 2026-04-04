'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topic, CountryCode } from '@/types/game';
import { TOPICS, COUNTRIES } from '@/lib/gameUtils';
import { getStreakData } from '@/lib/streak';

interface Props {
  currentTopic: Topic;
  currentCountry: CountryCode;
  isDaily: boolean;
}

export default function GameNav({ currentTopic, currentCountry, isDaily }: Props) {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [todayDone, setTodayDone] = useState(false);

  useEffect(() => {
    const { streak, todayDone } = getStreakData();
    setStreak(streak);
    setTodayDone(todayDone);
  }, []);

  function navigate(topic: Topic, country: CountryCode) {
    router.push(`/?topic=${topic}&country=${country}`);
  }

  function goDaily() {
    router.push('/?daily=true');
  }

  return (
    <header className="backdrop-blur-md bg-white/5 border-b border-white/10">
      <div className="max-w-2xl mx-auto px-6 pt-7 pb-5 flex flex-col items-center gap-5">

        {/* Logo */}
        <div className="text-2xl font-black text-white tracking-tight">
          ⏳ OlderThanDirt
        </div>

        {/* Topic tabs + Daily button */}
        <div className="flex gap-2 flex-wrap justify-center">
          {TOPICS.map((t) => {
            const active = currentTopic === t.id && !isDaily;
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.id, currentCountry)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-white/25 text-white shadow-sm'
                    : 'text-white/45 hover:text-white/75 hover:bg-white/10'
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            );
          })}

          {/* Daily button */}
          <button
            onClick={goDaily}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              isDaily
                ? 'bg-white/25 text-white shadow-sm'
                : 'text-white/45 hover:text-white/75 hover:bg-white/10'
            }`}
          >
            <span>🔥</span>
            <span>Daily</span>
            {streak > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                {streak}
              </span>
            )}
            {todayDone && !isDaily && (
              <span className="w-2 h-2 bg-teal-300 rounded-full" />
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-white/10" />

        {/* Country flags — horizontal scroll, centered when fits */}
        <div className="w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-5 w-max mx-auto pb-1 px-2">
            {COUNTRIES.map((c) => {
              const active = currentCountry === c.code && !isDaily;
              return (
                <button
                  key={c.code}
                  onClick={() => navigate(currentTopic, c.code)}
                  className={`flex flex-col items-center gap-1.5 cursor-pointer transition-opacity flex-shrink-0 ${
                    active ? 'opacity-100' : 'opacity-30 hover:opacity-60'
                  }`}
                >
                  <span className={`text-4xl leading-none ${active ? 'drop-shadow-lg' : ''}`}>
                    {c.flag}
                  </span>
                  <span className={`text-xs font-semibold tracking-wide ${active ? 'text-white' : 'text-white/50'}`}>
                    {c.code === 'global' ? 'Global' : c.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
}
