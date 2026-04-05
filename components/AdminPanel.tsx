'use client';

import { useState, useEffect } from 'react';
import { TOPICS, COUNTRIES, getAvailableDailyDates, getDailyTopic } from '@/lib/gameUtils';

interface StatsData {
  total: number;
  qualifying: number;
  avgScore: number;
  byTopic: Record<string, { played: number; qualifying: number }>;
  byCountry: Record<string, { played: number; qualifying: number }>;
  scoreDistribution: Record<number, number>;
  history: {
    id: string;
    date: string;
    topic: string;
    country: string;
    score: number;
    isDaily: boolean;
  }[];
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'daily' | 'history'>('overview');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError('Could not load stats. Check env vars.'));

    const dates = getAvailableDailyDates();
    if (dates.length > 0) {
      fetch(`/api/daily-counts?dates=${dates.join(',')}`)
        .then((r) => r.json())
        .then(setDailyCounts)
        .catch(() => {});
    }
  }, []);

  const topicLabel = (id: string) => TOPICS.find((t) => t.id === id)?.label ?? id;
  const topicEmoji = (id: string) => TOPICS.find((t) => t.id === id)?.emoji ?? '';
  const countryFlag = (code: string) => COUNTRIES.find((c) => c.code === code)?.flag ?? '';
  const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? code;

  return (
    <div className="min-h-screen bg-black/95 text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/30 mb-1">OlderThanDirt</div>
            <h1 className="text-2xl font-black">Admin Panel</h1>
            <p className="text-white/30 text-xs mt-0.5">All devices · All players</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 text-sm cursor-pointer transition-colors"
          >
            ← Exit
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-sm text-red-300">
            {error}
            <p className="text-red-400/60 text-xs mt-1">Make sure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.</p>
          </div>
        )}

        {!stats && !error && (
          <p className="text-white/30 text-sm">Loading...</p>
        )}

        {stats && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              {(['overview', 'daily', 'history'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer capitalize ${
                    tab === t
                      ? 'bg-white/20 text-white'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="space-y-6">
                {/* Top stats */}
                <div className="grid grid-cols-3 gap-4">
                  <StatCard label="Total Games" value={stats.total} />
                  <StatCard label="Qualifying (3+/5)" value={stats.qualifying} />
                  <StatCard label="Avg Score" value={stats.avgScore} />
                </div>

                {/* Score distribution */}
                <Section title="Score Distribution">
                  <div className="flex items-end gap-2 h-24">
                    {[0, 1, 2, 3, 4, 5].map((score) => {
                      const count = stats.scoreDistribution[score] ?? 0;
                      const max = Math.max(...Object.values(stats.scoreDistribution), 1);
                      const pct = (count / max) * 100;
                      return (
                        <div key={score} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-white/40">{count}</span>
                          <div className="w-full rounded-t-sm" style={{
                            height: `${Math.max(pct, 2)}%`,
                            background: score >= 3 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)',
                          }} />
                          <span className="text-[10px] text-white/40">{score}</span>
                        </div>
                      );
                    })}
                  </div>
                </Section>

                {/* By topic */}
                <Section title="By Topic">
                  {Object.keys(stats.byTopic).length === 0 ? (
                    <p className="text-white/30 text-sm">No data yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-white/30 text-xs uppercase tracking-wider">
                          <th className="text-left pb-2">Topic</th>
                          <th className="text-right pb-2">Played</th>
                          <th className="text-right pb-2">Qualifying</th>
                          <th className="text-right pb-2">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {Object.entries(stats.byTopic)
                          .sort((a, b) => b[1].played - a[1].played)
                          .map(([id, data]) => (
                            <tr key={id}>
                              <td className="py-2">{topicEmoji(id)} {topicLabel(id)}</td>
                              <td className="text-right py-2 text-white/60">{data.played}</td>
                              <td className="text-right py-2 text-white/60">{data.qualifying}</td>
                              <td className="text-right py-2 text-white/50 text-xs">
                                {data.played > 0 ? Math.round((data.qualifying / data.played) * 100) : 0}%
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </Section>

                {/* By country */}
                <Section title="By Country">
                  {Object.keys(stats.byCountry).length === 0 ? (
                    <p className="text-white/30 text-sm">No data yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-white/30 text-xs uppercase tracking-wider">
                          <th className="text-left pb-2">Country</th>
                          <th className="text-right pb-2">Played</th>
                          <th className="text-right pb-2">Qualifying</th>
                          <th className="text-right pb-2">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {Object.entries(stats.byCountry)
                          .sort((a, b) => b[1].played - a[1].played)
                          .map(([code, data]) => (
                            <tr key={code}>
                              <td className="py-2">{countryFlag(code)} {countryName(code)}</td>
                              <td className="text-right py-2 text-white/60">{data.played}</td>
                              <td className="text-right py-2 text-white/60">{data.qualifying}</td>
                              <td className="text-right py-2 text-white/50 text-xs">
                                {data.played > 0 ? Math.round((data.qualifying / data.played) * 100) : 0}%
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </Section>
              </div>
            )}

            {tab === 'daily' && (() => {
              const dates = getAvailableDailyDates();
              const totalAttempts = Object.values(dailyCounts).reduce((s, n) => s + n, 0);
              return (
                <Section title={`Daily Puzzles — ${totalAttempts} total true attempts`}>
                  {dates.length === 0 ? (
                    <p className="text-white/30 text-sm">No daily puzzles yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-white/30 text-xs uppercase tracking-wider">
                          <th className="text-left pb-2">Date</th>
                          <th className="text-left pb-2">Topic</th>
                          <th className="text-right pb-2">True attempts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dates.map((d) => {
                          const topic = getDailyTopic(d);
                          const topicInfo = TOPICS.find((t) => t.id === topic);
                          const count = dailyCounts[d] ?? 0;
                          const [, m, day] = d.split('-').map(Number);
                          const label = new Date(Date.UTC(2026, m - 1, day)).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', timeZone: 'UTC',
                          });
                          return (
                            <tr key={d}>
                              <td className="py-2 text-white/60">{label}</td>
                              <td className="py-2 text-white/50">{topicInfo?.emoji} {topicInfo?.label}</td>
                              <td className="py-2 text-right font-bold tabular-nums">
                                {count === 0 ? <span className="text-white/25">0</span> : count}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </Section>
              );
            })()}

            {tab === 'history' && (
              <Section title={`All Games (${stats.history.length})`}>
                {stats.history.length === 0 ? (
                  <p className="text-white/30 text-sm">No games recorded yet.</p>
                ) : (
                  <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
                    {stats.history.map((g) => (
                      <div key={g.id} className="flex items-center justify-between py-2.5 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-white/30 text-xs font-mono w-20 shrink-0">
                            {new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-white/60 truncate">
                            {topicEmoji(g.topic)} {topicLabel(g.topic)}
                          </span>
                          <span className="text-white/30 text-xs shrink-0">
                            {countryFlag(g.country)}
                          </span>
                          {g.isDaily && (
                            <span className="text-[10px] bg-white/10 rounded px-1.5 py-0.5 text-white/40 shrink-0">daily</span>
                          )}
                        </div>
                        <span className={`font-bold tabular-nums shrink-0 ml-3 ${g.score >= 3 ? 'text-white' : 'text-white/25'}`}>
                          {g.score}/5
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-white/35 text-xs mt-1">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h2 className="text-xs uppercase tracking-widest text-white/30 mb-4">{title}</h2>
      {children}
    </div>
  );
}
