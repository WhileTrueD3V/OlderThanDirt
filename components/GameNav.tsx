'use client';

import { useRouter } from 'next/navigation';
import { Topic, CountryCode } from '@/types/game';
import { TOPICS, COUNTRIES } from '@/lib/gameUtils';

interface Props {
  currentTopic: Topic;
  currentCountry: CountryCode;
}

export default function GameNav({ currentTopic, currentCountry }: Props) {
  const router = useRouter();

  function navigate(topic: Topic, country: CountryCode) {
    router.push(`/?topic=${topic}&country=${country}`);
  }

  return (
    <header className="backdrop-blur-md bg-white/5 border-b border-white/10">
      <div className="max-w-2xl mx-auto px-6 pt-7 pb-5 flex flex-col items-center gap-5">

        {/* Logo — big and centered */}
        <div className="text-2xl font-black text-white tracking-tight">
          ⏳ OlderThanDirt
        </div>

        {/* Topic tabs — centered row */}
        <div className="flex gap-2">
          {TOPICS.map((t) => {
            const active = currentTopic === t.id;
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.id, currentCountry)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
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
        </div>

        {/* Divider */}
        <div className="w-full border-t border-white/10" />

        {/* Country flags — big, centered, with labels */}
        <div className="flex gap-5 flex-wrap justify-center pb-1">
          {COUNTRIES.map((c) => {
            const active = currentCountry === c.code;
            return (
              <button
                key={c.code}
                onClick={() => navigate(currentTopic, c.code)}
                className={`flex flex-col items-center gap-1.5 cursor-pointer transition-opacity ${
                  active ? 'opacity-100' : 'opacity-30 hover:opacity-60'
                }`}
              >
                <span
                  className={`text-4xl leading-none transition-all ${
                    active
                      ? 'drop-shadow-lg'
                      : ''
                  }`}
                >
                  {c.flag}
                </span>
                <span
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    active ? 'text-white' : 'text-white/50'
                  }`}
                >
                  {c.code === 'global' ? 'Global' : c.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
