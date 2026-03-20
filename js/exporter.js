// ──────────────────────────────────────────────────────────────────────
// Exporter  (js/exporter.js)  — updated for chunks
// ──────────────────────────────────────────────────────────────────────
import CanvasEngine from './canvas.js';
import AppState from './state.js';
import { showToast } from './overlay.js';
import I18n from './i18n.js';

const Exporter = {
    init() {
        document.getElementById('export-png')?.addEventListener('click', () => this.exportPNG());
        document.getElementById('export-svg')?.addEventListener('click', () => this.exportSVG());
        document.getElementById('clear-canvas')?.addEventListener('click', () => this.clearCanvas());
    },

    _getBounds() {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        if(CanvasEngine.chunks.size === 0) return null;

        for (const key of CanvasEngine.chunks.keys()) {
            const [cx, cy] = key.split(',').map(Number);
            const x = cx * CanvasEngine.getChunkSize();
            const y = cy * CanvasEngine.getChunkSize();
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x + CanvasEngine.getChunkSize() > maxX) maxX = x + CanvasEngine.getChunkSize();
            if (y + CanvasEngine.getChunkSize() > maxY) maxY = y + CanvasEngine.getChunkSize();
        }
        return { minX, minY, w: maxX - minX, h: maxY - minY };
    },

    exportPNG() {
        const bounds = this._getBounds();
        if(!bounds) return;

        const dpr = window.devicePixelRatio || 1;
        const t = document.createElement('canvas');
        t.width = bounds.w; t.height = bounds.h;
        const tc = t.getContext('2d');
        
        // Setup background
        const isDark = AppState.theme === 'dark';
        const bg = AppState.bgDynamic ? (isDark ? AppState.bgDarkColor : AppState.bgColor) : AppState.bgColor;
        tc.fillStyle = bg;
        tc.fillRect(0, 0, bounds.w, bounds.h);
        
        for (const [key, canvas] of CanvasEngine.chunks.entries()) {
             const [cx, cy] = key.split(',').map(Number);
             const wx = cx * CanvasEngine.getChunkSize();
             const wy = cy * CanvasEngine.getChunkSize();
             tc.drawImage(canvas, wx - bounds.minX, wy - bounds.minY, canvas.width/dpr, canvas.height/dpr);
        }

        const link = document.createElement('a');
        link.download = `web-draw-${Date.now()}.png`;
        link.href = t.toDataURL('image/png');
        link.click();
        showToast(I18n.t('toast.exported'));
    },

    exportSVG() {
        const bounds = this._getBounds();
        if(!bounds) return;

        const dpr = window.devicePixelRatio || 1;
        const t = document.createElement('canvas');
        t.width = bounds.w; t.height = bounds.h;
        const tc = t.getContext('2d');
        for (const [key, canvas] of CanvasEngine.chunks.entries()) {
             const [cx, cy] = key.split(',').map(Number);
             const wx = cx * CanvasEngine.getChunkSize();
             const wy = cy * CanvasEngine.getChunkSize();
             tc.drawImage(canvas, wx - bounds.minX, wy - bounds.minY, canvas.width/dpr, canvas.height/dpr);
        }

        const data = t.toDataURL('image/png');
        const svg = `<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${bounds.w}" height="${bounds.h}"><image xlink:href="${data}" width="${bounds.w}" height="${bounds.h}"/></svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `web-draw-${Date.now()}.svg`;
        link.href = url; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        showToast(I18n.t('toast.exported'));
    },

    clearCanvas() {
        if (confirm(I18n.t('settings.clearConfirm'))) {
            CanvasEngine.clear();
            showToast(I18n.t('toast.canvasCleared'));
        }
    }
};

export default Exporter;
