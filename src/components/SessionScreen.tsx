'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Duration, Sound, Stats } from '@/types';
import { BreathingCircle } from './BreathingCircle';
import { useAudio } from './useAudio';

interface Props {
  duration: Duration;
  sound: Sound;
  onExit: () => void;
  onDone: () => void;
}

const PACE = { in: 4, out: 6 }; // Relaxing: 4s in, 6s out
const CIRCUMFERENCE = 942;

function readStats(): Stats | null {
  try { return JSON.parse(localStorage.getItem('stilldesk') || 'null'); } catch { return null; }
}

function saveStats(minutes: number): Stats {
  const s: Stats = readStats() ?? { sessions: 0, minutes: 0, lastDate: null, streak: 0 };
  const today = new Date().toDateString();
  const yest = new Date(Date.now() - 86400000).toDateString();
  if (s.lastDate === today) { /* same day, no streak change */ }
  else if (s.lastDate === yest) { s.streak = (s.streak || 0) + 1; }
  else { s.streak = 1; }
  s.sessions = (s.sessions || 0) + 1;
  s.minutes = (s.minutes || 0) + minutes;
  s.lastDate = today;
  try { localStorage.setItem('stilldesk', JSON.stringify(s)); } catch {}
  return s;
}

const SOUND_NAMES: Record<Sound, string> = {
  silence: 'Silence', water: 'Flowing water', birds: 'Birdsong',
  rain: 'Soft rain', wind: 'Open wind', chimes: 'Chimes',
};

type InternalScreen = 'session' | 'done';

