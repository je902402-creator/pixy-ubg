import React, { useEffect, useRef } from 'react';

// Renders an animated starry background with drifting/twinkling stars
// and static constellation SVG lines on top.
const StarField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const STAR_COUNT = Math.floor((width * height) / 6000);
    const stars = Array.from({ length: STAR_COUNT }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.2,
      a: Math.random() * 0.8 + 0.2,
      da: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? -1 : 1),
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
    }));

    let rafId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        s.a += s.da;
        if (s.a <= 0.15 || s.a >= 1) s.da *= -1;
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(render);
    };
    render();

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Constellations SVG overlay */}
      <svg
        className="absolute inset-0 h-full w-full opacity-70"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1600 900"
      >
        <g stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none">
          {/* Constellation 1 - top left */}
          <polyline points="60,80 130,60 200,110 260,70 320,130" />
          <circle cx="60" cy="80" r="2" fill="white" />
          <circle cx="130" cy="60" r="2.4" fill="white" />
          <circle cx="200" cy="110" r="1.8" fill="white" />
          <circle cx="260" cy="70" r="2" fill="white" />
          <circle cx="320" cy="130" r="2.2" fill="white" />

          {/* Constellation 2 - top right */}
          <polyline points="1300,60 1370,90 1440,50 1510,110 1560,70" />
          <circle cx="1300" cy="60" r="2" fill="white" />
          <circle cx="1370" cy="90" r="2.4" fill="white" />
          <circle cx="1440" cy="50" r="1.8" fill="white" />
          <circle cx="1510" cy="110" r="2" fill="white" />
          <circle cx="1560" cy="70" r="2" fill="white" />

          {/* Constellation 3 - middle left */}
          <polyline points="40,420 110,470 90,540 170,560 220,500" />
          <circle cx="40" cy="420" r="2" fill="white" />
          <circle cx="110" cy="470" r="2.2" fill="white" />
          <circle cx="90" cy="540" r="1.6" fill="white" />
          <circle cx="170" cy="560" r="2" fill="white" />
          <circle cx="220" cy="500" r="2.2" fill="white" />

          {/* Constellation 4 - middle right */}
          <polyline points="1400,380 1460,430 1530,410 1580,470 1520,540" />
          <circle cx="1400" cy="380" r="2" fill="white" />
          <circle cx="1460" cy="430" r="2.2" fill="white" />
          <circle cx="1530" cy="410" r="1.6" fill="white" />
          <circle cx="1580" cy="470" r="2" fill="white" />
          <circle cx="1520" cy="540" r="2.2" fill="white" />

          {/* Constellation 5 - bottom center */}
          <polyline points="620,780 700,820 780,790 860,830 940,800" />
          <circle cx="620" cy="780" r="2" fill="white" />
          <circle cx="700" cy="820" r="2.4" fill="white" />
          <circle cx="780" cy="790" r="1.8" fill="white" />
          <circle cx="860" cy="830" r="2" fill="white" />
          <circle cx="940" cy="800" r="2.2" fill="white" />

          {/* Sparkle crosses */}
          <g stroke="rgba(255,255,255,0.6)" strokeWidth="1.2">
            <line x1="420" y1="330" x2="420" y2="350" />
            <line x1="410" y1="340" x2="430" y2="340" />
            <line x1="1100" y1="200" x2="1100" y2="220" />
            <line x1="1090" y1="210" x2="1110" y2="210" />
            <line x1="820" y1="420" x2="820" y2="440" />
            <line x1="810" y1="430" x2="830" y2="430" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default StarField;
