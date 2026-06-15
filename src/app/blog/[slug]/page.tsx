import { getAllPosts, getPostBySlug } from '@/lib/posts';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.meta.title} — Stilldesk`,
    description: post.meta.description,
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { meta, content } = post;

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="w-full max-w-[640px] mx-auto">
        <Link
          href="/blog"
          className="text-xs text-muted hover:text-ink transition-colors duration-200 mb-10 inline-block"
        >
          ← All posts
        </Link>

        <article>
          <header className="mb-10">
            <h1 className="text-2xl font-light text-ink leading-snug mb-3">
              {meta.title}
            </h1>
            <p className="text-xs text-muted opacity-60">
              {new Date(meta.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              · {meta.readingTime} min read
            </p>
          </header>

          <div className="prose-stilldesk">
            <MDXRemote source={content} />
          </div>
        </article>

        <aside
          className="mt-16 p-6 rounded-xl bg-surface border border-surface"
          aria-label="Try Stilldesk"
        >
          <p className="text-ink font-light mb-4">
            Feeling stressed? Try a free 2-minute meditation right now.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-accent text-canvas text-sm font-medium hover:opacity-80 transition-opacity duration-200"
            aria-label="Start meditating on Stilldesk"
          >
            Start meditating →
          </Link>
        </aside>
      </div>
    </main>
  );
}
