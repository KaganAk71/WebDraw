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
        const bgCanvas = document.getElementById('bg-canvas');

        // Merge bg + draw onto a temp canvas
        const temp = document.createElement('canvas');
        temp.width = canvas.width;
        temp.height = canvas.height;
        const tCtx = temp.getContext('2d');

        tCtx.drawImage(bgCanvas, 0, 0);
        tCtx.drawImage(canvas, 0, 0);

        const link = document.createElement('a');
        link.download = `web-draw-${Date.now()}.png`;
        link.href = temp.toDataURL('image/png');
        link.click();

        showToast(I18n.t('toast.exported'));
    },

    exportSVG() {
        const canvas = CanvasEngine.getCanvas();
        const dataUrl = canvas.toDataURL('image/png');

        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${canvas.width}" height="${canvas.height}">
  <image xlink:href="${dataUrl}" width="${canvas.width}" height="${canvas.height}"/>
</svg>`;

        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `web-draw-${Date.now()}.svg`;
        link.href = url;
        link.click();

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
