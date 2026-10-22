import React, { useEffect, useState, useCallback, useRef } from 'react';
import { DASHBOARDS } from '../constants';

const INTRO_VIDEO =
  'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/5c77e574767e944d_QuickBoot.mp4';

const IntroScreen = ({ onDone, dashboard, onDashboardChange }) => {
  const [phase, setPhase] = useState('start');
  const videoRef = useRef(null);
  const chooseDashboard = onDashboardChange;

  const finish = useCallback(() => {
    setPhase('done');
    onDone();
  }, [onDone]);

  const startIntro = useCallback(() => setPhase('playing'), []);

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
        <div className="flex w-full flex-col items-center gap-10 px-6 text-center">
          {/* Dashboard picker */}
          <div className="w-full max-w-3xl">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-white/60">
              Pick your dashboard
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DASHBOARDS.map(({ id, label, hint, Icon }) => {
                const isActive = dashboard === id;
                return (
                  <button
                    key={id}
                    data-testid={`intro-dashboard-${id}`}
                    onClick={() => chooseDashboard(id)}
                    className={`group flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all ${
                      isActive
                        ? 'border-white bg-white text-black shadow-[0_0_0_3px_rgba(255,255,255,0.2)]'
                        : 'border-white/15 bg-white/5 text-white/85 hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isActive ? 'bg-black text-white' : 'bg-white/10 text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold">{label}</span>
                      {isActive && (
                        <span className="rounded-full bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${isActive ? 'text-black/70' : 'text-white/50'}`}>
                      {hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            data-testid="intro-enter-btn"
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
