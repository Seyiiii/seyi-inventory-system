function Logo({ size = 'md' }) {
  const sizes = {
    sm: { box: 18, text: 16, sub: 8 },
    md: { box: 24, text: 20, sub: 9 },
    lg: { box: 32, text: 26, sub: 10 }
  };
  const s = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Mark */}
      <svg width={s.box} height={s.box + 6} viewBox="0 0 22 28" fill="none">
        <rect x="0" y="10" width="22" height="18" rx="2" fill="#2563eb"/>
        <polygon points="0,10 11,3 11,10" fill="#1d4ed8"/>
        <polygon points="22,10 11,3 11,10" fill="#3b82f6"/>
        <rect x="9" y="0" width="4" height="10" rx="1" fill="white"/>
        <polygon points="11,-3 5,4 17,4" fill="white"/>
      </svg>
      {/* Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: s.text, fontWeight: 700, letterSpacing: '-0.5px', color: 'white' }}>
          SEYI<span style={{ color: '#60a5fa' }}>INVENTORY</span>
        </span>
        <span style={{ fontSize: s.sub, fontWeight: 400, letterSpacing: '3px', color: '#60a5fa', marginTop: '1px' }}>
          SYSTEM
        </span>
      </div>
    </div>
  );
}

export default Logo;