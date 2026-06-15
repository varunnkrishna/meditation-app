export type Duration = 120 | 300 | 600 | 900;
export type Sound = 'birds' | 'water' | 'silence';

export interface MeditationConfig {
  duration: Duration;
  sound: Sound;
}

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  slug: string;
}

export interface PostMeta extends PostFrontmatter {
  readingTime: number;
}
