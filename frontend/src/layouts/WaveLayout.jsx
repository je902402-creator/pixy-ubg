import React from 'react';
import { Search, Settings as SettingsIcon, Star, Play } from 'lucide-react';
import SiteIcon from '../components/SiteIcon';
import { DraggableTile, Countdown } from '../components/DraggableTile';
import { CallsIcon, CallsLink, ClockText, MadeByBadge, triggerPanic } from '../components/QuickActions';
import { FILTERS, CLASSLINK_LOGO } from '../constants';
import { useRowFocus } from '../hooks/useRowFocus';
import { EmptyState } from './ClassicLayout';

const roundBtn = 'flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/85 backdrop-blur-md transition-transform hover:scale-110 hover:bg-white/15';

const WaveHeader = ({ ctx }) => (
  <header className="flex flex-wrap items-center gap-x-8 gap-y-4">
    <nav className="flex flex-wrap items-center gap-x-7 gap-y-2">
      {FILTERS.map((c) => {
        const on = ctx.active === c.id;
        return (
          <button
            key={c.id}
            data-testid={`category-${c.id}`}
            onClick={() => ctx.setActive(c.id)}
            className={`relative pb-1.5 text-base font-semibold tracking-wide transition-colors md:text-lg ${on ? 'text-white' : 'text-white/55 hover:text-white/90'}`}
          >
            {c.label}
            <span className={`absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-white transition-transform duration-300 ${on ? 'scale-x-100' : 'scale-x-0'}`} />
          </button>
        );
      })}
    </nav>
    <div className="ml-auto flex items-center gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute z-10 left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
        <input
          data-testid="search-input"
          value={ctx.query}
          onChange={(e) => ctx.setQuery(e.target.value)}
          placeholder="Search"
          className="h-10 w-40 rounded-full border border-white/15 bg-black/40 pl-9 pr-3 text-sm text-white outline-none backdrop-blur-md placeholder:text-white/40 focus:w-56 focus:border-white/40 md:w-44"
          style={{ transition: 'width 250ms ease' }}
        />
      </div>
      <button data-testid="settings-btn" onClick={ctx.openSettings} aria-label="Settings" className={roundBtn}>
        <SettingsIcon className="h-4 w-4" />
      </button>
      <CallsLink testId="calls-btn" className={roundBtn}><CallsIcon className="h-6 w-6" /></CallsLink>
      <button data-testid="panic-btn" onClick={triggerPanic} aria-label="Panic" title="Panic (ClassLink)" className={`${roundBtn} overflow-hidden border-red-400/40`}>
        <img src={CLASSLINK_LOGO} alt="" className="h-6 w-6 rounded-sm object-cover" />
      </button>
      <ClockText className="pl-2 text-lg font-semibold text-white" />
    </div>
  </header>
);

const WaveRow = ({ ctx, focus, setFocusId }) => (
  <div data-testid="wave-row" className="-mx-2 mt-12 flex items-end gap-4 overflow-x-auto px-2 pb-4 pt-2">
    {ctx.filtered.map((site) => {
      const on = focus?.id === site.id;
      return (
        <DraggableTile key={site.id} id={site.id} drag={ctx.drag} className="flex items-end gap-4">
          <button
            data-testid={`wave-tile-${site.id}`}
            onClick={() => (on ? ctx.onLaunch(site) : setFocusId(site.id))}
            onDoubleClick={() => ctx.onLaunch(site)}
            aria-label={site.name}
            className={`relative overflow-hidden rounded-2xl border transition-[width,height,box-shadow] duration-300 ease-out ${
              on ? 'h-36 w-36 border-white shadow-[0_0_0_3px_rgba(255,255,255,0.9),0_20px_50px_-10px_rgba(0,0,0,0.8)] md:h-40 md:w-40' : 'h-24 w-24 border-white/15 opacity-85 hover:opacity-100'
            }`}
          >
            <SiteIcon site={site} />
            <Countdown secs={ctx.remainingSec(site.id)} className="inset-3" />
          </button>
          {on && <span className="mb-2 max-w-[10rem] truncate text-lg font-semibold text-white">{site.name}</span>}
        </DraggableTile>
      );
    })}
  </div>
);

const WaveHero = ({ ctx, site }) => {
  const fav = ctx.favorites.includes(site.id);
  return (
    <section data-testid="wave-hero" className="mt-auto max-w-2xl pb-6 pt-10">
      <div className="text-xs font-bold uppercase tracking-[0.35em] text-white/60">{site.category}</div>
      <h2 data-testid="wave-hero-title" className="mt-2 text-4xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)] sm:text-5xl lg:text-6xl">
        {site.name}
      </h2>
      <p className="mt-3 text-sm text-white/75 md:text-base">{site.description}</p>
      <div className="mt-6 flex items-center gap-3">
        <button
          data-testid="wave-open-btn"
          onClick={() => ctx.onLaunch(site)}
          className="flex items-center gap-2 rounded-full bg-white px-10 py-3 text-base font-bold text-black transition-transform hover:scale-105"
        >
          <Play className="h-4 w-4" fill="#000" /> Open
        </button>
        <button
          data-testid="wave-fav-btn"
          onClick={() => ctx.toggleFavorite(site.id)}
          aria-label="Toggle favorite"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/40 backdrop-blur-md transition-transform hover:scale-110"
        >
          <Star className={`h-5 w-5 ${fav ? 'text-yellow-300' : 'text-white/80'}`} fill={fav ? '#fde047' : 'none'} />
        </button>
      </div>
    </section>
  );
};

const WaveLayout = ({ ctx }) => {
  const { focus, setFocusId } = useRowFocus(ctx.filtered, ctx.onLaunch, ctx.introDone && ctx.active !== 'store' && !ctx.settingsOpen);
  return (
    <main data-testid="wave-layout" className="relative z-10 flex min-h-screen flex-col bg-gradient-to-b from-black/50 via-transparent to-black/60 px-6 py-6 md:px-12 md:py-8">
      <WaveHeader ctx={ctx} />
      {ctx.active === 'store' ? (
        <div className="mt-10">{ctx.storeEl}</div>
      ) : ctx.filtered.length === 0 ? (
        <div className="mt-16"><EmptyState active={ctx.active} /></div>
      ) : (
        <>
          <WaveRow ctx={ctx} focus={focus} setFocusId={setFocusId} />
          {focus && <WaveHero ctx={ctx} site={focus} />}
        </>
      )}
      <div className="mt-4 flex justify-end"><MadeByBadge /></div>
    </main>
  );
};

export default WaveLayout;
