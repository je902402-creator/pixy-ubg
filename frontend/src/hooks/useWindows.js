import { useEffect, useMemo, useRef, useState } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;
export const proxyUrl = (url) => `${API}/api/proxy?url=${encodeURIComponent(url)}`;
export const checkEmbeddable = (url) =>
  fetch(`${API}/api/proxy/check?url=${encodeURIComponent(url)}`).then((r) => r.json());

const srcFor = (url, mode) => (mode === 'proxy' ? proxyUrl(url) : url);

export const useWindows = () => {
  const [wins, setWins] = useState([]);
  const zRef = useRef(1);

  const actions = useMemo(() => {
  const update = (id, patch) =>
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...(typeof patch === 'function' ? patch(w) : patch) } : w)));

  const focus = (id) => update(id, { z: ++zRef.current, minimized: false });

  const open = (site) => {
    const z = ++zRef.current;
    setWins((ws) => {
      const ex = ws.find((w) => w.siteId === site.id);
      if (ex) return ws.map((w) => (w.id === ex.id ? { ...w, minimized: false, z } : w));
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.min(960, Math.round(vw * 0.7));
      const h = Math.min(640, Math.round(vh * 0.72));
      const off = (ws.length * 28) % 140;
      return [...ws, {
        id: `win-${site.id}-${Date.now()}`, siteId: site.id, site,
        history: [site.url], index: 0, mode: 'checking', src: '', nonce: 0, loading: true,
        x: Math.max(0, Math.round((vw - w) / 2) + off), y: Math.max(0, Math.round((vh - h) / 2) - 30 + off),
        w, h, minimized: false, maximized: vw < 768, z,
      }];
    });
  };

  const go = (w, history, index, mode = w.mode) => ({
    history, index, mode, src: srcFor(history[index], mode), nonce: w.nonce + 1, loading: true,
  });

  return {
    focus,
    open,
    close: (id) => setWins((ws) => ws.filter((w) => w.id !== id)),
    minimize: (id) => update(id, { minimized: true }),
    toggleMax: (id) => update(id, (w) => ({ maximized: !w.maximized })),
    move: (id, geo) => update(id, geo),
    setMode: (id, mode) => update(id, (w) => go(w, w.history, w.index, mode)),
    navigate: (id, url) => update(id, (w) => go(w, [...w.history.slice(0, w.index + 1), url], w.index + 1, w.mode === 'proxy' ? 'proxy' : 'checking')),
    back: (id) => update(id, (w) => (w.index > 0 ? go(w, w.history, w.index - 1) : {})),
    forward: (id) => update(id, (w) => (w.index < w.history.length - 1 ? go(w, w.history, w.index + 1) : {})),
    reload: (id) => update(id, (w) => ({ nonce: w.nonce + 1, loading: true })),
    loaded: (id) => update(id, { loading: false }),
    framedNav: (id, url) =>
      update(id, (w) => (w.history[w.index] === url ? {} : { history: [...w.history.slice(0, w.index + 1), url], index: w.index + 1 })),
  };
  }, []);

  useEffect(() => {
    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setWins((ws) => ws.map((w) => {
        if (vw < 768) return { ...w, maximized: true };
        const nw = Math.min(w.w, vw);
        const nh = Math.min(w.h, vh - 84);
        return { ...w, w: nw, h: nh, x: Math.max(0, Math.min(w.x, vw - nw)), y: Math.max(0, Math.min(w.y, vh - 84 - nh)) };
      }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return { wins, actions };
};
