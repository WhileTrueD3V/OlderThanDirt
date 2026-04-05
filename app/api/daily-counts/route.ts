import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const dates = req.nextUrl.searchParams.get('dates')?.split(',').filter(Boolean) ?? [];
    if (dates.length === 0) return NextResponse.json({});

    const redis = getRedis();
    const pipeline = redis.pipeline();
    for (const d of dates) {
      pipeline.get(`otd:daily:${d}:count`);
    }
    const results = await pipeline.exec();

    const counts: Record<string, number> = {};
    dates.forEach((d, i) => {
      counts[d] = Number(results[i] ?? 0);
    });

    return NextResponse.json(counts);
  } catch (err) {
    console.error('[daily-counts]', err);
    return NextResponse.json({});
  }
}
