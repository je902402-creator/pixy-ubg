import React, { useEffect, useState } from 'react';
import { Search, Star, Settings as SettingsIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import SiteTile from '../components/SiteTile';
import { DraggableTile, Countdown } from '../components/DraggableTile';
import { CallsIcon, CallsLink, MadeByBadge, triggerPanic } from '../components/QuickActions';
import { FILTERS, CAT_ICON, APP_STORE_ICON, CLASSLINK_LOGO } from '../constants';

const PAGE_SIZE = 6;

const SidebarButton = ({ icon: Icon, label, onClick, active, iconNode, danger, testId }) => (
  <button
    data-testid={testId}
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
      active
        ? 'border-white bg-white text-black'
        : danger
        ? 'border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20'
        : 'border-white/10 bg-white/5 text-white/85 hover:bg-white/10'
    }`}
  >
    {iconNode ? (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md">{iconNode}</span>
    ) : Icon ? (
      <Icon className="h-4 w-4 shrink-0" />
    ) : null}
    <span className="truncate">{label}</span>
  </button>
);

const catIconNode = (id, isActive) => {
  if (id === 'favorites')
    return <Star className="h-4 w-4" fill={isActive ? '#000' : '#fde047'} stroke={isActive ? '#000' : '#fde047'} strokeWidth={2} />;
  if (id === 'store') return <img src={APP_STORE_ICON} alt="" className="h-6 w-6 rounded-md object-cover" />;
  return undefined;
};

const Sidebar = ({ ctx }) => (
  <aside className="md:sticky md:top-6 md:h-[calc(100vh-4rem)] md:w-[300px] md:shrink-0">
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
      <div>
        <h1
          className="text-4xl font-black tracking-tight text-white"
          style={{ fontFamily: "'Bungee', 'Inter', system-ui, sans-serif", letterSpacing: '-0.02em', textShadow: '2px 2px 0 rgba(0,0,0,0.6), 4px 4px 12px rgba(255,255,255,0.1)', transform: 'skewX(-4deg)', display: 'inline-block' }}
        >
          Pixy<span className="ml-1 align-super text-xl font-black text-white/90">v2</span>
        </h1>
        <div className="mt-3 flex items-center gap-2">
          <MadeByBadge />
          <CallsLink testId="calls-btn" className="group flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-1 transition-transform hover:scale-105">
            <CallsIcon />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/85">Calls</span>
          </CallsLink>
        </div>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        <Input
          data-testid="search-input"
          value={ctx.query}
          onChange={(e) => ctx.setQuery(e.target.value)}
          placeholder="Search sites..."
          className="h-10 rounded-xl border-white/15 bg-white/5 pl-9 text-sm text-white placeholder:text-white/40 focus-visible:ring-white/30"
        />
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        <SidebarButton testId="panic-btn" label="Panic button" onClick={triggerPanic} danger iconNode={<img src={CLASSLINK_LOGO} alt="" className="h-6 w-6 rounded-sm object-cover" />} />
        <SidebarButton testId="settings-btn" icon={SettingsIcon} label="Settings" onClick={ctx.openSettings} />
        <div className="pt-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Categories</div>
        {FILTERS.map((c) => (
          <SidebarButton
            key={c.id}
            testId={`category-${c.id}`}
            label={c.label}
            onClick={() => ctx.setActive(c.id)}
            active={ctx.active === c.id}
            icon={CAT_ICON[c.id]}
            iconNode={catIconNode(c.id, ctx.active === c.id)}
          />
        ))}
      </div>
    </div>
  </aside>
);

const PageArrow = ({ dir, onClick }) => (
  <button
    data-testid={`page-${dir}-btn`}
    onClick={onClick}
    aria-label={dir === 'prev' ? 'Previous page' : 'Next page'}
    className={`absolute ${dir === 'prev' ? 'left-2' : 'right-2'} top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-110`}
  >
    {dir === 'prev' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
  </button>
);

const ClassicGrid = ({ ctx }) => {
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [ctx.active, ctx.query]);
  const { filtered } = ctx;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (!filtered.length) return <EmptyState active={ctx.active} />;
  return (
    <>
      <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-10 sm:grid-cols-3">
        {pageItems.map((site) => (
          <DraggableTile key={site.id} id={site.id} drag={ctx.drag}>
            <SiteTile site={site} onClick={ctx.onLaunch} isFavorite={ctx.favorites.includes(site.id)} onToggleFavorite={ctx.toggleFavorite} />
            <Countdown secs={ctx.remainingSec(site.id)} className="left-1/2 top-[56px] h-20 w-20 -translate-x-1/2 sm:top-[64px] sm:h-24 sm:w-24" />
          </DraggableTile>
        ))}
      </div>
      {totalPages > 1 && (
        <>
          {page > 0 && <PageArrow dir="prev" onClick={() => setPage((p) => p - 1)} />}
          {page < totalPages - 1 && <PageArrow dir="next" onClick={() => setPage((p) => p + 1)} />}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === page ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export const EmptyState = ({ active }) => (
  <div data-testid="empty-state" className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/5 p-10 text-center text-white/70 backdrop-blur-md">
    {active === 'favorites' ? 'No favorites yet. Tap the star on any tile to add it here.' : 'No apps here. Try the App Store to install more.'}
  </div>
);

const ClassicLayout = ({ ctx }) => (
  <main data-testid="classic-layout" className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-4 py-6 md:flex-row md:px-6 md:py-8">
    <Sidebar ctx={ctx} />
    <section className="flex-1">
      {ctx.active === 'store' ? ctx.storeEl : (
        <div className="relative rounded-3xl border border-white/10 bg-black/25 p-6 backdrop-blur-md sm:p-8">
          <ClassicGrid ctx={ctx} />
        </div>
      )}
    </section>
  </main>
);

export default ClassicLayout;
