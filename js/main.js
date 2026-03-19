// ──────────────────────────────────────────────────────────────────────
// Main — App Bootstrap  (js/main.js)
// ──────────────────────────────────────────────────────────────────────

import AppState from './state.js';
import ThemeManager from './theme.js';
import I18n from './i18n.js';
import CanvasEngine from './canvas.js';
import BackgroundRenderer from './background.js';
import ToolManager from './tools.js';
import UrlOverlay from './overlay.js';
import SettingsPanel from './settings.js';
import Exporter from './exporter.js';
import { showToast } from './overlay.js';

async function boot() {
    // 1. Theme first (prevents flash)
    ThemeManager.init();

    // 2. i18n (async — loads JSON)
    await I18n.init();

    // 3. Canvas layers
    CanvasEngine.init();
    BackgroundRenderer.init();

    // 4. Tools & interactions
    ToolManager.init();
    UrlOverlay.init();
    SettingsPanel.init();
    Exporter.init();

    // 5. Keyboard shortcuts
    initKeyboardShortcuts();

    console.log('%c✦ Web Draw ready', 'color:#007aff;font-weight:bold;font-size:14px');
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key.toLowerCase();

        // Ctrl/Cmd + Z = Undo
        if ((e.ctrlKey || e.metaKey) && key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (CanvasEngine.undo()) showToast(I18n.t('toast.undone'));
            return;
        }

        // Ctrl/Cmd + Y or Ctrl+Shift+Z = Redo
        if ((e.ctrlKey || e.metaKey) && (key === 'y' || (key === 'z' && e.shiftKey))) {
            e.preventDefault();
            if (CanvasEngine.redo()) showToast(I18n.t('toast.redone'));
            return;
        }

        // Delete = Clear
        if (key === 'delete') {
            e.preventDefault();
            Exporter.clearCanvas();
            return;
        }

        // Tool shortcuts
        switch (key) {
            case 'p': AppState.tool = 'pen'; break;
            case 't': AppState.tool = 'transparentPen'; break;
            case 'e': AppState.tool = 'eraser'; break;
            case 'b': AppState.tool = 'blur'; break;
            case 'u':
                AppState.settingsOpen = true;
                break;
            case 's':
                e.preventDefault();
                AppState.settingsOpen = !AppState.settingsOpen;
                break;
            case 'i':
                AppState.interactMode = !AppState.interactMode;
                break;
        }
    });
}

// Boot the app
boot();
