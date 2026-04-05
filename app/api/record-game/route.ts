import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

const MAX_RECORDS = 10000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, country, score, isDaily } = body;

    if (!topic || !country || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const record = {
      id: Math.random().toString(36).slice(2),
      date: new Date().toISOString(),
      topic,
      country,
      score,
      isDaily: !!isDaily,
    };

    const redis = getRedis();
    await redis.lpush('otd:games', JSON.stringify(record));
    // Trim to keep the list bounded
    await redis.ltrim('otd:games', 0, MAX_RECORDS - 1);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[record-game]', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
