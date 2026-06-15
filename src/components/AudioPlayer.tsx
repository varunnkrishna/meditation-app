'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface AudioPlayerHandle {
  fadeOutAndStop: () => void;
  stop: () => void;
}

interface AudioPlayerProps {
  src: string | null;
}

const FADE_MS = 2000;
const FADE_STEPS = 40;

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
  function AudioPlayer({ src }, ref) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearFade = () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio || !src) return;
      audio.volume = 1;
      audio.play().catch(() => {});
      return () => {
        clearFade();
        audio.pause();
        audio.currentTime = 0;
      };
    }, [src]);

    useEffect(() => () => clearFade(), []);

    useImperativeHandle(ref, () => ({
      fadeOutAndStop() {
        const audio = audioRef.current;
        if (!audio) return;
        clearFade();
        const startVolume = audio.volume;
        const stepMs = FADE_MS / FADE_STEPS;
        let step = 0;
        fadeIntervalRef.current = setInterval(() => {
          step++;
          audio.volume = Math.max(0, startVolume * (1 - step / FADE_STEPS));
          if (step >= FADE_STEPS) {
            clearFade();
            audio.pause();
            audio.currentTime = 0;
          }
        }, stepMs);
      },
      stop() {
        const audio = audioRef.current;
        if (!audio) return;
        clearFade();
        audio.pause();
        audio.currentTime = 0;
      },
    }));

    if (!src) return null;
    return (
      <audio ref={audioRef} src={src} loop preload="auto" className="hidden" />
    );
  }
);