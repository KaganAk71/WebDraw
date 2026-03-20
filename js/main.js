// ──────────────────────────────────────────────────────────────────────
// Main — App Bootstrap  (js/main.js)
// ──────────────────────────────────────────────────────────────────────
import AppState from './state.js';
import ThemeManager from './theme.js';
import I18n from './i18n.js';
import CanvasEngine from './canvas.js';
import BackgroundRenderer from './background.js';
import ToolManager from './tools.js';
import ToolPopup from './popup.js';
import ShapeTool from './shapes.js';
import TextTool from './text.js';
import SelectTool from './select.js';
import UrlOverlay from './overlay.js';
import SettingsPanel from './settings.js';
import Exporter from './exporter.js';
import { showToast } from './overlay.js';

async function boot() {
    // 1. Theme (prevents flash)
    ThemeManager.init();

    // 2. i18n
    await I18n.init();

    // 3. Canvas
    CanvasEngine.init();
    BackgroundRenderer.init();

    // 4. Tools
    ToolManager.init();
    ToolManager.preventContextMenu();
    ToolPopup.init();
    ShapeTool.init();
    TextTool.init();
    SelectTool.init();

    // 5. Panels & features
    UrlOverlay.init();
    SettingsPanel.init();
    Exporter.init();

    // 6. Header buttons
    document.getElementById('zoom-in')?.addEventListener('click', () => CanvasEngine.zoomIn());
    document.getElementById('zoom-out')?.addEventListener('click', () => CanvasEngine.zoomOut());
    document.getElementById('zoom-badge')?.addEventListener('click', () => CanvasEngine.resetView());
    document.getElementById('btn-undo')?.addEventListener('click', () => { if (CanvasEngine.undo()) showToast(I18n.t('toast.undone') || 'Undone'); });
    document.getElementById('btn-redo')?.addEventListener('click', () => { if (CanvasEngine.redo()) showToast(I18n.t('toast.redone') || 'Redone'); });

    // 7. Keyboard shortcuts
    _initShortcuts();

    // 8. Extension download
    document.getElementById('download-ext')?.addEventListener('click', () => {
        showToast('Extension files are in the extension/ folder');
    });

    console.log('%c✦ Web Draw v2 ready', 'color:#007aff;font-weight:bold;font-size:14px');
}

function _initShortcuts() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

        const k = e.key.toLowerCase();

        // Ctrl+Z / Ctrl+Y
        if ((e.ctrlKey || e.metaKey) && k === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (CanvasEngine.undo()) showToast(I18n.t('toast.undone'));
            return;
        }
        if ((e.ctrlKey || e.metaKey) && (k === 'y' || (k === 'z' && e.shiftKey))) {
            e.preventDefault();
            if (CanvasEngine.redo()) showToast(I18n.t('toast.redone'));
            return;
        }
        if (k === 'delete') { e.preventDefault(); Exporter.clearCanvas(); return; }

        // Zoom shortcuts
        if ((e.ctrlKey || e.metaKey) && k === '=') { e.preventDefault(); CanvasEngine.zoomIn(); return; }
        if ((e.ctrlKey || e.metaKey) && k === '-') { e.preventDefault(); CanvasEngine.zoomOut(); return; }
        if ((e.ctrlKey || e.metaKey) && k === '0') { e.preventDefault(); CanvasEngine.resetView(); return; }

        // Space = temporary hand
        if (k === ' ' && !e.repeat) {
            e.preventDefault();
            AppState._prevTool = AppState.activeTool;
            AppState.activeTool = 'hand';
            return;
        }

        // Tool shortcuts
        switch (k) {
            case 'h': AppState.activeTool = 'hand'; AppState.toolPopupOpen = null; break;
            case 'p': AppState.activeTool = 'pen'; AppState.toolPopupOpen = 'pen'; break;
            case 'e': AppState.activeTool = 'eraser'; AppState.toolPopupOpen = null; break;
            case 'b': AppState.activeTool = 'blur'; AppState.toolPopupOpen = null; break;
            case 't': AppState.activeTool = 'text'; AppState.toolPopupOpen = 'text'; break;
            case 'r': AppState.activeTool = 'shape'; AppState.toolPopupOpen = 'shape'; break;
            case 'u': AppState.urlBarVisible = !AppState.urlBarVisible; break;
            case 's': e.preventDefault(); AppState.settingsOpen = !AppState.settingsOpen; break;
            case 'i': AppState.interactMode = !AppState.interactMode; break;
            case 'escape': AppState.toolPopupOpen = null; AppState.settingsOpen = false; break;
        }
    });

    // Space release = restore previous tool
    document.addEventListener('keyup', e => {
        if (e.key === ' ' && AppState._prevTool) {
            AppState.activeTool = AppState._prevTool;
            AppState._prevTool = null;
        }
    });
}

boot();
