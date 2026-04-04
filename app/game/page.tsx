import { redirect } from 'next/navigation';
import Link from 'next/link';
import GameBoard from '@/components/GameBoard';
import { getEventsForGame } from '@/lib/gameUtils';
import { Topic, CountryCode } from '@/types/game';

const VALID_TOPICS: Topic[] = ['food', 'inventions', 'popculture'];
const VALID_COUNTRIES: CountryCode[] = ['us', 'uk', 'fr', 'jp', 'de', 'it', 'es', 'au', 'br', 'cn', 'global'];

interface PageProps {
  searchParams: Promise<{ topic?: string; country?: string }>;
}

export default async function GamePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const topic = params.topic as Topic | undefined;
  const country = (params.country ?? 'global') as CountryCode;

  if (!topic || !VALID_TOPICS.includes(topic) || !VALID_COUNTRIES.includes(country)) {
    redirect('/');
  }

  const events = getEventsForGame(topic, country);

  if (events.length < 5) {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">⏳</span>
            <span className="font-black text-xl tracking-tight text-gray-900">OlderThanDirt</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors"
          >
            ← Change topic
          </Link>
        </div>
      </nav>

      {/* Game */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Sort these 5 events
          </h2>
          <p className="text-gray-400 mt-1">Oldest → Newest</p>
        </div>

        <GameBoard events={events} topic={topic} country={country} />
      </div>
    </main>
  );
}
