import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function GET() {
  try {
    const redis = getRedis();
    const raw = await redis.lrange('otd:games', 0, -1);

    const history = raw.map((item) => {
      if (typeof item === 'string') return JSON.parse(item);
      return item; // Upstash auto-parses JSON objects
    });

    const total = history.length;
    const qualifying = history.filter((g: { score: number }) => g.score >= 3).length;
    const avgScore = total > 0
      ? Math.round((history.reduce((s: number, g: { score: number }) => s + g.score, 0) / total) * 10) / 10
      : 0;

    const byTopic: Record<string, { played: number; qualifying: number }> = {};
    const byCountry: Record<string, { played: number; qualifying: number }> = {};
    const scoreDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const g of history) {
      if (!byTopic[g.topic]) byTopic[g.topic] = { played: 0, qualifying: 0 };
      byTopic[g.topic].played++;
      if (g.score >= 3) byTopic[g.topic].qualifying++;

      if (!byCountry[g.country]) byCountry[g.country] = { played: 0, qualifying: 0 };
      byCountry[g.country].played++;
      if (g.score >= 3) byCountry[g.country].qualifying++;

      scoreDistribution[g.score] = (scoreDistribution[g.score] ?? 0) + 1;
    }

    return NextResponse.json({ total, qualifying, avgScore, byTopic, byCountry, scoreDistribution, history });
  } catch (err) {
    console.error('[admin/stats]', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
