import { getAllPosts } from '@/lib/posts';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — Stilldesk',
  description:
    'Practical meditation tips for people who work. Short reads, actionable techniques, no fluff.',
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="w-full max-w-[640px] mx-auto">
        <header className="mb-12">
          <Link
            href="/"
            className="text-xs text-muted hover:text-ink transition-colors duration-200 mb-8 inline-block"
          >
            ← Back to Stilldesk
          </Link>
          <h1 className="text-2xl font-light text-ink">Blog</h1>
          <p className="text-muted text-sm mt-2">
            Meditation for people who work.
          </p>
        </header>

        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block"
                aria-label={`Read: ${post.title}`}
              >
                <article>
                  <h2 className="text-base font-light text-ink group-hover:text-accent transition-colors duration-200">
                    {post.title}
                  </h2>
                  <p className="text-muted text-sm mt-1">{post.description}</p>
                  <p className="text-xs text-muted mt-2 opacity-60">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    · {post.readingTime} min read
                  </p>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
