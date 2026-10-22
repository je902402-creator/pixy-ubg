import React, { useEffect, useRef, useState } from 'react';
import { X, Clock } from 'lucide-react';
import SiteIcon from './SiteIcon';

// Live-updating clock face shown by the Time widget.
const TimeFace = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const ss = now.getSeconds().toString().padStart(2, '0');
  const date = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <div className="flex flex-col items-start gap-1 px-5 py-4 text-white">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
        <Clock className="h-3 w-3" />
        <span>Time</span>
      </div>
      <div className="text-4xl font-black tabular-nums" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {hh}:{mm}
        <span className="ml-1 text-xl font-bold text-white/70">{ss}</span>
      </div>
      <div className="text-xs font-medium text-white/70">{date}</div>
    </div>
  );
};

// Shortcut tile for a specific app, click opens its URL
const AppShortcut = ({ site, onLaunch }) => (
  <button
    data-testid={`widget-app-open-${site.id}`}
    onClick={() => onLaunch(site)}
    className="flex items-center gap-3 px-4 py-3 text-left"
  >
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/15">
      <SiteIcon site={site} />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-bold text-white">{site.name}</span>
      <span className="text-[10px] uppercase tracking-widest text-white/50">Shortcut</span>
    </div>
  </button>
);

// A single draggable widget container
const DraggableWidget = ({ widget, children, onMove, onRemove, container }) => {
  const ref = useRef(null);
  const dragState = useRef({ dragging: false, moved: false });

  const onPointerDown = (e) => {
    if (e.target.closest('[data-no-drag]')) return;
    const rect = ref.current.getBoundingClientRect();
    dragState.current = { dragging: true, moved: false, startX: e.clientX, startY: e.clientY, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
  };

  const onPointerMove = (e) => {
    const st = dragState.current;
    if (!st.dragging) return;
    if (!st.moved) {
      if (Math.hypot(e.clientX - st.startX, e.clientY - st.startY) < 4) return;
      st.moved = true;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* */ }
    }
    const parent = container?.current;
    if (!parent) return;
    const pr = parent.getBoundingClientRect();
    const el = ref.current;
    const x = Math.max(0, Math.min(pr.width - el.offsetWidth, e.clientX - pr.left - st.offsetX));
    const y = Math.max(0, Math.min(pr.height - el.offsetHeight, e.clientY - pr.top - st.offsetY));
    onMove(widget.id, x, y);
  };

  const onPointerUp = (e) => {
    dragState.current.dragging = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* */ }
  };

  const onClickCapture = (e) => {
    if (dragState.current.moved) { e.stopPropagation(); e.preventDefault(); dragState.current.moved = false; }
  };

  return (
    <div
      ref={ref}
      data-testid={`widget-${widget.type}`}
      style={{ left: Math.min(widget.x, Math.max(0, window.innerWidth - 140)), top: Math.min(widget.y, Math.max(0, window.innerHeight - 100)) }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClickCapture={onClickCapture}
      className="absolute cursor-grab touch-none select-none rounded-2xl border border-white/15 bg-black/60 shadow-xl backdrop-blur-xl active:cursor-grabbing"
    >
      <button
        data-no-drag
        data-testid="widget-remove-btn"
        onClick={() => onRemove(widget.id)}
        aria-label="Remove widget"
        className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black text-white/80 hover:bg-white/10"
      >
        <X className="h-3 w-3" />
      </button>
      {children}
    </div>
  );
};

// Main widget layer: renders all widgets inside the given container ref.
const WidgetsLayer = ({ widgets, setWidgets, sites, onLaunch, containerRef }) => {
  const [, setSize] = useState(0);
  useEffect(() => {
    const onResize = () => setSize(window.innerWidth + window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const moveWidget = (id, x, y) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  };
  const removeWidget = (id) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  };
  return (
    <div className="pointer-events-none absolute inset-0">
      {widgets.map((w) => {
        const inner =
          w.type === 'time' ? (
            <TimeFace />
          ) : (
            (() => {
              const site = sites.find((s) => s.id === w.appId);
              if (!site) return null;
              return <AppShortcut site={site} onLaunch={onLaunch} />;
            })()
          );
        if (!inner) return null;
        return (
          <div key={w.id} className="pointer-events-auto">
            <DraggableWidget
              widget={w}
              onMove={moveWidget}
              onRemove={removeWidget}
              container={containerRef}
            >
              {inner}
            </DraggableWidget>
          </div>
        );
      })}
    </div>
  );
};

export default WidgetsLayer;
