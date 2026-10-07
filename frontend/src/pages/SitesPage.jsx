import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Star,
  Download,
  Trash2,
  Settings as SettingsIcon,
  X,
  ArrowLeft,
  Image as ImageIcon,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Grid3x3,
  Gamepad2,
  Film,
  Wrench,
  Monitor,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { categories, sites } from '../mock';
import SiteTile from '../components/SiteTile';
import ComingSoonModal from '../components/ComingSoonModal';
import StarField from '../components/StarField';
import VideoBackground from '../components/VideoBackground';
import IntroScreen from '../components/IntroScreen';
import SiteIcon from '../components/SiteIcon';

const FAV_KEY = 'sites_for_school_favorites_v1';
const INSTALLED_KEY = 'sites_for_school_installed_v1';
const PENDING_KEY = 'sites_for_school_pending_v1';
const BG_KEY = 'sites_for_school_bg_v1';
const ORDER_KEY = 'sites_for_school_order_v1';
const INSTALL_DELAY_MS = 5000;
const PAGE_SIZE = 6;

const APP_STORE_ICON =
  'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/hg8u7q1t_image.webp';
const CLASSLINK_LOGO =
  'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/9wb3a1zu_image.png';

const BACKGROUNDS = [
  { id: 'default', name: 'Starry (default)', type: 'stars' },
  { id: 'bg1', name: 'Nebula', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/dfrrm9x9_33A56.mp4' },
  { id: 'bg2', name: 'Gojo x Sukuna', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/tdo1gj6x_beyc14cy_Gojo-Sukuna.mp4' },
  { id: 'bg3', name: 'Snow Fox', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/1ocr1fut_eqmwihuk_SnowFox.mp4' },
  { id: 'bg4', name: 'Hunt', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/spqld5jf_Hunt.mp4' },
];

const CAT_ICON = {
  all: Grid3x3,
  games: Gamepad2,
  movies: Film,
  tools: Wrench,
  os: Monitor,
};

// Default install list = every site whose defaultInstalled !== false
const defaultInstalled = () =>
  sites.filter((s) => s.defaultInstalled !== false).map((s) => s.id);

const SitesPage = () => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('all');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [introDone, setIntroDone] = useState(false);
  const [installed, setInstalled] = useState(defaultInstalled);
  const [order, setOrder] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [pending, setPending] = useState({});
  const [bgId, setBgId] = useState('default');
  const [settingsView, setSettingsView] = useState(null);
  const [page, setPage] = useState(0);
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    try {
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f));
      const i = localStorage.getItem(INSTALLED_KEY);
      if (i) setInstalled(JSON.parse(i));
      const p = localStorage.getItem(PENDING_KEY);
      if (p) setPending(JSON.parse(p));
      const b = localStorage.getItem(BG_KEY);
      if (b) setBgId(b);
      const o = localStorage.getItem(ORDER_KEY);
      if (o) setOrder(JSON.parse(o));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch { /* */ } }, [favorites]);
  useEffect(() => { try { localStorage.setItem(INSTALLED_KEY, JSON.stringify(installed)); } catch { /* */ } }, [installed]);
  useEffect(() => { try { localStorage.setItem(PENDING_KEY, JSON.stringify(pending)); } catch { /* */ } }, [pending]);
  useEffect(() => { try { localStorage.setItem(BG_KEY, bgId); } catch { /* */ } }, [bgId]);
  useEffect(() => { try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch { /* */ } }, [order]);

  useEffect(() => {
    if (!Object.keys(pending).length) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [pending]);

  useEffect(() => {
    const now = Date.now();
    const expired = Object.entries(pending).filter(([, ts]) => ts <= now).map(([id]) => id);
    if (expired.length) {
      setPending((prev) => {
        const c = { ...prev };
        expired.forEach((id) => delete c[id]);
        return c;
      });
    }
  });

  const toggleFavorite = (id) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const uninstallApp = (id) => {
    setInstalled((prev) => prev.filter((x) => x !== id));
    setPending((prev) => {
      const c = { ...prev };
      delete c[id];
      return c;
    });
  };

  const installApp = (id) => {
    setInstalled((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setPending((prev) => ({ ...prev, [id]: Date.now() + INSTALL_DELAY_MS }));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = sites.filter((s) => {
      if (!installed.includes(s.id)) return false;
      let catMatch = true;
      if (active === 'favorites') catMatch = favorites.includes(s.id);
      else if (active !== 'all' && active !== 'store') catMatch = s.category === active;
      const qMatch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
    // Apply custom order: items that appear in `order` come first, in their saved order
    const indexOf = (id) => {
      const i = order.indexOf(id);
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    return [...list].sort((a, b) => indexOf(a.id) - indexOf(b.id));
  }, [query, active, favorites, installed, order]);

  const reorderIds = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    // Start from a full ordering of ALL sites to make this stable
    const current = (() => {
      const base = order.length ? [...order] : [];
      // Append any ids missing from current order
      sites.forEach((s) => { if (!base.includes(s.id)) base.push(s.id); });
      return base;
    })();
    const from = current.indexOf(sourceId);
    const to = current.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const copy = [...current];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    setOrder(copy);
  };

  // Reset page when filter/search changes
  useEffect(() => { setPage(0); }, [active, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleTileClick = (site) => {
    if (pending[site.id] && pending[site.id] > Date.now()) return;
    if (site.url) { window.open(site.url, '_blank', 'noopener,noreferrer'); return; }
    setSelected(site); setOpen(true);
  };

  const triggerPanic = () => { window.location.href = 'https://launchpad.classlink.com'; };

  const remainingSec = (id) => {
    const ts = pending[id];
    if (!ts) return 0;
    return Math.max(0, Math.ceil((ts - Date.now()) / 1000));
  };

  const activeBg = BACKGROUNDS.find((b) => b.id === bgId) || BACKGROUNDS[0];

  const filterList = [
    { id: 'all', label: 'All' },
    { id: 'store', label: 'App Store' },
    { id: 'games', label: 'Games' },
    { id: 'movies', label: 'Movies' },
    { id: 'tools', label: 'Tools' },
    { id: 'os', label: 'OS' },
    { id: 'favorites', label: 'Favorites' },
  ];

  const SidebarButton = ({ icon: Icon, label, onClick, active: isActive, iconNode, danger }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
        isActive
          ? 'border-white bg-white text-black'
          : danger
          ? 'border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20'
          : 'border-white/10 bg-white/5 text-white/85 hover:bg-white/10'
      }`}
    >
      {iconNode ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md">
          {iconNode}
        </span>
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {activeBg.type === 'video' ? <VideoBackground src={activeBg.src} /> : <StarField />}
      {!introDone && <IntroScreen onDone={() => setIntroDone(true)} />}

      <main className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-4 py-6 md:flex-row md:px-6 md:py-8">
        {/* LEFT SIDEBAR */}
        <aside className="md:sticky md:top-6 md:h-[calc(100vh-4rem)] md:w-[300px] md:shrink-0">
          <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-black/60 p-5 backdrop-blur-xl">
            {/* Site name + made-by badge */}
            <div>
              <h1
                className="text-4xl font-black tracking-tight text-white"
                style={{
                  fontFamily: "'Bungee', 'Inter', system-ui, sans-serif",
                  letterSpacing: '-0.02em',
                  textShadow: '2px 2px 0 rgba(0,0,0,0.6), 4px 4px 12px rgba(255,255,255,0.1)',
                  transform: 'skewX(-4deg)',
                  display: 'inline-block',
                }}
              >
                Pixy<span className="ml-1 align-super text-xl font-black text-white/90">v2</span>
              </h1>
              <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/85">
                  Made by neuro
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sites..."
                className="h-10 rounded-xl border-white/15 bg-white/5 pl-9 text-sm text-white placeholder:text-white/40 focus-visible:ring-white/30"
              />
            </div>

            {/* Scrollable button list */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              <SidebarButton
                label="Panic button"
                onClick={triggerPanic}
                danger
                iconNode={
                  <img src={CLASSLINK_LOGO} alt="" className="h-6 w-6 rounded-sm object-cover" />
                }
              />
              <SidebarButton
                icon={SettingsIcon}
                label="Settings"
                onClick={() => setSettingsView('menu')}
              />

              <div className="pt-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                Categories
              </div>

              {filterList.map((c) => {
                const Icon = CAT_ICON[c.id];
                const isFav = c.id === 'favorites';
                const isStore = c.id === 'store';
                return (
                  <SidebarButton
                    key={c.id}
                    label={c.label}
                    onClick={() => setActive(c.id)}
                    active={active === c.id}
                    icon={!isFav && !isStore ? Icon : undefined}
                    iconNode={
                      isFav ? (
                        <Star
                          className="h-4 w-4"
                          fill={active === c.id ? '#000' : '#fde047'}
                          stroke={active === c.id ? '#000' : '#fde047'}
                          strokeWidth={2}
                        />
                      ) : isStore ? (
                        <img src={APP_STORE_ICON} alt="" className="h-6 w-6 rounded-md object-cover" />
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1">
          {active === 'store' ? (
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-white text-gray-900 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-6 py-4">
                <img src={APP_STORE_ICON} alt="App Store" className="h-9 w-9 rounded-lg" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold">App Store</h2>
                  <p className="text-xs text-gray-500">Install or remove apps from your home screen.</p>
                </div>
                <button
                  onClick={() => setActive('all')}
                  aria-label="Close App Store"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {sites.map((site) => {
                  const isInstalled = installed.includes(site.id);
                  return (
                    <div key={site.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200">
                        <SiteIcon site={site} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-semibold">{site.name}</span>
                        {isInstalled ? (
                          <button
                            onClick={() => uninstallApp(site.id)}
                            className="mt-1 inline-flex items-center gap-1 self-start rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-200"
                          >
                            <Trash2 className="h-3 w-3" /> Uninstall
                          </button>
                        ) : (
                          <button
                            onClick={() => installApp(site.id)}
                            className="mt-1 inline-flex items-center gap-1 self-start rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            <Download className="h-3 w-3" /> Install
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md sm:p-8">
              {filtered.length === 0 ? (
                <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
                  {active === 'favorites'
                    ? 'No favorites yet. Tap the star on any tile to add it here.'
                    : 'No apps here. Try the App Store to install more.'}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-10 sm:grid-cols-3">
                    {pageItems.map((site) => {
                      const secs = remainingSec(site.id);
                      const isDragging = dragId === site.id;
                      return (
                        <div
                          key={site.id}
                          draggable
                          onDragStart={(e) => {
                            setDragId(site.id);
                            e.dataTransfer.effectAllowed = 'move';
                            try { e.dataTransfer.setData('text/plain', site.id); } catch { /* */ }
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const src = dragId || (() => { try { return e.dataTransfer.getData('text/plain'); } catch { return null; } })();
                            reorderIds(src, site.id);
                            setDragId(null);
                          }}
                          onDragEnd={() => setDragId(null)}
                          className={`relative transition-transform duration-200 ${
                            isDragging ? 'scale-95 opacity-50' : ''
                          }`}
                        >
                          <SiteTile
                            site={site}
                            onClick={handleTileClick}
                            isFavorite={favorites.includes(site.id)}
                            onToggleFavorite={toggleFavorite}
                          />
                          {secs > 0 && (
                            <div className="pointer-events-none absolute left-1/2 top-[56px] flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full bg-black/70 backdrop-blur-md sm:top-[64px] sm:h-24 sm:w-24">
                              <span className="text-3xl font-black text-white tabular-nums">{secs}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination arrows */}
                  {totalPages > 1 && (
                    <>
                      {page > 0 && (
                        <button
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          aria-label="Previous page"
                          className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-110"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      )}
                      {page < totalPages - 1 && (
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                          aria-label="Next page"
                          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-110"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      )}
                      <div className="mt-6 flex items-center justify-center gap-1.5">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${
                              i === page ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </main>

      <ComingSoonModal site={selected} open={open} onOpenChange={setOpen} />

      {/* Settings overlay */}
      {settingsView && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="mt-16 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b12] text-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-6 py-4">
              {settingsView === 'backgrounds' && (
                <button
                  onClick={() => setSettingsView('menu')}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <SettingsIcon className="h-5 w-5 text-white/80" />
              <h2 className="flex-1 text-lg font-bold">
                {settingsView === 'backgrounds' ? 'Backgrounds' : 'Settings'}
              </h2>
              <button
                onClick={() => setSettingsView(null)}
                aria-label="Close settings"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {settingsView === 'menu' && (
              <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
                <button
                  onClick={() => setSettingsView('backgrounds')}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-center transition-colors hover:bg-white/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold">Backgrounds</span>
                </button>
                {['Themes', 'Sounds', 'About'].map((label) => (
                  <button
                    key={label}
                    disabled
                    className="flex cursor-not-allowed flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-center opacity-60"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                      <SettingsIcon className="h-6 w-6 text-white/70" />
                    </div>
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/50">Coming soon</span>
                  </button>
                ))}
              </div>
            )}

            {settingsView === 'backgrounds' && (
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3">
                {BACKGROUNDS.map((bg) => {
                  const isActive = bgId === bg.id;
                  return (
                    <button
                      key={bg.id}
                      onClick={() => setBgId(bg.id)}
                      className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all ${
                        isActive ? 'border-white shadow-[0_0_0_3px_rgba(255,255,255,0.25)]' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="relative h-32 w-full overflow-hidden bg-black">
                        {bg.type === 'video' ? (
                          <video src={bg.src} muted autoPlay loop playsInline className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-black">
                            <div className="grid grid-cols-6 gap-1 opacity-80">
                              {Array.from({ length: 24 }).map((_, i) => (
                                <span key={i} className="h-1 w-1 rounded-full bg-white" style={{ opacity: (i % 3) * 0.3 + 0.3 }} />
                              ))}
                            </div>
                          </div>
                        )}
                        {isActive && (
                          <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="px-3 py-2 text-sm font-semibold text-white/90">{bg.name}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SitesPage;
