# Product Context — Web Draw

## Why This Project Exists
Designers, educators, and developers need a lightweight, zero-install annotation and sketching tool that works directly in the browser. Existing tools are either desktop-only, require account sign-up, or lack the ability to annotate live websites.

## Problems It Solves
| Problem | Solution |
|---|---|
| No quick way to annotate a live web page | URL overlay mode loads any site under the drawing canvas |
| Friction switching between drawing and interacting | Single-key toggle (keyboard shortcut) |
| Complex UIs with hidden features | Clean Mac-style sidebar + expandable settings panel |
| No theme preference support | First-class dark / light mode with system preference detection |
| Language barrier (Turkish users) | Full TR / EN i18n, toggle in header |

## How It Should Work
1. User opens `index.html` locally or via GitHub Pages.
2. The canvas fills the viewport; the sidebar floats on the left.
3. User selects a tool from the sidebar.
4. Drawing happens on the transparent canvas layer.
5. URL mode: user types a URL → iframe loads beneath canvas → toggle key switches pointer-events between canvas and iframe.
6. Settings panel slides in from the sidebar or a dedicated icon, offering all visual customisations.
7. Export button converts canvas to PNG / SVG for download.

## User Experience Goals
- **Fast**: no build step, opens instantly in any modern browser.
- **Beautiful**: premium Mac-style aesthetics, smooth animations, SF-Pro-Display-inspired typography.
- **Intuitive**: tool icons are self-explanatory; tooltips on hover.
- **Accessible**: keyboard shortcut for every major action.
- **Responsive**: works on wide-screen desktops; sidebar collapses on smaller viewports.
