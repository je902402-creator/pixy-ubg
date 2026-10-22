import React from 'react';
import { Search, Settings as SettingsIcon, Star, Wifi, BatteryFull } from 'lucide-react';
import SiteIcon from '../components/SiteIcon';
import { DraggableTile, Countdown } from '../components/DraggableTile';
import { CallsIcon, CallsLink, ClockText, triggerPanic } from '../components/QuickActions';
import { FILTERS, CAT_ICON, APP_STORE_ICON, CLASSLINK_LOGO } from '../constants';
import { useRowFocus } from '../hooks/useRowFocus';
import { EmptyState } from './ClassicLayout';

const CYAN = '#00c3e3';

const DockHeader = ({ ctx }) => (
  <header className="flex items-center gap-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 bg-white text-xl font-black text-black" style={{ fontFamily: "'Bungee', system-ui" }}>P</div>
    <span className="hidden text-sm font-semibold text-white/80 sm:inline">PIXY V2</span>
    <div className="ml-auto flex items-center gap-4 text-white">
      <div className="relative">
        <Search className="pointer-events-none absolute z-10 left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
        <input
          data-testid="search-input"
          value={ctx.query}
          onChange={(e) => ctx.setQuery(e.target.value)}
          placeholder="Search"
          className="h-9 w-36 rounded-full border border-white/15 bg-black/40 pl-9 pr-3 text-sm text-white outline-none backdrop-blur-md placeholder:text-white/40 focus:border-white/40 md:w-44"
        />
      </div>
      <ClockText className="text-lg font-semibold" />
      <Wifi className="h-5 w-5 text-white/85" />
      <BatteryFull className="h-6 w-6 text-white/85" />
    </div>
  </header>
);

const DockRow = ({ ctx, focus, setFocusId }) => (
  <div className="flex flex-1 flex-col justify-center">
    <div data-testid="dock-focus-title" className="mb-2 h-7 text-xl font-semibold" style={{ color: CYAN }}>{focus?.name}</div>
    <div data-testid="dock-row" className="-mx-3 flex gap-5 overflow-x-auto px-3 py-4">
      {ctx.filtered.map((site) => {
        const on = focus?.id === site.id;
        const fav = ctx.favorites.includes(site.id);
        return (
          <DraggableTile key={site.id} id={site.id} drag={ctx.drag}>
            <button
              data-testid={`dock-tile-${site.id}`}
              onClick={() => (on ? ctx.onLaunch(site) : setFocusId(site.id))}
              onDoubleClick={() => ctx.onLaunch(site)}
              aria-label={site.name}
              className={`relative h-44 w-44 overflow-hidden rounded-md bg-black/40 transition-transform duration-200 lg:h-52 lg:w-52 ${on ? 'dock-focus scale-[1.03]' : 'hover:scale-[1.02]'}`}
            >
              <SiteIcon site={site} />
              <Countdown secs={ctx.remainingSec(site.id)} className="inset-10" />
            </button>
            <button
              data-testid={`dock-fav-${site.id}`}
              onClick={() => ctx.toggleFavorite(site.id)}
              aria-label="Toggle favorite"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm"
            >
              <Star className={`h-4 w-4 ${fav ? 'text-yellow-300' : 'text-white/70'}`} fill={fav ? '#fde047' : 'none'} />
            </button>
          </DraggableTile>
        );
      })}
    </div>
  </div>
);

const Circle = ({ testId, label, onClick, on, children, danger }) => (
  <button data-testid={testId} onClick={onClick} className="group flex w-16 flex-col items-center gap-1.5" aria-label={label}>
    <span
      className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 bg-black/50 text-white backdrop-blur-md transition-transform group-hover:scale-110 ${danger ? 'border-red-400/60' : 'border-white/20'}`}
      style={on ? { borderColor: CYAN, boxShadow: `0 0 0 3px ${CYAN}55` } : undefined}
    >
      {children}
    </span>
    <span className={`text-[11px] font-semibold ${on ? '' : 'text-white/70'}`} style={on ? { color: CYAN } : undefined}>{label}</span>
  </button>
);

const DockCircles = ({ ctx }) => (
  <nav className="mt-6 flex flex-wrap items-start justify-center gap-3 md:gap-5">
    {FILTERS.map((c) => {
      const Icon = CAT_ICON[c.id];
      return (
        <Circle key={c.id} testId={`category-${c.id}`} label={c.label} onClick={() => ctx.setActive(c.id)} on={ctx.active === c.id}>
          {c.id === 'store' ? <img src={APP_STORE_ICON} alt="" className="h-full w-full object-cover" />
            : c.id === 'favorites' ? <Star className="h-6 w-6" fill="#fde047" stroke="#fde047" />
            : <Icon className="h-6 w-6" />}
        </Circle>
      );
    })}
    <CallsLink testId="calls-btn" className="group flex w-16 flex-col items-center gap-1.5">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-black/50 backdrop-blur-md transition-transform group-hover:scale-110"><CallsIcon className="h-8 w-8" /></span>
      <span className="text-[11px] font-semibold text-white/70">Calls</span>
    </CallsLink>
    <Circle testId="settings-btn" label="Settings" onClick={ctx.openSettings}><SettingsIcon className="h-6 w-6" /></Circle>
    <Circle testId="panic-btn" label="Panic" onClick={triggerPanic} danger>
      <img src={CLASSLINK_LOGO} alt="" className="h-full w-full object-cover" />
    </Circle>
  </nav>
);

const DockLayout = ({ ctx }) => {
  const { focus, setFocusId } = useRowFocus(ctx.filtered, ctx.onLaunch, ctx.introDone && ctx.active !== 'store' && !ctx.settingsOpen);
  return (
    <main data-testid="dock-layout" className="relative z-10 flex min-h-screen flex-col px-6 py-6 md:px-14">
      <DockHeader ctx={ctx} />
      {ctx.active === 'store' ? (
        <div className="mt-8 flex-1">{ctx.storeEl}</div>
      ) : ctx.filtered.length === 0 ? (
        <div className="flex flex-1 items-center"><EmptyState active={ctx.active} /></div>
      ) : (
        <DockRow ctx={ctx} focus={focus} setFocusId={setFocusId} />
      )}
      <DockCircles ctx={ctx} />
      <footer className="mt-6 flex items-center justify-between border-t border-white/25 pt-3 text-xs font-semibold text-white/75">
        <span data-testid="made-by-badge">PIXY V2 · Made by neuro</span>
        <span className="flex items-center gap-4">
          <span><kbd className="mr-1 rounded-full bg-white/90 px-1.5 text-black">←→</kbd>Move</span>
          <span><kbd className="mr-1 rounded-full bg-white/90 px-1.5 text-black">↵</kbd>Open</span>
        </span>
      </footer>
    </main>
  );
};

export default DockLayout;
