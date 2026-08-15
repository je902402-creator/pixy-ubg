import React from 'react';
import SiteIcon from './SiteIcon';

const SiteTile = ({ site, onClick }) => {
  return (
    <button
      onClick={() => onClick(site)}
      className="group flex flex-col items-center gap-3 focus:outline-none"
      aria-label={`Open ${site.name}`}
    >
      <div
        className="relative h-28 w-28 overflow-hidden rounded-[26px] border border-white/10 shadow-lg transition-transform duration-300 ease-out will-change-transform group-hover:-translate-y-1 group-hover:scale-[1.06] sm:h-32 sm:w-32"
        style={{
          boxShadow: `0 10px 30px -10px ${site.glow}55, 0 0 0 1px rgba(255,255,255,0.06) inset`,
        }}
      >
        <SiteIcon site={site} />
        {/* Glow ring on hover */}
        <span
          className="pointer-events-none absolute inset-0 rounded-[26px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: `0 0 0 2px ${site.glow}66, 0 0 40px 4px ${site.glow}55`,
          }}
        />
        {/* Subtle top shine */}
        <span className="pointer-events-none absolute inset-x-2 top-1 h-6 rounded-full bg-white/10 blur-md" />
      </div>
      <span className="rounded-md bg-white/5 px-3 py-1 text-sm font-semibold text-white/95 backdrop-blur-sm sm:text-base">
        {site.name}
      </span>
    </button>
  );
};

export default SiteTile;
