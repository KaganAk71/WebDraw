# System Patterns — Web Draw

## Architecture Overview

```
index.html
├── <header>          Header bar (theme, lang)
├── <nav>             Sidebar tool panel
├── <main>            Content area
│   ├── #url-frame    <iframe> for URL overlay (hidden by default)
│   ├── #bg-canvas    Background canvas (grid / dots / lines)
│   └── #draw-canvas  Drawing canvas (top layer, pointer-events active in draw mode)
└── <aside>           Settings panel (slide-in)
```

## Layer Model
```
z-index stack (bottom → top):
  10  #url-frame     (iframe, pointer-events: auto in interaction mode)
  20  #bg-canvas     (static render, no pointer-events)
  30  #draw-canvas   (pointer-events: auto in draw mode)
  40  <nav>          sidebar
  50  <header>       header bar
  60  <aside>        settings panel
```

## Module Pattern (Vanilla JS)
Each feature is a self-contained ES Module:

| Module | File | Responsibility |
|---|---|---|
| `AppState` | `js/state.js` | Single source of truth (current tool, colour, opacity, theme, lang) |
| `CanvasEngine` | `js/canvas.js` | Drawing, erasing, blurring; layer management |
| `BackgroundRenderer` | `js/background.js` | Renders dot/line/grid background on bg-canvas |
| `ToolManager` | `js/tools.js` | Registers tools; dispatches pointer events to active tool |
| `UrlOverlay` | `js/overlay.js` | Manages iframe src, visibility, pointer-event toggle |
| `SettingsPanel` | `js/settings.js` | Binds settings UI → AppState |
| `ThemeManager` | `js/theme.js` | dark/light toggle, `prefers-color-scheme` detection |
| `I18n` | `js/i18n.js` | Loads `lang/tr.json` / `lang/en.json`, applies strings to DOM |
| `Exporter` | `js/exporter.js` | Merges bg + draw canvas → PNG/SVG download |

## Event Flow
```
User pointer event on #draw-canvas
  → ToolManager.onPointerMove(e)
    → activeTool.draw(ctx, e)
      → CanvasEngine.applyStroke(…)
```

## State Management
- `AppState` is a plain observable object (Proxy-based).
- UI components subscribe to state changes via `AppState.subscribe(key, callback)`.
- No external state library needed.

## PHP Role
- `server/save.php` — accepts POST with base64 PNG, saves to `uploads/`, returns filename URL.
- `server/config.php` — returns server capabilities (upload max size, allowed origins).
- On GitHub Pages (no PHP): export is local download only; save.php gracefully absent.

## CSS Architecture
- Single `index.css` with CSS custom properties (design tokens).
- Token set switches between `:root[data-theme="dark"]` and `:root[data-theme="light"]`.
- No external CSS framework.

## Key Design Patterns
- **Command Pattern** for undo/redo (each draw action creates a `DrawCommand` pushed to a stack).
- **Observer Pattern** in `AppState` for reactive UI binding.
- **Strategy Pattern** in `ToolManager` — each tool is a strategy implementing `{ onPointerDown, onPointerMove, onPointerUp }`.
