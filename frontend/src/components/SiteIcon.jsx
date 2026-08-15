import React from 'react';

// Renders per-app custom icons based on the mock data descriptor.
const SiteIcon = ({ site }) => {
  const { iconType, iconValue, accent, bg, name } = site;

  const baseStyle = {
    background: bg,
  };

  // Bee illustration (BeeZ)
  if (iconType === 'emoji-svg' && iconValue === 'bee') {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={baseStyle}
      >
        <svg viewBox="0 0 64 64" className="h-16 w-16" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="32" cy="38" rx="18" ry="12" fill="#f5a623" />
          <rect x="20" y="30" width="6" height="16" fill="#2b2b2b" />
          <rect x="32" y="30" width="6" height="16" fill="#2b2b2b" />
          <ellipse cx="20" cy="30" rx="10" ry="6" fill="#ffffff" opacity="0.75" />
          <ellipse cx="44" cy="30" rx="10" ry="6" fill="#ffffff" opacity="0.75" />
          <circle cx="14" cy="38" r="3" fill="#2b2b2b" />
          <circle cx="14" cy="38" r="1" fill="white" />
        </svg>
      </div>
    );
  }

  // Frog gummy (Frogies arcade)
  if (iconType === 'emoji-svg' && iconValue === 'frog') {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={baseStyle}
      >
        <svg viewBox="0 0 64 64" className="h-16 w-16" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="18" r="8" fill="#7ed957" />
          <circle cx="42" cy="18" r="8" fill="#7ed957" />
          <rect x="14" y="22" width="36" height="28" rx="12" fill="#7ed957" />
          <circle cx="22" cy="18" r="3" fill="#0f0f0f" />
          <circle cx="42" cy="18" r="3" fill="#0f0f0f" />
          <path d="M22 38 Q32 46 42 38" stroke="#0f0f0f" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Text-based letter icons with unique styling per site
  const textStyle = {
    color: accent,
    textShadow: `0 0 12px ${accent}, 0 0 24px ${accent}66`,
  };

  // Special cursive C for Cine os v2
  if (site.id === 'cine-os-v2') {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={baseStyle}
      >
        <span
          className="font-serif italic"
          style={{
            fontSize: '3.75rem',
            fontFamily: "'Playfair Display', Georgia, serif",
            ...textStyle,
          }}
        >
          C
        </span>
      </div>
    );
  }

  // T9 os stylized T
  if (site.id === 't9-os') {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={baseStyle}
      >
        <svg viewBox="0 0 64 64" className="h-14 w-14" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="t9g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b1cff" />
              <stop offset="100%" stopColor="#c026d3" />
            </linearGradient>
          </defs>
          <path
            d="M14 12 H50 M32 12 V48 M32 48 Q26 52 22 48"
            stroke="url(#t9g)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // Figure cloud - F with CLOUD text
  if (site.id === 'figure-cloud') {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center"
        style={baseStyle}
      >
        <span
          className="font-black"
          style={{
            fontSize: '3rem',
            lineHeight: 1,
            color: '#000',
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          F
        </span>
        <span
          className="mt-1 rounded-sm px-1 text-[10px] font-bold tracking-widest"
          style={{ background: '#000', color: '#fff' }}
        >
          CLOUD
        </span>
      </div>
    );
  }

  // Genizymath - gn
  if (site.id === 'genizymath') {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={baseStyle}
      >
        <span
          className="font-mono font-bold"
          style={{ fontSize: '2.75rem', color: '#fff', letterSpacing: '-2px' }}
        >
          gn
        </span>
      </div>
    );
  }

  // Polaris stylized P
  if (site.id === 'polaris') {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={baseStyle}
      >
        <svg viewBox="0 0 64 64" className="h-14 w-14" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="polg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffcd3a" />
              <stop offset="100%" stopColor="#ff5a1f" />
            </linearGradient>
          </defs>
          <path
            d="M20 52 V16 Q20 12 24 12 H38 Q48 12 48 22 Q48 32 38 32 H24"
            stroke="url(#polg)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M14 46 L30 40" stroke="url(#polg)" strokeWidth="3" strokeLinecap="round" />
          <path d="M14 52 L34 46" stroke="url(#polg)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Default: bold letter
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={baseStyle}
    >
      <span
        className="font-black"
        style={{ fontSize: iconValue.length > 1 ? '2.4rem' : '3.5rem', ...textStyle }}
      >
        {iconValue}
      </span>
    </div>
  );
};

export default SiteIcon;
