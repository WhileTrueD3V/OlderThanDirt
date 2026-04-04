export type Topic = 'food' | 'inventions' | 'popculture';

export type CountryCode =
  | 'us'
  | 'uk'
  | 'fr'
  | 'jp'
  | 'de'
  | 'it'
  | 'es'
  | 'au'
  | 'br'
  | 'cn'
  | 'global';

export interface GameEvent {
  id: string;
  title: string;
  year: number;
  description: string;
  topic: Topic;
  countries: CountryCode[];
  emoji: string;
}

export interface CountryOption {
  code: CountryCode;
  name: string;
  flag: string;
}

export interface TopicOption {
  id: Topic;
  label: string;
  emoji: string;
  description: string;
}
