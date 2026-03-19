// ──────────────────────────────────────────────────────────────────────
// Exporter  (js/exporter.js)
// ──────────────────────────────────────────────────────────────────────
import CanvasEngine from './canvas.js';
import { showToast } from './overlay.js';
import I18n from './i18n.js';

const Exporter = {
    init() {
        document.getElementById('export-png')?.addEventListener('click', () => this.exportPNG());
        document.getElementById('export-svg')?.addEventListener('click', () => this.exportSVG());
        document.getElementById('clear-canvas')?.addEventListener('click', () => this.clearCanvas());
    },

    exportPNG() {
        const canvas = CanvasEngine.getCanvas();
        const bg = document.getElementById('bg-canvas');
        const t = document.createElement('canvas');
        t.width = canvas.width; t.height = canvas.height;
        const tc = t.getContext('2d');
        tc.drawImage(bg, 0, 0);
        tc.drawImage(canvas, 0, 0);
        const link = document.createElement('a');
        link.download = `web-draw-${Date.now()}.png`;
        link.href = t.toDataURL('image/png');
        link.click();
        showToast(I18n.t('toast.exported'));
    },

    exportSVG() {
        const canvas = CanvasEngine.getCanvas();
        const data = canvas.toDataURL('image/png');
        const svg = `<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}"><image xlink:href="${data}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
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
