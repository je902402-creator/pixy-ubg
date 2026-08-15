import React from 'react';
import { AlertTriangle } from 'lucide-react';

const CLASSLINK_LOGO =
  'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/9wb3a1zu_image.png';

// Small top-left brand + panic button (opens ClassLink in same tab).
const BrandBar = () => {
  const triggerPanic = () => {
    window.location.href = 'https://launchpad.classlink.com';
  };

  return (
    <div className="pointer-events-auto absolute left-4 top-4 z-30 flex items-center gap-3 sm:left-6 sm:top-6">
      {/* Made by neuro sign */}
      <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
        <span
          className="text-xs font-bold uppercase tracking-[0.25em] text-white/90 sm:text-sm"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          Made by neuro
        </span>
      </div>

      {/* Panic button */}
      <button
        onClick={triggerPanic}
        aria-label="Panic button - open ClassLink"
        title="Panic! Opens ClassLink"
        className="group flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 backdrop-blur-md transition-transform duration-200 hover:scale-105 hover:border-red-400/60 focus:outline-none"
      >
        <span
          className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md"
          style={{ background: '#2ea3d8' }}
        >
          <img
            src={CLASSLINK_LOGO}
            alt="ClassLink"
            className="h-9 w-9 object-cover"
            draggable={false}
          />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-red-400">
            <AlertTriangle className="h-3 w-3" />
            Panic
          </span>
          <span className="text-[10px] font-medium text-white/70">button</span>
        </span>
      </button>
    </div>
  );
};

export default BrandBar;
