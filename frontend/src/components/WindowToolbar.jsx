import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, ExternalLink, Shield, ShieldOff } from 'lucide-react';

const tbBtn = 'theme-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent';

const normalize = (v) => {
  const t = v.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(t)) return `https://${t}`;
  return `https://www.bing.com/search?q=${encodeURIComponent(t)}`;
};

const WindowToolbar = ({ win, actions }) => {
  const current = win.history[win.index];
  const [addr, setAddr] = useState(current);
  useEffect(() => { setAddr(current); }, [current]);
  const proxy = win.mode === 'proxy';
  const tid = win.siteId;

  const submit = (e) => {
    e.preventDefault();
    const url = normalize(addr);
    if (url) actions.navigate(win.id, url);
  };

  return (
    <div className="flex items-center gap-1 border-b border-white/10 bg-black/40 px-2 py-1.5" data-no-drag>
      <button data-testid={`win-back-${tid}`} className={tbBtn} onClick={() => actions.back(win.id)} disabled={win.index === 0} aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
      <button data-testid={`win-forward-${tid}`} className={tbBtn} onClick={() => actions.forward(win.id)} disabled={win.index >= win.history.length - 1} aria-label="Forward"><ArrowRight className="h-4 w-4" /></button>
      <button data-testid={`win-reload-${tid}`} className={tbBtn} onClick={() => actions.reload(win.id)} aria-label="Reload"><RotateCw className={`h-4 w-4 ${win.loading ? 'animate-spin' : ''}`} /></button>
      <form onSubmit={submit} className="mx-1 min-w-0 flex-1">
        <input
          data-testid={`win-address-${tid}`}
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="theme-btn h-8 w-full rounded-full border border-white/10 bg-white/5 px-4 text-xs text-white/90 outline-none focus:border-white/40"
          spellCheck={false}
        />
      </form>
      <button
        data-testid={`win-proxy-toggle-${tid}`}
        onClick={() => actions.setMode(win.id, proxy ? 'direct' : 'proxy')}
        title={proxy ? 'Proxy mode ON - click for direct' : 'Page blank? Turn on proxy mode'}
        className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${proxy ? 'theme-active border-white bg-white text-black' : 'theme-btn border-white/15 text-white/70 hover:bg-white/10'}`}
      >
        {proxy ? <Shield className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">Proxy</span>
      </button>
      <a data-testid={`win-newtab-${tid}`} href={current} target="_blank" rel="noopener noreferrer" className={tbBtn} title="Open in new tab" aria-label="Open in new tab"><ExternalLink className="h-4 w-4" /></a>
    </div>
  );
};

export default WindowToolbar;
