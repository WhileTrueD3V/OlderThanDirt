import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function POST() {
  try {
    const redis = getRedis();

    // Delete game history list
    await redis.del('otd:games');

    // Scan and delete all daily count keys
    let cursor = 0;
    do {
      const [next, keys] = await redis.scan(cursor, { match: 'otd:daily:*', count: 100 });
      cursor = Number(next);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== 0);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/reset]', err);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
