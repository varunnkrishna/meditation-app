import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { PostFrontmatter, PostMeta } from '@/types';

const postsDir = path.join(process.cwd(), 'content/blog');

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const { data, content } = matter(raw);
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    return { ...(data as PostFrontmatter), readingTime };
  });
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(
  slug: string
): { meta: PostMeta; content: string } | null {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const { data, content } = matter(raw);
    const frontmatter = data as PostFrontmatter;
    if (frontmatter.slug === slug) {
      const wordCount = content.trim().split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      return { meta: { ...frontmatter, readingTime }, content };
    }
  }
  return null;
}
