import React from 'react';
import { Star } from 'lucide-react';
import SiteIcon from './SiteIcon';

const SiteTile = ({ site, onClick, isFavorite, onToggleFavorite }) => {
  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(site.id);
  };

  return (
    <div className="group relative flex flex-col items-center gap-3">
      {/* Favorite star button */}
      <button
        onClick={handleStarClick}
        aria-label={isFavorite ? `Unfavorite ${site.name}` : `Favorite ${site.name}`}
        className="absolute -right-1 -top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/70 backdrop-blur-sm transition-transform duration-200 hover:scale-110"
      >
        <Star
          className={`h-4 w-4 transition-colors duration-200 ${
            isFavorite ? 'text-yellow-300' : 'text-white/60'
          }`}
          fill={isFavorite ? '#fde047' : 'none'}
          strokeWidth={2}
        />
      </button>

      <button
        onClick={() => onClick(site)}
        className="flex flex-col items-center gap-3 focus:outline-none"
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
    </div>
  );
};

export default SiteTile;
