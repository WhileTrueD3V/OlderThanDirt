import GameNav from '@/components/GameNav';
import GameBoard from '@/components/GameBoard';
import { getEventsForGame, TOPICS } from '@/lib/gameUtils';
import { Topic, CountryCode } from '@/types/game';

const VALID_TOPICS: Topic[] = ['food', 'inventions', 'popculture'];
const VALID_COUNTRIES: CountryCode[] = [
  'us', 'uk', 'fr', 'jp', 'de', 'it', 'es', 'au', 'br', 'cn', 'global',
];

interface PageProps {
  searchParams: Promise<{ topic?: string; country?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  const topic = (VALID_TOPICS.includes(params.topic as Topic)
    ? params.topic
    : 'popculture') as Topic;

  const country = (VALID_COUNTRIES.includes(params.country as CountryCode)
    ? params.country
    : 'global') as CountryCode;

  const events = getEventsForGame(topic, country);
  const topicInfo = TOPICS.find((t) => t.id === topic)!;

  // seed forces GameBoard to remount (fresh state) on every server render
  const seed = Math.random().toString(36).slice(2);

  return (
    <main className="min-h-screen bg-[#111]">
      <GameNav currentTopic={topic} currentCountry={country} />

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Puzzle title */}
        <div className="text-center mb-8">
          <p className="text-[#555] text-xs uppercase tracking-widest mb-2">Sort by date</p>
          <h1 className="text-3xl font-black text-white">
            <span className="text-[#444]">· </span>
            {topicInfo.label}
            <span className="text-[#444]"> ·</span>
          </h1>
        </div>

        <GameBoard key={seed} events={events} topic={topic} country={country} />
      </div>
    </main>
  );
}
