# Project Brief — Web Draw

## Project Name
**Web Draw** — Browser-based Drawing Engine

## Overview
Web Draw is a feature-rich, client-side drawing application built with HTML5 Canvas, JavaScript, PHP, and CSS3. It runs entirely in the browser and can optionally overlay any website via an iframe for annotation purposes.

## Core Goals
1. Provide a professional drawing canvas in the browser.
2. Support multiple drawing tools: pen, transparent pen, eraser, blur/smudge.
3. Allow users to open any URL and draw on top of the rendered page.
4. Offer a highly customisable canvas background (solid colour, dotted, lined, grid).
5. Deliver a Mac-style polished UI with seamless dark/light theme switching.
6. Support Turkish and English interface languages.
7. Be deployable as a static site on GitHub Pages (PHP features gracefully degrade).

## Key Requirements

### Tools (Sidebar / Nav)
| Tool | Description |
|---|---|
| Pen | Solid freehand stroke, configurable colour & width |
| Transparent Pen | Freehand stroke with configurable opacity (default 20%) |
| Eraser | removes pixels from the drawing layer |
| Blur | Gaussian-style blur smudge tool |
| URL Overlay | loads a URL in an iframe beneath the canvas |
| Settings | opens the settings panel |
| Interaction Toggle | single-key toggle between drawing mode and site interaction mode |

### Header
- Theme toggle (dark ↔ light, Mac-style)
- Language selector (TR / EN)
- App logo / name

### Canvas Area
- Configurable background: solid colour, dot grid, line grid, square grid
- Zoom / pan (scale) support
- Fully transparent overlay when URL mode is active

### Settings Panel
- Stroke colour picker
- Stroke width slider
- Transparent pen opacity slider (0–100 %)
- Canvas background type selector
- Background colour picker
- Grid size / spacing control
- Export drawing (PNG / SVG)
- Clear canvas button

## Deployment Target
- GitHub Pages (static hosting — PHP optional / backend-enhanced)
- Repository: `github.com/<user>/web-draw`

## Out of Scope (v1)
- Real-time collaboration
- Backend authentication
- Cloud storage of drawings
