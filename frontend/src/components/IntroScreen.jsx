import React, { useEffect, useState, useCallback, useRef } from 'react';

const INTRO_VIDEO =
  'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/5c77e574767e944d_QuickBoot.mp4';

// IntroScreen phases:
//   'start'   -> black screen with ENTER button
//   'playing' -> full-screen intro video; press Enter (or click) again to skip
//   'done'    -> hides overlay, reveals site
const IntroScreen = ({ onDone }) => {
  const [phase, setPhase] = useState('start');
  const videoRef = useRef(null);

  const finish = useCallback(() => {
    setPhase('done');
    onDone();
  }, [onDone]);

  const startIntro = useCallback(() => {
    setPhase('playing');
  }, []);

  // Keyboard handler
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (phase === 'start') startIntro();
      else if (phase === 'playing') finish();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, startIntro, finish]);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      onClick={phase === 'playing' ? finish : undefined}
      role="dialog"
      aria-label="Site intro"
    >
      {phase === 'start' && (
        <div className="flex flex-col items-center gap-6 px-6 text-center">
          <button
            onClick={startIntro}
            className="group relative overflow-hidden rounded-lg border border-white/20 bg-white px-10 py-4 text-lg font-bold uppercase tracking-[0.35em] text-black transition-transform duration-200 hover:scale-105 focus:outline-none"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            <span className="relative z-10">Enter</span>
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
          <p className="max-w-xs text-xs uppercase tracking-widest text-white/40">
            press enter or click to begin
          </p>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <video
            ref={videoRef}
            src={INTRO_VIDEO}
            autoPlay
            muted
            playsInline
            onEnded={finish}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/30 bg-black/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-white/80 backdrop-blur-sm">
            press enter to skip
          </div>
        </>
      )}
    </div>
  );
};

export default IntroScreen;
