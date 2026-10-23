import React, { useEffect, useRef } from 'react';
import { Minus, Maximize2, Minimize2, X } from 'lucide-react';
import SiteIcon from './SiteIcon';
import WindowToolbar from './WindowToolbar';
import { checkEmbeddable } from '../hooks/useWindows';

const MIN_W = 360;
const MIN_H = 260;
const TASKBAR_H = 84;

const startPointerDrag = (e, onDelta) => {
  if (e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();
  const sx = e.clientX;
  const sy = e.clientY;
  document.body.classList.add('pixy-dragging');
  const move = (ev) => onDelta(ev.clientX - sx, ev.clientY - sy);
  const up = () => {
    document.body.classList.remove('pixy-dragging');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
};

const TitleButton = ({ testId, onClick, label, danger, children }) => (
  <button
    data-no-drag
    data-testid={testId}
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`theme-btn flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/80 transition-colors ${danger ? 'hover:border-red-500 hover:bg-red-500 hover:text-white' : 'hover:bg-white/15'}`}
  >
    {children}
  </button>
);

const AppWindow = ({ win, actions, isTop }) => {
  const frameRef = useRef(null);
  const { id, site } = win;

  const current = win.history[win.index];
  useEffect(() => {
    if (win.mode !== 'checking') return;
    checkEmbeddable(current)
      .then((r) => actions.setMode(id, r.embeddable ? 'direct' : 'proxy'))
      .catch(() => actions.setMode(id, 'direct'));
  }, [win.mode, current, id, actions]);

  useEffect(() => {
    const onMsg = (e) => {
      if (e.source && e.source === frameRef.current?.contentWindow && e.data?.pixyNav) actions.framedNav(id, e.data.pixyNav);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [id, actions]);

  const startMove = (e) => {
    if (win.maximized || e.target.closest('[data-no-drag]')) return;
    const b = { x: win.x, y: win.y, w: win.w };
    startPointerDrag(e, (dx, dy) => actions.move(id, {
      x: Math.min(window.innerWidth - 120, Math.max(120 - b.w, b.x + dx)),
      y: Math.min(window.innerHeight - 80, Math.max(0, b.y + dy)),
    }));
  };

  const resizer = (dir) => (e) => {
    const b = { w: win.w, h: win.h };
    startPointerDrag(e, (dx, dy) => {
      const geo = {};
      if (dir.includes('r')) geo.w = Math.max(MIN_W, b.w + dx);
      if (dir.includes('b')) geo.h = Math.max(MIN_H, b.h + dy);
      actions.move(id, geo);
    });
  };

  const style = win.maximized
    ? { left: 0, top: 0, width: '100vw', height: `calc(100vh - ${TASKBAR_H}px)`, zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <div
      data-testid={`app-window-${site.id}`}
      style={style}
      onPointerDownCapture={() => !isTop && actions.focus(id)}
      className={`win-anim pointer-events-auto absolute flex flex-col overflow-hidden border bg-[#0b0b12]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl ${win.maximized ? 'rounded-none border-transparent' : 'rounded-2xl border-white/15'} ${win.minimized ? 'win-minimized' : ''} ${isTop ? '' : 'brightness-90'}`}
    >
      <div onPointerDown={startMove} onDoubleClick={() => actions.toggleMax(id)} className="flex cursor-grab select-none items-center gap-3 px-3 py-2 active:cursor-grabbing">
        <span className="h-7 w-7 shrink-0 overflow-hidden rounded-lg"><SiteIcon site={site} /></span>
        <span data-testid={`win-title-${site.id}`} className="theme-text min-w-0 flex-1 truncate text-sm font-bold text-white">{site.name}</span>
        {win.mode === 'proxy' && <span className="theme-btn rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/70">Proxy</span>}
        <TitleButton testId={`win-minimize-${site.id}`} onClick={() => actions.minimize(id)} label="Minimize"><Minus className="h-4 w-4" /></TitleButton>
        <TitleButton testId={`win-maximize-${site.id}`} onClick={() => actions.toggleMax(id)} label={win.maximized ? 'Exit full screen' : 'Full screen'}>
          {win.maximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </TitleButton>
        <TitleButton testId={`win-close-${site.id}`} onClick={() => actions.close(id)} label="Close" danger><X className="h-4 w-4" /></TitleButton>
      </div>
      <WindowToolbar win={win} actions={actions} />
      <div className="relative flex-1 bg-white">
        {win.loading && <div data-testid={`win-loading-${site.id}`} className="theme-bg win-progress absolute inset-x-0 top-0 z-10 h-0.5 bg-white" />}
        {!isTop && <div data-testid={`win-focus-shield-${site.id}`} className="absolute inset-0 z-20" onPointerDown={() => actions.focus(id)} />}
        {win.mode === 'checking' ? (
          <div className="flex h-full items-center justify-center bg-[#0b0b12] text-sm text-white/60">Connecting…</div>
        ) : (
          <iframe
            key={`${win.mode}-${win.nonce}`}
            ref={frameRef}
            data-testid={`win-frame-${site.id}`}
            title={site.name}
            src={win.src || site.url}
            onLoad={() => actions.loaded(id)}
            className="h-full w-full border-0 bg-white"
            allow="fullscreen; autoplay; gamepad; clipboard-read; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            {...(win.mode === 'proxy' ? { sandbox: 'allow-scripts allow-forms allow-popups allow-pointer-lock allow-modals allow-presentation' } : {})}
          />
        )}
      </div>
      {!win.maximized && (
        <>
          <div onPointerDown={resizer('r')} className="absolute right-0 top-10 h-[calc(100%-3rem)] w-1.5 cursor-ew-resize" />
          <div onPointerDown={resizer('b')} className="absolute bottom-0 left-2 h-1.5 w-[calc(100%-2rem)] cursor-ns-resize" />
          <div data-testid={`win-resize-${site.id}`} onPointerDown={resizer('rb')} className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize" />
        </>
      )}
    </div>
  );
};

export default AppWindow;
