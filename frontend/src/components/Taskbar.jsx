import React from 'react';
import SiteIcon from './SiteIcon';

const Taskbar = ({ wins, actions, topId }) => {
  if (!wins.length) return null;
  const onClick = (w) => (w.minimized || w.id !== topId ? actions.focus(w.id) : actions.minimize(w.id));
  return (
    <div
      data-testid="taskbar"
      className="taskbar-in fixed bottom-3 left-1/2 z-[35] flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-2 overflow-x-auto rounded-2xl border border-white/15 bg-black/60 px-3 py-2 shadow-2xl backdrop-blur-xl"
    >
      {wins.map((w) => {
        const on = !w.minimized && w.id === topId;
        return (
          <button
            key={w.id}
            data-testid={`taskbar-item-${w.siteId}`}
            onClick={() => onClick(w)}
            title={w.site.name}
            aria-label={`${w.site.name}${w.minimized ? ' (minimized)' : ''}`}
            className={`relative flex flex-col items-center transition-transform hover:-translate-y-1 ${w.minimized ? 'opacity-60' : ''}`}
          >
            <span className={`h-10 w-10 overflow-hidden rounded-xl border ${on ? 'theme-btn border-white' : 'border-white/10'}`}><SiteIcon site={w.site} /></span>
            <span className={`mt-1 h-1 rounded-full transition-all ${w.minimized ? 'w-1 bg-white/40' : on ? 'theme-bg w-4 bg-white' : 'w-1.5 bg-white/70'}`} />
          </button>
        );
      })}
    </div>
  );
};

export default Taskbar;