export function SessionScreen({ duration, sound, onExit, onDone }: Props) {
  const [screen, setScreen] = useState<InternalScreen>('session');
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [doneStats, setDoneStats] = useState<Stats | null>(null);

  const audio = useAudio();
  const endTimeRef = useRef<number>(Date.now() + duration * 1000);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathInRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);
  const pausedRef = useRef(false);

  const clearBreath = useCallback(() => {
    if (breathInRef.current) clearTimeout(breathInRef.current);
    if (breathLoopRef.current) clearTimeout(breathLoopRef.current);
  }, []);

  const startBreath = useCallback(() => {
    clearBreath();
    const loop = () => {
      setBreathPhase('in');
      breathInRef.current = setTimeout(() => setBreathPhase('out'), PACE.in * 1000);
      breathLoopRef.current = setTimeout(loop, (PACE.in + PACE.out) * 1000);
    };
    loop();
  }, [clearBreath]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (tickRef.current) clearInterval(tickRef.current);
    clearBreath();
    audio.fadeOut();
    const stats = saveStats(duration / 60);
    setDoneStats(stats);
    setScreen('done');
  }, [audio, clearBreath, duration]);

  // Start session
  useEffect(() => {
    audio.start(sound);
    startBreath();
    endTimeRef.current = Date.now() + duration * 1000;

    tickRef.current = setInterval(() => {
      if (pausedRef.current) return;
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) finish();
    }, 250);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      clearBreath();
      audio.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePause = useCallback(() => {
    const nowPaused = !pausedRef.current;
    pausedRef.current = nowPaused;
    setPaused(nowPaused);
    if (nowPaused) {
      clearBreath();
      endTimeRef.current = Date.now() + timeLeft * 1000;
      audio.pause();
    } else {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      startBreath();
      audio.resume();
    }
  }, [audio, clearBreath, startBreath, timeLeft]);

  const toggleMute = useCallback(() => {
    setMuted(m => {
      if (m) { audio.unmute(); return false; }
      else { audio.mute(); return true; }
    });
  }, [audio]);

  const handleEnd = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    clearBreath();
    audio.stop();
    onExit();
  }, [audio, clearBreath, onExit]);

  const handleAgain = useCallback(() => {
    finishedRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    setMuted(false);
    setTimeLeft(duration);
    setBreathPhase('in');
    setScreen('session');
    audio.start(sound);
    endTimeRef.current = Date.now() + duration * 1000;
    startBreath();
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      if (pausedRef.current) return;
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) finish();
    }, 250);
  }, [audio, clearBreath, duration, finish, sound, startBreath]);

  const mm = Math.floor(timeLeft / 60);
  const ss = timeLeft % 60;
  const timeText = `${mm}:${String(ss).padStart(2, '0')}`;
  const ringOffset = Math.round(CIRCUMFERENCE * (1 - timeLeft / duration));

  const stats = doneStats ?? readStats();
  const statsLine = stats?.sessions
    ? `${stats.sessions} ${stats.sessions === 1 ? 'session' : 'sessions'}  ·  ${stats.minutes} min  ·  ${stats.streak || 1} day streak`
    : '';

  if (screen === 'done') {
    const minutes = duration / 60;
    return (
      <div className="anim-fade-up" style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: 24,
      }}>
        <div style={{
          width: 92, height: 92, borderRadius: '50%',
          background: 'radial-gradient(circle at 36% 30%, #fcefce, #e3a258 65%, #c47f3e)',
          boxShadow: '0 0 50px rgba(232,176,106,0.4)',
          marginBottom: 36,
        }} />
        <div style={{
          fontFamily: 'var(--font-cormorant)', fontWeight: 300,
          fontSize: 'clamp(34px, 5vw, 54px)', color: '#f4eee3',
        }}>Well done.</div>
        <div style={{
          fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(19px, 2.6vw, 26px)', color: 'rgba(241,236,226,0.6)',
          marginTop: 10, maxWidth: 440,
        }}>
          You gave yourself {minutes} {minutes === 1 ? 'minute' : 'minutes'} of stillness.
        </div>
        {statsLine && (
          <div style={{ marginTop: 30, fontSize: 13, letterSpacing: 2, color: 'rgba(241,236,226,0.42)' }}>
            {statsLine}
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, marginTop: 48 }}>
          <button onClick={handleAgain} style={{
            padding: '15px 34px', borderRadius: 40,
            border: '1px solid rgba(255,255,255,0.12)', background: 'transparent',
            color: 'rgba(241,236,226,0.7)', fontFamily: 'var(--font-instrument)',
            fontSize: 15, letterSpacing: '.5px', cursor: 'pointer',
          }}>Again</button>
          <button onClick={onDone} style={{
            padding: '16px 44px', borderRadius: 40,
            border: '1px solid rgba(232,176,106,0.55)', background: 'rgba(232,176,106,0.14)',
            color: '#f3dcb3', fontFamily: 'var(--font-instrument)',
            fontSize: 16, letterSpacing: 1, cursor: 'pointer',
          }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="anim-fade-in" style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 24,
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 38, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(241,236,226,0.4)' }}>
          {SOUND_NAMES[sound]}
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 26, color: 'rgba(241,236,226,0.6)', letterSpacing: 1 }}>
          {timeText}
        </div>
      </div>

      <BreathingCircle
        phase={breathPhase}
        inDuration={PACE.in}
        outDuration={PACE.out}
        ringOffset={ringOffset}
        showRing={true}
      />

      {/* Phase cue */}
      <div style={{ marginTop: 14, textAlign: 'center', height: 74 }}>
        <div style={{
          fontFamily: 'var(--font-cormorant)', fontWeight: 300,
          fontSize: 44, color: '#f4eee3', letterSpacing: 1,
        }}>
          {breathPhase === 'in' ? 'Breathe in' : 'Breathe out'}
        </div>
        <div style={{ fontSize: 14, letterSpacing: 2, color: 'rgba(241,236,226,0.45)', marginTop: 2 }}>
          {breathPhase === 'in' ? 'fill, slowly' : 'release, and soften'}
        </div>
      </div>

      {/* Controls */}
      <div style={{ position: 'absolute', bottom: 50, display: 'flex', alignItems: 'center', gap: 30 }}>
        <button onClick={handleEnd} style={{
          padding: '11px 22px', borderRadius: 40,
          border: '1px solid rgba(255,255,255,0.12)', background: 'transparent',
          color: 'rgba(241,236,226,0.55)', fontFamily: 'var(--font-instrument)',
          fontSize: 13, letterSpacing: 1.5, cursor: 'pointer',
        }}>END</button>

        <button onClick={togglePause} style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '1px solid rgba(232,176,106,0.4)', background: 'rgba(232,176,106,0.1)',
          color: '#f3dcb3', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {paused ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1"/>
              <rect x="14" y="5" width="4" height="14" rx="1"/>
            </svg>
          )}
        </button>

        <button onClick={toggleMute} style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.12)', background: 'transparent',
          color: 'rgba(241,236,226,0.6)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {muted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4z"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4z"/>
              <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
              <path d="M18.5 6a8 8 0 0 1 0 12"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
