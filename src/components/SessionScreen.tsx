'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Duration, Sound } from '@/types';
import { BreathingCircle } from './BreathingCircle';
import { AudioPlayer, type AudioPlayerHandle } from './AudioPlayer';

interface SessionScreenProps {
  duration: Duration;
  sound: Sound;
  onExit: () => void;
  onComplete: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function audioSrc(sound: Sound): string | null {
  if (sound === 'birds') return '/audio/birds.mp3';
  if (sound === 'water') return '/audio/water.mp3';
  return null;
}

type Phase = 'running' | 'fading' | 'complete';

const TICK_MS = 250;
const FADE_MS = 2000;

export function SessionScreen({
  duration,
  sound,
  onExit,
  onComplete,
}: SessionScreenProps) {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [phase, setPhase] = useState<Phase>('running');
  const audioRef = useRef<AudioPlayerHandle>(null);
  const endTimeRef = useRef<number | null>(null);
  const sessionEndedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'running') return;

    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + duration * 1000;
    }

    const tick = () => {
      const endTime = endTimeRef.current;
      if (endTime === null) return;
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0 && !sessionEndedRef.current) {
        sessionEndedRef.current = true;
        setPhase('fading');
      }
    };

    tick();
    const intervalId = setInterval(tick, TICK_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [phase, duration]);

  useEffect(() => {
    if (phase !== 'fading') return;

    audioRef.current?.fadeOutAndStop();
    const timeoutId = setTimeout(() => setPhase('complete'), FADE_MS);
    return () => clearTimeout(timeoutId);
  }, [phase]);

  const handleExit = useCallback(() => {
    audioRef.current?.stop();
    onExit();
  }, [onExit]);

  if (phase === 'complete') {
    const minutes = duration / 60;
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-canvas px-6 text-center animate-fade-in-complete">
        <p className="text-3xl font-light text-ink mb-4">
          Well done. Take a moment.
        </p>
        <p className="text-muted mb-12 text-sm">
          You meditated for {minutes} minute{minutes !== 1 ? 's' : ''}.
        </p>
        <button
          onClick={onComplete}
          className="px-8 py-3 rounded-full bg-accent text-canvas text-sm font-medium transition-opacity duration-200 hover:opacity-80"
          aria-label="Meditate again"
        >
          Meditate again
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-canvas animate-fade-in-session">
      <button
        onClick={handleExit}
        className="absolute top-6 right-6 text-muted hover:text-ink transition-colors duration-200 text-2xl leading-none"
        aria-label="End session"
      >
        ×
      </button>

      <div className="flex flex-col items-center gap-12">
        <p
          className="text-8xl font-extralight tracking-widest text-ink tabular-nums"
          aria-live="polite"
          aria-label={`Time remaining: ${formatTime(timeLeft)}`}
        >
          {formatTime(timeLeft)}
        </p>
        <BreathingCircle />
      </div>

      <AudioPlayer ref={audioRef} src={audioSrc(sound)} />
    </div>
  );
}