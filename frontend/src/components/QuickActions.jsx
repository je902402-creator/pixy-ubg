import React, { useEffect, useState } from 'react';
import { CALLS_URL, PANIC_URL } from '../constants';

export const triggerPanic = () => { window.location.href = PANIC_URL; };

export const CallsIcon = ({ className = 'h-6 w-6' }) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-[6px] ${className}`}
    style={{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' }}
  >
    <svg viewBox="0 0 24 24" className="h-[65%] w-[65%] text-white" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .5 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z" />
    </svg>
  </span>
);

export const CallsLink = ({ className, children, testId }) => (
  <a
    href={CALLS_URL}
    target="_blank"
    rel="noopener noreferrer"
    title="Open Calls (GameVox)"
    aria-label="Open Calls"
    data-testid={testId}
    className={className}
  >
    {children}
  </a>
);

export const ClockText = ({ className = '' }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);
  return (
    <span data-testid="header-clock" className={`tabular-nums ${className}`}>
      {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
    </span>
  );
};

export const MadeByBadge = () => (
  <div data-testid="made-by-badge" className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1">
    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/85">Made by neuro</span>
  </div>
);
