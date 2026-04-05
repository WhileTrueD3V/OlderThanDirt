import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const dates = req.nextUrl.searchParams.get('dates')?.split(',').filter(Boolean) ?? [];
    if (dates.length === 0) return NextResponse.json({});

    const redis = getRedis();
    const values = await Promise.all(
      dates.map((d) => redis.get<number>(`otd:daily:${d}:count`))
    );

    const counts: Record<string, number> = {};
    dates.forEach((d, i) => {
      counts[d] = Number(values[i] ?? 0);
    });

    console.log('[daily-counts]', counts);
    return NextResponse.json(counts);
  } catch (err) {
    console.error('[daily-counts]', err);
    return NextResponse.json({});
  }
}
