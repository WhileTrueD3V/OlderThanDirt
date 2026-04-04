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
  const seed = Math.random().toString(36).slice(2);

  return (
    <>
      <GameNav currentTopic={topic} currentCountry={country} />

      <div className="max-w-xl mx-auto px-5 py-10">
        {/* Puzzle title */}
        <div className="text-center mb-10">
          <p className="text-white/35 text-xs uppercase tracking-widest mb-3">
            Sort by date
          </p>
          <h1 className="text-5xl font-black text-white leading-tight">
            <span className="text-white/20">· </span>
            {topicInfo.label}
            <span className="text-white/20"> ·</span>
          </h1>
        </div>

        <GameBoard key={seed} events={events} topic={topic} country={country} />
      </div>

      <footer className="max-w-xl mx-auto px-5 pb-10 text-center">
        <p className="text-white/20 text-xs">
          OlderThanDirt — how well do you know what came first?
        </p>
      </footer>
    </>
  );
}
