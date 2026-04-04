'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topic, CountryCode } from '@/types/game';
import { TOPICS, COUNTRIES } from '@/lib/gameUtils';

export default function HomeSelector() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('global');

  function handlePlay() {
    if (!selectedTopic) return;
    router.push(`/game?topic=${selectedTopic}&country=${selectedCountry}`);
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Topic picker */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-500 mb-4">
          Choose a topic
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TOPICS.map((topic) => {
            const active = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`
                  rounded-2xl border-2 p-5 text-left transition-all duration-150 cursor-pointer
                  ${active
                    ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100'
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/40'
                  }
                `}
              >
                <div className="text-4xl mb-3">{topic.emoji}</div>
                <div className="font-bold text-gray-900 text-lg leading-tight">{topic.label}</div>
                <div className="text-sm text-gray-500 mt-1 leading-snug">{topic.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Country picker */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-500 mb-4">
          Filter by country <span className="normal-case text-gray-400 font-normal tracking-normal">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((country) => {
            const active = selectedCountry === country.code;
            return (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country.code)}
                className={`
                  flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all duration-100 cursor-pointer
                  ${active
                    ? 'border-orange-500 bg-orange-500 text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                  }
                `}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Play button */}
      <div>
        <button
          onClick={handlePlay}
          disabled={!selectedTopic}
          className={`
            w-full sm:w-auto px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-150 cursor-pointer
            ${selectedTopic
              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {selectedTopic ? 'Play →' : 'Pick a topic to start'}
        </button>
      </div>
    </div>
  );
}
