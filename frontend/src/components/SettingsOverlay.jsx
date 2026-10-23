import React from 'react';
import { Settings as SettingsIcon, X, ArrowLeft, Image as ImageIcon, LayoutDashboard, Clock, Plus, Trash2, Palette, Check } from 'lucide-react';
import { BACKGROUNDS, DASHBOARDS, THEMES } from '../constants';
import SiteIcon from './SiteIcon';

const TITLES = { menu: 'Settings', backgrounds: 'Backgrounds', dashboard: 'Dashboard', widgets: 'Widgets', themes: 'Themes' };
const MENU = [
  { id: 'backgrounds', label: 'Backgrounds', Icon: ImageIcon, grad: 'from-indigo-500 to-purple-600' },
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, grad: 'from-sky-500 to-cyan-400' },
  { id: 'widgets', label: 'Widgets', Icon: Clock, grad: 'from-emerald-500 to-teal-400' },
  { id: 'themes', label: 'Themes', Icon: Palette, grad: 'from-rose-500 to-orange-400' },
];

const MenuView = ({ setView }) => (
  <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
    {MENU.map(({ id, label, Icon, grad }) => (
      <button key={id} data-testid={`settings-${id}-btn`} onClick={() => setView(id)} className="theme-btn flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-center transition-colors hover:bg-white/10">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${grad}`}><Icon className="h-6 w-6 text-white" /></div>
        <span className="text-sm font-semibold">{label}</span>
      </button>
    ))}
    {['Sounds', 'About'].map((label) => (
      <button key={label} disabled className="flex cursor-not-allowed flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-center opacity-60">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10"><SettingsIcon className="h-6 w-6 text-white/70" /></div>
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-[10px] uppercase tracking-widest text-white/50">Coming soon</span>
      </button>
    ))}
  </div>
);

const BackgroundsView = ({ bgId, setBgId }) => (
  <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3">
    {BACKGROUNDS.map((bg) => {
      const on = bgId === bg.id;
      return (
        <button key={bg.id} data-testid={`bg-option-${bg.id}`} onClick={() => setBgId(bg.id)} className={`relative overflow-hidden rounded-2xl border-2 text-left transition-colors ${on ? 'border-white' : 'border-white/10 hover:border-white/30'}`}>
          <div className="relative h-32 w-full overflow-hidden bg-black">
            {bg.type === 'video' && <video src={bg.src} muted autoPlay loop playsInline className="h-full w-full object-cover" />}
            {bg.type === 'image' && <img src={bg.src} alt="" className="h-full w-full object-cover" />}
            {bg.type === 'stars' && (
              <div className="flex h-full items-center justify-center"><div className="grid grid-cols-6 gap-1 opacity-80">
                {Array.from({ length: 24 }).map((_, i) => <span key={i} className="h-1 w-1 rounded-full bg-white" style={{ opacity: (i % 3) * 0.3 + 0.3 }} />)}
              </div></div>
            )}
            {on && <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black">Active</span>}
          </div>
          <div className="px-3 py-2 text-sm font-semibold text-white/90">{bg.name}</div>
        </button>
      );
    })}
  </div>
);

const DashboardView = ({ dashboard, setDashboard }) => (
  <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
    {DASHBOARDS.map(({ id, label, hint, Icon }) => {
      const on = dashboard === id;
      return (
        <button key={id} data-testid={`settings-dashboard-${id}`} onClick={() => setDashboard(id)} className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors ${on ? 'border-white bg-white text-black' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
          <Icon className="h-6 w-6" />
          <span className="text-base font-bold">{label}</span>
          <span className={`text-xs ${on ? 'text-black/60' : 'text-white/50'}`}>{hint}</span>
        </button>
      );
    })}
  </div>
);

const WidgetsView = ({ widgets, setWidgets, apps }) => {
  const add = (w) => setWidgets((prev) => [...prev, { id: `w-${Date.now()}`, x: 40 + prev.length * 24, y: 120 + prev.length * 24, ...w }]);
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <button data-testid="add-time-widget-btn" onClick={() => add({ type: 'time' })} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black hover:scale-105">
          <Plus className="h-4 w-4" /> Time widget
        </button>
        {widgets.length > 0 && (
          <button data-testid="clear-widgets-btn" onClick={() => setWidgets([])} className="flex items-center gap-2 rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20">
            <Trash2 className="h-4 w-4" /> Remove all ({widgets.length})
          </button>
        )}
        <span className="text-xs text-white/50">Drag widgets anywhere on screen after closing settings.</span>
      </div>
      <div>
        <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/40">App shortcuts</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {apps.map((s) => (
            <button key={s.id} data-testid={`add-app-widget-${s.id}`} onClick={() => add({ type: 'app', appId: s.id })} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 text-left hover:bg-white/10">
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg"><SiteIcon site={s} /></span>
              <span className="flex-1 truncate text-sm font-semibold">{s.name}</span>
              <Plus className="h-4 w-4 text-white/60" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ThemesView = ({ theme, setTheme }) => (
  <div className="space-y-4 p-6">
    <p className="text-xs text-white/50">Pick a color for button outlines, button text and the selected tile.</p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {THEMES.map((t) => {
        const on = theme === t.id;
        return (
          <button
            key={t.id}
            data-testid={`theme-option-${t.id}`}
            onClick={() => setTheme(t.id)}
            className="flex items-center gap-3 rounded-xl border-2 bg-white/5 px-3 py-3 text-left text-sm font-bold transition-transform hover:scale-[1.03]"
            style={{ borderColor: on ? t.color : 'rgba(255,255,255,0.1)', color: t.color }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: t.color }}>
              {on && <Check className="h-4 w-4 text-black" />}
            </span>
            {t.name}
          </button>
        );
      })}
    </div>
  </div>
);

const SettingsOverlay = ({ view, setView, bgId, setBgId, dashboard, setDashboard, widgets, setWidgets, apps, theme, setTheme }) => (
  <div data-testid="settings-overlay" className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
    <div className="mt-16 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b12] text-white shadow-2xl">
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-6 py-4">
        {view !== 'menu' && (
          <button data-testid="settings-back-btn" onClick={() => setView('menu')} aria-label="Back" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <SettingsIcon className="h-5 w-5 text-white/80" />
        <h2 className="flex-1 text-lg font-bold">{TITLES[view]}</h2>
        <button data-testid="settings-close-btn" onClick={() => setView(null)} aria-label="Close settings" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>
      {view === 'menu' && <MenuView setView={setView} />}
      {view === 'backgrounds' && <BackgroundsView bgId={bgId} setBgId={setBgId} />}
      {view === 'dashboard' && <DashboardView dashboard={dashboard} setDashboard={setDashboard} />}
      {view === 'themes' && <ThemesView theme={theme} setTheme={setTheme} />}
      {view === 'widgets' && <WidgetsView widgets={widgets} setWidgets={setWidgets} apps={apps} />}
    </div>
  </div>
);

export default SettingsOverlay;
