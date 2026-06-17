export function Atmosphere() {
  return (
    <>
      {/* Sky gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #0a0d16 0%, #12101c 38%, #1a1320 64%, #241813 100%)',
      }} />

      {/* Warm glow from below */}
      <div style={{
        position: 'absolute', left: '50%', top: '64%',
        width: 1100, height: 1100,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(232,168,90,0.22) 0%, rgba(232,168,90,0.08) 32%, rgba(232,168,90,0) 60%)',
        pointerEvents: 'none',
      }} />

      {/* Stars */}
      <div style={{
        position: 'absolute', top: '7%', left: '5%',
        width: 2, height: 2, borderRadius: '50%',
        background: 'rgba(255,255,255,.6)',
        animation: 'twinkle 6s ease-in-out infinite',
        boxShadow: '40px 30px 0 rgba(255,255,255,.5), 180px 90px 0 rgba(255,255,255,.3), 320px 50px 0 rgba(255,255,255,.45), 460px 160px 0 rgba(255,255,255,.25), 600px 70px 0 rgba(255,255,255,.4), 760px 130px 0 rgba(255,255,255,.3), 900px 40px 0 rgba(255,255,255,.5), 1040px 110px 0 rgba(255,255,255,.28), 1180px 60px 0 rgba(255,255,255,.4), 1300px 150px 0 rgba(255,255,255,.25), 240px 200px 0 rgba(255,255,255,.22), 520px 230px 0 rgba(255,255,255,.3), 820px 210px 0 rgba(255,255,255,.24), 1100px 250px 0 rgba(255,255,255,.2), 120px 130px 0 rgba(255,255,255,.34), 680px 180px 0 rgba(255,255,255,.26)',
      }} />

      {/* Drifting bokeh */}
      <div style={{
        position: 'absolute', top: '22%', left: '16%',
        width: 220, height: 220, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(180,150,210,0.10), rgba(180,150,210,0))',
        filter: 'blur(8px)',
        animation: 'drift 34s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '14%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,176,106,0.10), rgba(232,176,106,0))',
        filter: 'blur(10px)',
        animation: 'drift 46s ease-in-out infinite reverse',
      }} />

      {/* Dunes */}
      <svg style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '42vh', minHeight: 280 }}
        viewBox="0 0 1440 360" preserveAspectRatio="none">
        <path d="M0,200 C260,150 420,250 720,235 C1020,220 1180,160 1440,205 L1440,360 L0,360 Z" fill="#181320" opacity="0.9" />
        <path d="M0,265 C320,210 560,300 860,290 C1140,281 1260,235 1440,270 L1440,360 L0,360 Z" fill="#120d0c" />
        <path d="M0,320 C300,290 520,340 820,332 C1120,324 1280,300 1440,322 L1440,360 L0,360 Z" fill="#0b0706" />
      </svg>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(120% 90% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)',
      }} />
    </>
  );
}
