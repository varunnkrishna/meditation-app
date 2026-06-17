'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Duration, Sound, Stats } from '@/types';
import { SessionScreen } from '@/components/SessionScreen';
import { Atmosphere } from '@/components/Atmosphere';

type Screen = 'home' | 'setup' | 'session';

const DURATIONS: { label: string; value: Duration }[] = [
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
];

type SoundDef = { label: string; value: Sound; icon: React.ReactNode };

function SoundIcon({ id }: { id: Sound }) {
  if (id === 'silence') return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>
    </svg>
  );
  if (id === 'water') return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/>
    </svg>
  );
  if (id === 'birds') return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11c1.6-2.4 3.4-2.4 5 0 1.6-2.4 3.4-2.4 5 0"/><path d="M14.5 13c1.4-2 3-2 4.5 0"/>
    </svg>
  );
  if (id === 'rain') return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13a4 4 0 0 1 .9-7.9 5 5 0 0 1 9.6 1.2A3.5 3.5 0 0 1 18 13"/>
      <path d="M8 17l-1 2.5M12.5 17l-1 2.5M17 17l-1 2.5"/>
    </svg>
  );
  if (id === 'wind') return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5"/><path d="M3 12h15a2.5 2.5 0 1 1-2.5 2.5"/><path d="M3 16h8"/>
    </svg>
  );
  // chimes
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4a5 5 0 0 0-5 5c0 5-2 6-2 6h14s-2-1-2-6a5 5 0 0 0-5-5z"/>
      <path d="M10.4 19a1.6 1.6 0 0 0 3.2 0"/>
    </svg>
  );
}

const SOUNDS: Sound[] = ['silence', 'water', 'birds', 'rain', 'wind', 'chimes'];
const SOUND_LABELS: Record<Sound, string> = {
  silence: 'Silence', water: 'Water', birds: 'Birds', rain: 'Rain', wind: 'Wind', chimes: 'Chimes',
};

function pillStyle(selected: boolean): React.CSSProperties {
  return {
    padding: '14px 26px', borderRadius: 40,
    border: `1px solid ${selected ? 'rgba(232,176,106,.55)' : 'rgba(255,255,255,.1)'}`,
    background: selected ? 'rgba(232,176,106,.13)' : 'rgba(255,255,255,.025)',
    color: selected ? '#f3dcb3' : '#b3a896',
    fontFamily: 'var(--font-instrument)', fontSize: 16, letterSpacing: '.4px',
    cursor: 'pointer', transition: 'all .35s ease', backdropFilter: 'blur(4px)',
    boxShadow: selected ? '0 0 22px rgba(232,176,106,.18)' : 'none',
  };
}

