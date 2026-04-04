import GameNav from '@/components/GameNav';
import GameBoard from '@/components/GameBoard';
import { getEventsForGame, getDailyEvents, getDailyTopic, getTodayUTC, TOPICS } from '@/lib/gameUtils';
import { Topic, CountryCode } from '@/types/game';

const VALID_TOPICS: Topic[] = ['food', 'inventions', 'popculture'];
const VALID_COUNTRIES: CountryCode[] = [
  'us', 'uk', 'fr', 'jp', 'de', 'it', 'es', 'au', 'br', 'cn', 'global',
];

interface PageProps {
  searchParams: Promise<{ topic?: string; country?: string; daily?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  const isDaily = params.daily === 'true';

  let topic: Topic;
  let country: CountryCode;
  let events;
  let boardKey: string;

  if (isDaily) {
    topic = getDailyTopic();
    country = 'global';
    events = getDailyEvents(topic);
    boardKey = `daily-${getTodayUTC()}`; // same session all day
  } else {
    topic = (VALID_TOPICS.includes(params.topic as Topic) ? params.topic : 'popculture') as Topic;
    country = (VALID_COUNTRIES.includes(params.country as CountryCode) ? params.country : 'global') as CountryCode;
    events = getEventsForGame(topic, country);
    boardKey = Math.random().toString(36).slice(2); // fresh each visit
  }

  const topicInfo = TOPICS.find((t) => t.id === topic)!;

  return (
    <>
      <GameNav currentTopic={topic} currentCountry={country} isDaily={isDaily} />

      <div className="max-w-xl mx-auto px-5 py-10">
        {/* Puzzle title */}
        <div className="text-center mb-10">
          {isDaily ? (
            <>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-md rounded-full px-4 py-1.5 mb-4">
                <span>🔥</span>
                <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                  Daily Challenge
                </span>
              </div>
              <br />
            </>
          ) : (
            <p className="text-white/35 text-xs uppercase tracking-widest mb-3">Sort by date</p>
          )}
          <h1 className="text-5xl font-black text-white leading-tight">
            <span className="text-white/20">· </span>
            {topicInfo.label}
            <span className="text-white/20"> ·</span>
          </h1>
        </div>

        <GameBoard key={boardKey} events={events} topic={topic} country={country} isDaily={isDaily} />
      </div>

      <footer className="max-w-xl mx-auto px-5 pb-10 text-center">
        <p className="text-white/20 text-xs">
          OlderThanDirt — how well do you know what came first?
        </p>
      </footer>
    </>
  );
}
