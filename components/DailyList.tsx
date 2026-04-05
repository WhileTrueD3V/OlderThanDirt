'use client';

import { useEffect, useState } from 'react';
import { getAvailableDailyDates, getDailyTopic, getTodayUTC, TOPICS } from '@/lib/gameUtils';
import { isDateCompleted } from '@/lib/dailyRecord';

interface Props {
  onSelectDate: (dateStr: string) => void;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export default function DailyList({ onSelectDate }: Props) {
  const [dates, setDates] = useState<string[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const today = getTodayUTC();

  useEffect(() => {
    const available = getAvailableDailyDates();
    setDates(available);
    setCompleted(new Set(available.filter(isDateCompleted)));

    // Fetch per-date player counts from Redis
    if (available.length > 0) {
      fetch(`/api/daily-counts?dates=${available.join(',')}`)
        .then((r) => r.json())
        .then((data) => setCounts(data))
        .catch(() => {});
    }
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {dates.map((dateStr) => {
        const topic = getDailyTopic(dateStr);
        const topicInfo = TOPICS.find((t) => t.id === topic)!;
        const isToday = dateStr === today;
        const done = completed.has(dateStr);
        const playerCount = counts[dateStr] ?? 0;

        return (
          <button
            key={dateStr}
            onClick={() => !done && onSelectDate(dateStr)}
            disabled={done}
            className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-2xl border backdrop-blur-md transition-all
              ${done
                ? 'bg-white/5 border-white/8 opacity-60 cursor-default'
                : 'bg-white/10 border-white/15 hover:bg-white/18 hover:border-white/25 active:scale-[0.98] cursor-pointer'
              }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-semibold text-sm">{formatDate(dateStr)}</span>
                {isToday && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <div className="text-white/40 text-xs mt-0.5">
                {topicInfo.emoji} {topicInfo.label}
              </div>
              {playerCount > 0 && (
                <div className="text-white/25 text-[11px] mt-1">
                  attempted by {playerCount.toLocaleString()} {playerCount === 1 ? 'player' : 'players'}
                </div>
              )}
            </div>

            {done ? (
              <span className="text-teal-300 text-base font-bold flex-shrink-0">✓</span>
            ) : (
              <span className="text-white/25 text-base flex-shrink-0">→</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
