import GameApp from '@/components/GameApp';
import { getDailyTopic, getTodayUTC } from '@/lib/gameUtils';
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
  const initialTopic = isDaily
    ? getDailyTopic(getTodayUTC())
    : (VALID_TOPICS.includes(params.topic as Topic) ? (params.topic as Topic) : 'food');
  const initialCountry = (VALID_COUNTRIES.includes(params.country as CountryCode)
    ? params.country as CountryCode
    : 'global');

  return (
    <GameApp
      initialTopic={initialTopic}
      initialCountry={initialCountry}
      initialIsDaily={isDaily}
    />
  );
}
