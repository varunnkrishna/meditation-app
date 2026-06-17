'use client';

interface BreathingOrbProps {
  phase: 'in' | 'out';
  inDuration: number;
  outDuration: number;
  ringOffset: number;
  showRing?: boolean;
}

const CIRCUMFERENCE = 942; // 2π × 150

export function BreathingCircle({ phase, inDuration, outDuration, ringOffset, showRing = true }: BreathingOrbProps) {
  const inhaling = phase === 'in';
  const scale = inhaling ? 1.18 : 0.78;
  const haloOp = inhaling ? 0.8 : 0.42;
  const transDur = inhaling ? inDuration : outDuration;

  const ringColor = showRing ? 'rgba(232,176,106,0.55)' : 'rgba(0,0,0,0)';
  const ringTrack = showRing ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0)';

  return (
    <div style={{
      position: 'relative',
      width: 'min(380px, 54vh)',
      height: 'min(380px, 54vh)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Progress ring */}
      <svg width="100%" height="100%" viewBox="0 0 380 380"
        style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <circle cx="190" cy="190" r="150" fill="none" stroke={ringTrack} strokeWidth="1.5" />
        <circle cx="190" cy="190" r="150" fill="none" stroke={ringColor} strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={ringOffset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>

      {/* Orb */}
      <div style={{
        transform: `scale(${scale})`,
        transition: `transform ${transDur}s ease-in-out`,
        position: 'relative',
        width: '60%',
        height: '60%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Halo */}
        <div style={{
          position: 'absolute',
          width: '131%',
          height: '131%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,176,106,0.5), rgba(232,176,106,0) 68%)',
          filter: 'blur(26px)',
          opacity: haloOp,
          transition: `opacity ${transDur}s ease-in-out`,
        }} />
        {/* Sphere */}
        <div style={{
          width: '88%',
          height: '88%',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 36% 30%, #fcefce 0%, #f4cf8e 32%, #e3a258 60%, #c47f3e 100%)',
          boxShadow: 'inset -16px -20px 44px rgba(120,66,20,0.5), inset 12px 14px 30px rgba(255,240,210,0.35), 0 0 60px rgba(232,176,106,0.35)',
        }} />
      </div>
    </div>
  );
}
