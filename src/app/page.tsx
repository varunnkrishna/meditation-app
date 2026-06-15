'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Duration, Sound } from '@/types';
import { SessionScreen } from '@/components/SessionScreen';

const DURATIONS: { label: string; value: Duration }[] = [
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
];

const SOUNDS: { label: string; value: Sound }[] = [
  { label: 'Birds', value: 'birds' },
  { label: 'Water', value: 'water' },
  { label: 'Silence', value: 'silence' },
];

type Phase = 'setup' | 'session';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [duration, setDuration] = useState<Duration | null>(null);
  const [sound, setSound] = useState<Sound | null>(null);

  function reset() {
    setPhase('setup');
    setDuration(null);
    setSound(null);
  }

  if (phase === 'session' && duration !== null && sound !== null) {
    return (
      <SessionScreen
        duration={duration}
        sound={sound}
        onExit={reset}
        onComplete={reset}
      />
    );
  }

  const canStart = duration !== null && sound !== null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[640px]">
        <header className="mb-16 text-center">
          <h1 className="text-2xl font-light text-ink tracking-wide">
            Stilldesk
          </h1>
          <p className="text-muted text-sm mt-2">
            Meditate in seconds. No login.
          </p>
        </header>

        <div className="space-y-12">
          <section aria-labelledby="duration-label">
            <h2
              id="duration-label"
              className="text-base font-light text-muted mb-4"
            >
              How long?
            </h2>
            <div
              className="grid grid-cols-4 gap-3"
              role="group"
              aria-labelledby="duration-label"
            >
              {DURATIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setDuration(value)}
                  aria-pressed={duration === value}
                  className={[
                    'py-4 rounded-lg text-sm font-light transition-all duration-200',
                    'min-h-[48px] border',
                    duration === value
                      ? 'bg-accent text-canvas border-accent'
                      : 'bg-surface text-ink border-surface hover:border-accent/50',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="sound-label">
            <h2
              id="sound-label"
              className="text-base font-light text-muted mb-4"
            >
              Sound?
            </h2>
            <div
              className="grid grid-cols-3 gap-3"
              role="group"
              aria-labelledby="sound-label"
            >
              {SOUNDS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setSound(value)}
                  aria-pressed={sound === value}
                  className={[
                    'py-4 rounded-lg text-sm font-light transition-all duration-200',
                    'min-h-[48px] border',
                    sound === value
                      ? 'bg-accent text-canvas border-accent'
                      : 'bg-surface text-ink border-surface hover:border-accent/50',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={() => canStart && setPhase('session')}
            disabled={!canStart}
            aria-disabled={!canStart}
            className={[
              'w-full py-4 rounded-full text-sm font-medium transition-all duration-200',
              canStart
                ? 'bg-accent text-canvas hover:opacity-90 cursor-pointer'
                : 'bg-surface text-muted cursor-not-allowed opacity-50',
            ].join(' ')}
          >
            Start
          </button>
        </div>

        <footer className="mt-16 text-center">
          <Link
            href="/blog"
            className="text-xs text-muted hover:text-ink transition-colors duration-200"
          >
            Read the blog →
          </Link>
        </footer>
      </div>
    </main>
  );
}
