# PIXY V2 — PRD

## Original problem statement
Web-based app launcher OS "PIXY V2": QuickBoot intro (Enter to start/skip), app tiles with custom logos opening in new tabs, categories (All, App Store, Games, Movies, Tools, OS, Favorites), App Store install/uninstall with 5s cooldown, drag-and-drop reorder, "Made by neuro" badge, Panic button (ClassLink), Calls button (app.gamevox.com), Settings with image/video backgrounds, 3 dashboard layouts chosen on boot (Classic, Wave = PS5-style, Dock = Switch-style), movable widgets (time, app shortcuts).

## Architecture
- Frontend React: `pages/SitesPage.jsx` (orchestrator), `layouts/{Classic,Wave,Dock}Layout.jsx`, `components/{SettingsOverlay,AppStorePanel,WidgetsLayer,DraggableTile,QuickActions,IntroScreen,VideoBackground,StarField}.jsx`, `hooks/{usePixyState,useRowFocus}.js`, `constants.js`, `mock.js` (static app list)
- Backend FastAPI: `GET/PUT /api/state/{device_id}` → Mongo `pixy_states` (favorites, installed, pending, bgId, order, dashboard, widgets)
- Per-browser anonymous device id (localStorage `pixy_device_id_v1`), local cache `pixy_state_v2`, debounced server sync

## Implemented
- Earlier: intro, grid, App Store, DnD, backgrounds, Panic/Calls, branding
- 2026-06: Wave (PS5) + Dock (Switch) layouts, Calls/Panic in all layouts, draggable widgets (time/app) with persistence, Settings → Dashboard & Widgets panels, image backgrounds fixed, MongoDB persistence. Tested: iteration_1 100% backend+frontend.

- 2026-06: Themes (Default white, Red, Blue, Green, Yellow, Orange, Pink, Purple) — colors button outlines/text, selected tile, App Store install buttons + outline in all layouts; saved to DB (`theme` field). Self-tested via screenshots.

## Backlog
- P1: Sounds, About settings panels (currently "Coming soon")
- P2: Sign-in to sync across devices; resize/snap widgets
