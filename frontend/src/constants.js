import { Grid3x3, Gamepad2, Film, Wrench, Monitor, Rows, Gamepad } from 'lucide-react';

export const APP_STORE_ICON =
  'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/hg8u7q1t_image.webp';
export const CLASSLINK_LOGO =
  'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/9wb3a1zu_image.png';
export const CALLS_URL = 'https://app.gamevox.com';
export const PANIC_URL = 'https://launchpad.classlink.com';
export const INSTALL_DELAY_MS = 5000;

export const BACKGROUNDS = [
  { id: 'default', name: 'Starry (default)', type: 'stars' },
  { id: 'bg1', name: 'Nebula', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/dfrrm9x9_33A56.mp4' },
  { id: 'bg2', name: 'Gojo x Sukuna', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/tdo1gj6x_beyc14cy_Gojo-Sukuna.mp4' },
  { id: 'bg3', name: 'Snow Fox', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/1ocr1fut_eqmwihuk_SnowFox.mp4' },
  { id: 'bg4', name: 'Hunt', type: 'video', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/spqld5jf_Hunt.mp4' },
  { id: 'bg5', name: 'Cross & Clouds', type: 'image', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/35c15cc4a6456396_image.png' },
  { id: 'bg6', name: 'Statue Aesthetic', type: 'image', src: 'https://customer-assets-jai6qajn.emergentagent.net/job_e-commerce-1388/artifacts/c214a258c10e2add_image.png' },
];

export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'store', label: 'App Store' },
  { id: 'games', label: 'Games' },
  { id: 'movies', label: 'Movies' },
  { id: 'tools', label: 'Tools' },
  { id: 'os', label: 'OS' },
  { id: 'favorites', label: 'Favorites' },
];

export const CAT_ICON = { all: Grid3x3, games: Gamepad2, movies: Film, tools: Wrench, os: Monitor };

export const DASHBOARDS = [
  { id: 'classic', label: 'Classic', hint: 'Sidebar layout', Icon: Monitor },
  { id: 'wave', label: 'Wave', hint: 'PS5-style dashboard', Icon: Rows },
  { id: 'dock', label: 'Dock', hint: 'Switch-style dashboard', Icon: Gamepad },
];
