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
    <header className="sticky top-0 z-10 backdrop-blur-md bg-white/5 border-b border-white/10">
      <div className="max-w-xl mx-auto px-5">
        {/* Logo + topic tabs */}
        <div className="flex items-center justify-between py-3 gap-3">
          <span className="font-black text-white text-base tracking-tight whitespace-nowrap">
            ⏳ OlderThanDirt
          </span>
          <div className="flex gap-1">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(t.id, currentCountry)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  currentTopic === t.id
                    ? 'bg-white/25 text-white shadow-sm'
                    : 'text-white/45 hover:text-white/75 hover:bg-white/10'
                }`}
              >
                {t.emoji} {t.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Country flags */}
        <div className="flex gap-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {COUNTRIES.map((c) => {
            const active = currentCountry === c.code;
            return (
              <button
                key={c.code}
                onClick={() => navigate(currentTopic, c.code)}
                className={`flex flex-col items-center gap-0.5 flex-shrink-0 cursor-pointer transition-opacity ${
                  active ? 'opacity-100' : 'opacity-30 hover:opacity-55'
                }`}
              >
                <span
                  className={`text-2xl leading-none p-1 rounded-full transition-all ${
                    active ? 'ring-2 ring-white/50 bg-white/15' : ''
                  }`}
                >
                  {c.flag}
                </span>
                <span className="text-[10px] text-white/50 font-medium">
                  {c.code === 'global' ? 'All' : c.code.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
