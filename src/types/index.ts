export type Duration = 120 | 300 | 600 | 900;
export type Sound = 'silence' | 'water' | 'birds' | 'rain' | 'wind' | 'chimes';

export interface Stats {
  sessions: number;
  minutes: number;
  lastDate: string | null;
  streak: number;
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
