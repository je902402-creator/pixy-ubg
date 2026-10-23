import React, { useEffect, useMemo, useRef, useState } from 'react';
import { sites } from '../mock';
import ComingSoonModal from '../components/ComingSoonModal';
import StarField from '../components/StarField';
import VideoBackground from '../components/VideoBackground';
import IntroScreen from '../components/IntroScreen';
import AppStorePanel from '../components/AppStorePanel';
import SettingsOverlay from '../components/SettingsOverlay';
import WidgetsLayer from '../components/WidgetsLayer';
import { useDragReorder } from '../components/DraggableTile';
import ClassicLayout from '../layouts/ClassicLayout';
import WaveLayout from '../layouts/WaveLayout';
import DockLayout from '../layouts/DockLayout';
import { usePixyState } from '../hooks/usePixyState';
import { useWindows } from '../hooks/useWindows';
import AppWindow from '../components/AppWindow';
import Taskbar from '../components/Taskbar';
import { BACKGROUNDS, INSTALL_DELAY_MS, THEMES } from '../constants';

const LAYOUTS = { classic: ClassicLayout, wave: WaveLayout, dock: DockLayout };

const SitesPage = () => {
  const { state, set } = usePixyState();
  const { favorites, installed, pending, bgId, order, dashboard, widgets, theme } = state;
  const themeColor = (THEMES.find((t) => t.id === theme) || THEMES[0]).color;
  const themed = theme && theme !== 'default';
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('all');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [settingsView, setSettingsView] = useState(null);
  const [, setNow] = useState(Date.now());
  const widgetsRef = useRef(null);
  const { wins, actions: winActions } = useWindows();
  const topId = wins.reduce((t, w) => (!w.minimized && (!t || w.z > t.z) ? w : t), null)?.id;

  useEffect(() => {
    if (!Object.keys(pending).length) return undefined;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [pending]);

  useEffect(() => {
    const now = Date.now();
    const expired = Object.entries(pending).filter(([, ts]) => ts <= now).map(([id]) => id);
    if (expired.length) set('pending')((prev) => {
      const c = { ...prev };
      expired.forEach((id) => delete c[id]);
      return c;
    });
  });

  const toggleFavorite = (id) => set('favorites')((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const uninstallApp = (id) => {
    set('installed')((p) => p.filter((x) => x !== id));
    set('pending')((p) => { const c = { ...p }; delete c[id]; return c; });
  };
  const installApp = (id) => {
    set('installed')((p) => (p.includes(id) ? p : [...p, id]));
    set('pending')((p) => ({ ...p, [id]: Date.now() + INSTALL_DELAY_MS }));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const idx = (id) => { const i = order.indexOf(id); return i === -1 ? Number.MAX_SAFE_INTEGER : i; };
    return sites
      .filter((s) => {
        if (!installed.includes(s.id)) return false;
        const cat = active === 'favorites' ? favorites.includes(s.id) : active === 'all' || active === 'store' || s.category === active;
        return cat && (!q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
      })
      .sort((a, b) => idx(a.id) - idx(b.id));
  }, [query, active, favorites, installed, order]);

  const reorderIds = (src, target) => {
    if (!src || !target || src === target) return;
    const cur = [...order];
    sites.forEach((s) => { if (!cur.includes(s.id)) cur.push(s.id); });
    const from = cur.indexOf(src);
    const to = cur.indexOf(target);
    if (from === -1 || to === -1) return;
    const [moved] = cur.splice(from, 1);
    cur.splice(to, 0, moved);
    set('order')(cur);
  };
  const drag = useDragReorder(reorderIds);

  const onLaunch = (site) => {
    if (pending[site.id] && pending[site.id] > Date.now()) return;
    if (site.url) { winActions.open(site); return; }
    setSelected(site); setOpen(true);
  };
  const remainingSec = (id) => (pending[id] ? Math.max(0, Math.ceil((pending[id] - Date.now()) / 1000)) : 0);

  const activeBg = BACKGROUNDS.find((b) => b.id === bgId) || BACKGROUNDS[0];
  const Layout = LAYOUTS[dashboard] || ClassicLayout;
  const ctx = {
    query, setQuery, active, setActive, filtered, favorites, toggleFavorite, onLaunch, remainingSec, drag, introDone,
    settingsOpen: !!settingsView,
    openSettings: () => setSettingsView('menu'),
    storeEl: <AppStorePanel installed={installed} onInstall={installApp} onUninstall={uninstallApp} onClose={() => setActive('all')} />,
  };

  return (
    <div
      data-testid="app-root"
      data-theme={themed ? theme : undefined}
      style={themed ? { '--accent': themeColor, '--accent-dock': themeColor } : undefined}
      className="relative min-h-screen w-full overflow-x-hidden"
    >
      {activeBg.type === 'stars' ? <StarField /> : <VideoBackground src={activeBg.src} type={activeBg.type} />}
      {!introDone && <IntroScreen dashboard={dashboard} onDashboardChange={set('dashboard')} onDone={() => setIntroDone(true)} />}
      <Layout ctx={ctx} />
      <div ref={widgetsRef} data-testid="widgets-layer" className="pointer-events-none fixed inset-0 z-20">
        <WidgetsLayer widgets={widgets} setWidgets={set('widgets')} sites={sites} onLaunch={onLaunch} containerRef={widgetsRef} />
      </div>
      <div data-testid="windows-layer" className="pointer-events-none fixed inset-0 z-30">
        {wins.map((w) => <AppWindow key={w.id} win={w} actions={winActions} isTop={w.id === topId} />)}
      </div>
      <Taskbar wins={wins} actions={winActions} topId={topId} />
      <ComingSoonModal site={selected} open={open} onOpenChange={setOpen} />
      {settingsView && (
        <SettingsOverlay
          view={settingsView} setView={setSettingsView}
          bgId={bgId} setBgId={set('bgId')}
          dashboard={dashboard} setDashboard={set('dashboard')}
          widgets={widgets} setWidgets={set('widgets')}
          theme={theme || 'default'} setTheme={set('theme')}
          apps={sites.filter((s) => installed.includes(s.id))}
        />
      )}
    </div>
  );
};

export default SitesPage;