function cardStyle(selected: boolean): React.CSSProperties {
  return {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11,
    padding: '22px 10px', borderRadius: 20,
    border: `1px solid ${selected ? 'rgba(232,176,106,.5)' : 'rgba(255,255,255,.08)'}`,
    background: selected ? 'rgba(232,176,106,.1)' : 'rgba(255,255,255,.022)',
    color: selected ? '#f3dcb3' : '#9d9384',
    fontFamily: 'var(--font-instrument)', cursor: 'pointer',
    transition: 'all .35s ease',
    boxShadow: selected ? '0 0 24px rgba(232,176,106,.16)' : 'none',
  };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Rest easy';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Wind down';
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('home');
  const [duration, setDuration] = useState<Duration>(300);
  const [sound, setSound] = useState<Sound>('water');
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem('stilldesk');
      if (s) setStats(JSON.parse(s));
    } catch {}
  }, []);

  function reloadStats() {
    try {
      const s = localStorage.getItem('stilldesk');
      if (s) setStats(JSON.parse(s));
    } catch {}
  }

  const statsLine = stats?.sessions
    ? `${stats.sessions} ${stats.sessions === 1 ? 'session' : 'sessions'}  ·  ${stats.minutes} min  ·  ${stats.streak || 1} day streak`
    : null;

  if (screen === 'session') {
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
        <Atmosphere />
        <SessionScreen
          duration={duration}
          sound={sound}
          onExit={() => setScreen('home')}
          onDone={() => { reloadStats(); setScreen('home'); }}
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <Atmosphere />

      {/* HOME */}
      {screen === 'home' && (
        <div className="anim-fade-up" style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', padding: 24,
        }}>
          <div style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(232,176,106,0.8)', marginBottom: 26, fontWeight: 500 }}>
            Stilldesk
          </div>
          <div style={{
            fontFamily: 'var(--font-cormorant)', fontWeight: 300,
            fontSize: 'clamp(40px, 7vw, 78px)', lineHeight: 1.05, color: '#f4eee3',
          }}>
            {greeting()}.
          </div>
          <div style={{
            fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontStyle: 'italic',
            fontSize: 'clamp(20px, 3vw, 30px)', color: 'rgba(241,236,226,0.62)',
            marginTop: 10, maxWidth: 460,
          }}>
            Take a few quiet minutes. Your breath is waiting.
          </div>
          <button onClick={() => setScreen('setup')} style={{
            marginTop: 52, padding: '17px 54px', borderRadius: 44,
            border: '1px solid rgba(232,176,106,0.5)', background: 'rgba(232,176,106,0.12)',
            color: '#f3dcb3', fontFamily: 'var(--font-instrument)',
            fontSize: 17, letterSpacing: 1, cursor: 'pointer', backdropFilter: 'blur(6px)',
            transition: 'all .4s ease',
          }}>Begin</button>
          {statsLine && (
            <div style={{ marginTop: 40, fontSize: 13, letterSpacing: 2, color: 'rgba(241,236,226,0.4)' }}>
              {statsLine}
            </div>
          )}
          <Link href="/blog" style={{
            position: 'absolute', bottom: 32, fontSize: 12,
            color: 'rgba(241,236,226,0.3)', textDecoration: 'none', letterSpacing: 2,
          }}>
            Blog →
          </Link>
        </div>
      )}

      {/* SETUP */}
      {screen === 'setup' && (
        <div className="anim-fade-up-fast" style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: 32, overflowY: 'auto',
        }}>
          <div style={{
            fontFamily: 'var(--font-cormorant)', fontWeight: 300,
            fontSize: 'clamp(30px, 4.5vw, 46px)', color: '#f4eee3', textAlign: 'center',
          }}>Settle in</div>
          <div style={{ fontSize: 14, letterSpacing: 2, color: 'rgba(241,236,226,0.5)', marginTop: 6, textAlign: 'center' }}>
            Choose your length &amp; your sound
          </div>

          <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(232,176,106,0.7)', margin: '46px 0 18px' }}>
            Duration
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            {DURATIONS.map(({ label, value }) => (
              <button key={value} onClick={() => setDuration(value)} style={pillStyle(duration === value)}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(232,176,106,0.7)', margin: '40px 0 18px' }}>
            Sound
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 116px)', gap: 14 }}>
            {SOUNDS.map(id => (
              <button key={id} onClick={() => setSound(id)} style={cardStyle(sound === id)}>
                <SoundIcon id={id} />
                <span style={{ fontSize: 14, letterSpacing: '.5px' }}>{SOUND_LABELS[id]}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 50 }}>
            <button onClick={() => setScreen('home')} style={{
              padding: '15px 30px', borderRadius: 40,
              border: '1px solid rgba(255,255,255,0.12)', background: 'transparent',
              color: 'rgba(241,236,226,0.65)', fontFamily: 'var(--font-instrument)',
              fontSize: 15, letterSpacing: '.5px', cursor: 'pointer', transition: 'all .35s ease',
            }}>Back</button>
            <button onClick={() => setScreen('session')} style={{
              padding: '16px 48px', borderRadius: 40,
              border: '1px solid rgba(232,176,106,0.55)', background: 'rgba(232,176,106,0.14)',
              color: '#f3dcb3', fontFamily: 'var(--font-instrument)',
              fontSize: 16, letterSpacing: 1, cursor: 'pointer', transition: 'all .35s ease',
            }}>Begin session</button>
          </div>
        </div>
      )}
    </div>
  );
}
