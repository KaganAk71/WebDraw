# Active Context — Web Draw

## Current Work Focus
- Initial implementation of the complete Web Draw application is **done**.
- All core files created and tested in browser.

## Recent Changes
- Created complete CSS design system (`index.css`) with dark/light theme tokens, glassmorphism, Mac-style aesthetics
- Created all JavaScript ES modules: `state.js`, `theme.js`, `i18n.js`, `canvas.js`, `background.js`, `tools.js`, `overlay.js`, `settings.js`, `exporter.js`, `main.js`
- Created `index.html` with semantic structure, SVG icons, and all UI components
- Created i18n files: `lang/en.json`, `lang/tr.json`
- Verified: dark/light theme toggle, settings panel, canvas drawing all work correctly

## Next Steps
- Test Turkish language switch (TR button)
- Test all tools: eraser, transparent pen, blur
- Test undo/redo (Ctrl+Z / Ctrl+Y)
- Test URL overlay functionality
- Test export (PNG/SVG)
- Test keyboard shortcuts (P, T, E, B, U, S, I)
- Add PHP server files (save.php, config.php) — optional
- Create README.md
- Create .gitignore

## Active Decisions
- Using Proxy-based observable for AppState (no external state library)
- Using Command pattern for undo/redo
- Using Strategy pattern for tool switching
- Glassmorphism with backdrop-filter for UI panels
- SVG inline icons throughout (no icon font dependency)

## Important Patterns
- All state changes flow through `AppState` Proxy
- UI components subscribe to specific state keys
- `data-i18n`, `data-i18n-tooltip`, `data-i18n-placeholder` attributes for i18n
- `data-tool` attribute for tool button binding
- `data-bg-type` attribute for background type buttons
