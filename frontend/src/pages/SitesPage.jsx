import React, { useEffect, useMemo, useState } from 'react';
import { Search, Star, Download, Trash2, Settings as SettingsIcon, X, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Input } from '../components/ui/input';
import { categories, sites } from '../mock';
import SiteTile from '../components/SiteTile';
import ComingSoonModal from '../components/ComingSoonModal';
import StarField from '../components/StarField';
import VideoBackground from '../components/VideoBackground';
import IntroScreen from '../components/IntroScreen';
import BrandBar from '../components/BrandBar';
import SiteIcon from '../components/SiteIcon';

const FAV_KEY = 'sites_for_school_favorites_v1';
const INSTALLED_KEY = 'sites_for_school_installed_v1';
const PENDING_KEY = 'sites_for_school_pending_v1';
const BG_KEY = 'sites_for_school_bg_v1';
const INSTALL_DELAY_MS = 5000;
const APP_STORE_ICON =
  'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/hg8u7q1t_image.webp';

const BACKGROUNDS = [
  { id: 'default', name: 'Starry (default)', type: 'stars' },
  { id: 'bg1', name: 'Nebula', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/dfrrm9x9_33A56.mp4' },
  { id: 'bg2', name: 'Gojo x Sukuna', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/tdo1gj6x_beyc14cy_Gojo-Sukuna.mp4' },
  { id: 'bg3', name: 'Snow Fox', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/1ocr1fut_eqmwihuk_SnowFox.mp4' },
  { id: 'bg4', name: 'Hunt', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/spqld5jf_Hunt.mp4' },
];

const SitesPage = () => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('all');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [introDone, setIntroDone] = useState(false);
  // Installed = which apps are visible on home. Default: all installed.
  const [installed, setInstalled] = useState(sites.map((s) => s.id));
  // Pending = map of id -> unlock timestamp (ms since epoch)
  const [pending, setPending] = useState({});
  const [bgId, setBgId] = useState('default');
  const [settingsView, setSettingsView] = useState(null); // null | 'menu' | 'backgrounds'
  // A tick counter to force re-render for countdowns
  const [, setNow] = useState(Date.now());

  // Load stored state
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
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch { /* ignore */ }
  }, [favorites]);
  useEffect(() => {
    try { localStorage.setItem(INSTALLED_KEY, JSON.stringify(installed)); } catch { /* ignore */ }
  }, [installed]);
  useEffect(() => {
    try { localStorage.setItem(PENDING_KEY, JSON.stringify(pending)); } catch { /* ignore */ }
  }, [pending]);
  useEffect(() => {
    try { localStorage.setItem(BG_KEY, bgId); } catch { /* ignore */ }
  }, [bgId]);

  // Tick every second while any pending
  useEffect(() => {
    const hasPending = Object.keys(pending).length > 0;
    if (!hasPending) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [pending]);

  // Clean up expired pending
  useEffect(() => {
    const now = Date.now();
    const entries = Object.entries(pending);
    const expired = entries.filter(([, ts]) => ts <= now).map(([id]) => id);
    if (expired.length > 0) {
      setPending((prev) => {
        const copy = { ...prev };
        expired.forEach((id) => delete copy[id]);
        return copy;
      });
    }
  });

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
    return sites.filter((s) => {
      if (!installed.includes(s.id)) return false;
      let catMatch = true;
      if (active === 'favorites') catMatch = favorites.includes(s.id);
      else if (active !== 'all' && active !== 'store') catMatch = s.category === active;
      const qMatch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [query, active, favorites, installed]);

  const handleTileClick = (site) => {
    // Block if pending (5s countdown)
    if (pending[site.id] && pending[site.id] > Date.now()) return;
    if (site.url) {
      window.open(site.url, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelected(site);
    setOpen(true);
  };

  const filterList = [...categories, { id: 'favorites', label: 'Favorites' }];

  const remainingSec = (id) => {
    const ts = pending[id];
    if (!ts) return 0;
    return Math.max(0, Math.ceil((ts - Date.now()) / 1000));
  };

  const activeBg = BACKGROUNDS.find((b) => b.id === bgId) || BACKGROUNDS[0];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {activeBg.type === 'video' ? (
        <VideoBackground src={activeBg.src} />
      ) : (
        <StarField />
      )}
      {!introDone && <IntroScreen onDone={() => setIntroDone(true)} />}
      <BrandBar />

      {/* Settings button top-right */}
      <button
        onClick={() => setSettingsView('menu')}
        aria-label="Open settings"
        title="Settings"
        className="absolute right-4 top-4 z-30 flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white/90 backdrop-blur-md transition-transform duration-200 hover:scale-105 sm:right-6 sm:top-6"
      >
        <SettingsIcon className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-[0.2em]">Settings</span>
      </button>

      <main className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8">
        <h1
          className="text-center text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)] sm:text-5xl md:text-6xl"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          Sites for school. <span className="text-white">:]</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/60 sm:text-base">
          A curated launchpad of unblocked apps, games, and tools for your school days.
        </p>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-stretch gap-4">
          {active !== 'store' && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sites..."
                className="h-11 rounded-full border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:ring-white/30"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            {filterList.map((c, idx) => {
              const isActive = active === c.id;
              const isFav = c.id === 'favorites';
              return (
                <React.Fragment key={c.id}>
                  <button
                    onClick={() => setActive(c.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'border-white bg-white text-black'
                        : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {isFav && (
                      <Star className="h-3.5 w-3.5"
                        fill={isActive ? '#000' : '#fde047'}
                        stroke={isActive ? '#000' : '#fde047'}
                        strokeWidth={2} />
                    )}
                    {c.label}
                  </button>
                  {/* App Store button right after "All" */}
                  {idx === 0 && (
                    <button
                      onClick={() => setActive('store')}
                      title="App Store"
                      aria-label="Open App Store"
                      className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border transition-transform duration-200 hover:scale-110 ${
                        active === 'store'
                          ? 'border-white shadow-[0_0_0_2px_rgba(255,255,255,0.5)]'
                          : 'border-white/15'
                      }`}
                    >
                      <img src={APP_STORE_ICON} alt="App Store" className="h-full w-full object-cover" />
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Store view */}
        {active === 'store' ? (
          <section className="mt-10">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-black/10 bg-white text-gray-900 shadow-2xl">
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
              <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4">
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
          </section>
        ) : (
          <section className="mt-12">
            {filtered.length === 0 ? (
              <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
                {active === 'favorites'
                  ? 'No favorites yet. Tap the star on any tile to add it here.'
                  : 'No apps here. Try the App Store to install more.'}
              </div>
            ) : (
              <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
                {filtered.map((site) => {
                  const secs = remainingSec(site.id);
                  return (
                    <div key={site.id} className="relative">
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
            )}
          </section>
        )}

        <p className="mt-16 text-center text-xs text-white/40">
          Made for curious students. Click any tile to launch.
        </p>
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
