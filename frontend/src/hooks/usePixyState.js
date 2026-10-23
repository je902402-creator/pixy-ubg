import { useEffect, useState } from 'react';
import { sites } from '../mock';

const API = `${process.env.REACT_APP_BACKEND_URL}/api/state`;
const DEVICE_KEY = 'pixy_device_id_v1';
const STATE_KEY = 'pixy_state_v2';
const LEGACY = {
  favorites: 'sites_for_school_favorites_v1',
  installed: 'sites_for_school_installed_v1',
  pending: 'sites_for_school_pending_v1',
  order: 'sites_for_school_order_v1',
};

const defaults = () => ({
  favorites: [],
  installed: sites.filter((s) => s.defaultInstalled !== false).map((s) => s.id),
  pending: {},
  bgId: 'default',
  order: [],
  dashboard: 'classic',
  theme: 'default',
  widgets: [],
});

const getDeviceId = () => {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
};

const loadLocal = () => {
  const base = defaults();
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) return { ...base, ...JSON.parse(saved) };
    Object.entries(LEGACY).forEach(([k, key]) => {
      const v = localStorage.getItem(key);
      if (v) base[k] = JSON.parse(v);
    });
    base.bgId = localStorage.getItem('sites_for_school_bg_v1') || base.bgId;
    base.dashboard = localStorage.getItem('pixy_dashboard_style_v1') || base.dashboard;
  } catch { /* corrupted local cache */ }
  return base;
};

export const usePixyState = () => {
  const [deviceId] = useState(getDeviceId);
  const [state, setState] = useState(loadLocal);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    fetch(`${API}/${deviceId}`)
      .then((r) => r.json())
      .then((d) => { if (d.exists && d.state) setState((s) => ({ ...s, ...d.state })); })
      .catch(() => {})
      .finally(() => setSynced(true));
  }, [deviceId]);

  useEffect(() => {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch { /* quota */ }
    if (!synced) return undefined;
    const t = setTimeout(() => {
      fetch(`${API}/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [state, synced, deviceId]);

  const set = (key) => (val) =>
    setState((s) => ({ ...s, [key]: typeof val === 'function' ? val(s[key]) : val }));

  return { state, set, synced };
};
