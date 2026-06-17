'use client';

import { useRef, useCallback } from 'react';
import type { Sound } from '@/types';

const TARGETS: Record<Sound, number> = {
  silence: 0, rain: 0.12, water: 0.16, wind: 0.16, birds: 0.14, chimes: 0.13,
};

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioScheduledSourceNode[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const targetRef = useRef<number>(0);
  const pausedRef = useRef(false);

  function ensureCtx() {
    if (ctxRef.current) {
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    ctxRef.current = ctx;
    masterRef.current = master;
  }

  function ramp(value: number, duration: number) {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(value, now + duration);
  }

  function noiseBuffer(kind: 'white' | 'brown' | 'pink') {
    const ctx = ctxRef.current!;
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else if (kind === 'pink') { last = 0.96 * last + 0.04 * w; d[i] = (last * 2 + w) * 0.4; }
      else d[i] = w;
    }
    return buf;
  }

  function noiseSrc(kind: 'white' | 'brown' | 'pink') {
    const ctx = ctxRef.current!;
    const s = ctx.createBufferSource();
    s.buffer = noiseBuffer(kind);
    s.loop = true;
    return s;
  }

  function stopAll() {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
    const nodes = nodesRef.current;
    nodesRef.current = [];
    ramp(0, 0.6);
    setTimeout(() => { nodes.forEach(n => { try { n.stop(); } catch {} }); }, 700);
  }

  const start = useCallback((sound: Sound) => {
    ensureCtx();
    stopAll();
    pausedRef.current = false;
    targetRef.current = TARGETS[sound];

    const ctx = ctxRef.current!;
    const master = masterRef.current!;

    if (sound === 'rain') {
      const n = noiseSrc('white');
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8500;
      n.connect(hp); hp.connect(lp); lp.connect(master); n.start();
      nodesRef.current.push(n);

    } else if (sound === 'water') {
      const n = noiseSrc('brown');
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.13;
      const lg = ctx.createGain(); lg.gain.value = 280;
      lfo.connect(lg); lg.connect(lp.frequency);
      n.connect(lp); lp.connect(master); n.start(); lfo.start();
      nodesRef.current.push(n, lfo);

    } else if (sound === 'wind') {
      const n = noiseSrc('brown');
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 480;
      const g = ctx.createGain(); g.gain.value = 0.7;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
      const lg = ctx.createGain(); lg.gain.value = 0.4;
      lfo.connect(lg); lg.connect(g.gain);
      const lfo2 = ctx.createOscillator(); lfo2.frequency.value = 0.05;
      const lg2 = ctx.createGain(); lg2.gain.value = 220;
      lfo2.connect(lg2); lg2.connect(lp.frequency);
      n.connect(lp); lp.connect(g); g.connect(master); n.start(); lfo.start(); lfo2.start();
      nodesRef.current.push(n, lfo, lfo2);

    } else if (sound === 'birds') {
      const bed = noiseSrc('brown');
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
      const bg = ctx.createGain(); bg.gain.value = 0.25;
      bed.connect(lp); lp.connect(bg); bg.connect(master); bed.start();
      nodesRef.current.push(bed);

      const chirp = () => {
        if (pausedRef.current) return;
        const t0 = ctx.currentTime;
        const notes = 2 + Math.floor(Math.random() * 3);
        for (let k = 0; k < notes; k++) {
          const t = t0 + k * 0.13;
          const o = ctx.createOscillator(); o.type = 'sine';
          const base = 2400 + Math.random() * 1600;
          o.frequency.setValueAtTime(base, t);
          o.frequency.exponentialRampToValueAtTime(base * (1.3 + Math.random() * 0.4), t + 0.05);
          o.frequency.exponentialRampToValueAtTime(base * 0.85, t + 0.11);
          const gn = ctx.createGain();
          gn.gain.setValueAtTime(0, t);
          gn.gain.linearRampToValueAtTime(0.5, t + 0.01);
          gn.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          o.connect(gn); gn.connect(master); o.start(t); o.stop(t + 0.14);
        }
      };
      intervalsRef.current.push(setInterval(() => { if (Math.random() > 0.35) chirp(); }, 1900));

    } else if (sound === 'chimes') {
      const scale = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
      const bell = () => {
        if (pausedRef.current) return;
        const t = ctx.currentTime;
        const f = scale[Math.floor(Math.random() * scale.length)];
        ([[1, 0.5], [2.01, 0.18], [3.0, 0.1]] as [number, number][]).forEach(([m, a]) => {
          const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * m;
          const gn = ctx.createGain();
          gn.gain.setValueAtTime(0, t);
          gn.gain.linearRampToValueAtTime(a, t + 0.02);
          gn.gain.exponentialRampToValueAtTime(0.0008, t + 3.4);
          o.connect(gn); gn.connect(master); o.start(t); o.stop(t + 3.5);
        });
      };
      intervalsRef.current.push(setInterval(() => { if (Math.random() > 0.4) bell(); }, 2600));
    }

    ramp(sound === 'silence' ? 0 : targetRef.current, 2.2);
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
    ramp(0, 0.6);
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    ramp(targetRef.current, 1.4);
  }, []);

  const mute = useCallback(() => ramp(0, 0.7), []);
  const unmute = useCallback(() => {
    if (!pausedRef.current) ramp(targetRef.current, 0.7);
  }, []);

  const fadeOut = useCallback(() => ramp(0, 2.0), []);

  const stop = useCallback(() => {
    stopAll();
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
      masterRef.current = null;
    }
  }, []);

  return { start, pause, resume, mute, unmute, fadeOut, stop };
}
