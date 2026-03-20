# Tech Context — Web Draw

## Technology Stack

| Layer | Technology | Version Target |
|---|---|---|
| Structure | HTML5 | Living Standard |
| Logic | Vanilla JavaScript (ES2022 Modules) | No bundler required |
| Styling | CSS3 (Custom Properties, Flexbox, Grid, Animations) | — |
| Backend (optional) | PHP 8.x | Apache / Nginx |
| Canvas API | HTML5 Canvas 2D Context | — |
| Fonts | Google Fonts — **Inter** (UI) | v4 |
| Icons | SVG inline icons (no icon font dependency) | — |
| i18n | Custom JSON-based system | — |
| Export | Canvas `.toDataURL()` + FileSaver pattern | — |

## File Structure
```
web-draw/
├── index.html              Main entry point
├── index.css               Global design system & tokens
├── js/
│   ├── main.js             App bootstrap
│   ├── state.js            AppState (Proxy observable)
│   ├── canvas.js           CanvasEngine
│   ├── background.js       BackgroundRenderer
│   ├── tools.js            ToolManager + tool strategies
│   ├── overlay.js          URL overlay / iframe
│   ├── settings.js         Settings panel binding
│   ├── theme.js            ThemeManager
│   ├── i18n.js             Internationalisation
│   └── exporter.js         PNG / SVG export
├── lang/
│   ├── en.json             English strings
│   └── tr.json             Turkish strings
├── server/
│   ├── config.php          Server capability endpoint
│   └── save.php            Save PNG to server
├── memory-bank/            Project memory (this folder)
├── .gitignore
└── README.md
```

## Browser Support
- Chrome 100+, Firefox 100+, Safari 16+, Edge 100+
- No IE support.

## Development Setup
1. Clone repo.
2. Open `index.html` directly in browser (no build needed) — all features except server-save work.
3. For PHP features: `php -S localhost:8080` in project root.

## Technical Constraints
- **No bundler**: ES modules loaded natively; `<script type="module">`.
- **No external JS libraries** (except optional FileSaver polyfill).
- **GitHub Pages**: static files only; PHP endpoints unavailable.
- **iframe CORS**: URL overlay cannot access cross-origin DOM. Pointer-event toggling works regardless.
- **Canvas taint**: Drawing over an iframe does NOT taint the canvas (canvas is a sibling, not extracting iframe pixels).

## Performance Notes
- Background canvas redraws only on resize or settings change.
- Drawing canvas uses `requestAnimationFrame` for smooth strokes.
- Blur tool uses a convolution approximated by repeated `ctx.filter = 'blur(Xpx)'` pass.
