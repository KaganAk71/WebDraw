// ──────────────────────────────────────────────────────────────────────
// CanvasEngine  (js/canvas.js)  — zoom/pan support, coordinate conversion
// ──────────────────────────────────────────────────────────────────────
import AppState from './state.js';

class DrawCommand {
    constructor(data) { this.data = data; }
}

const CanvasEngine = {
  /** @type {HTMLCanvasElement} */ canvas: null,
  /** @type {CanvasRenderingContext2D} */ ctx: null,
  /** @type {HTMLElement} */ container: null,
    undoStack: [], redoStack: [], maxHistory: 60,

    // Pan / zoom
    isPanning: false,
    panStartX: 0, panStartY: 0,
    panStartViewX: 0, panStartViewY: 0,

    init() {
        this.canvas = document.getElementById('draw-canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.container = document.getElementById('canvas-container');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this._initZoomPan();
    },

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth, h = window.innerHeight;
        let imageData = null;
        if (this.canvas.width > 0 && this.canvas.height > 0) {
            try { imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height); } catch { }
        }
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.scale(dpr, dpr);
        if (imageData) this.ctx.putImageData(imageData, 0, 0);
    },

    /* ── Zoom / Pan ─────────────────────────────────────────────────── */
    _initZoomPan() {
        const el = this.canvas;

        // Wheel zoom
        el.addEventListener('wheel', e => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            let ns = AppState.viewScale + delta;
            ns = Math.max(0.2, Math.min(5, ns));
            AppState.viewScale = Math.round(ns * 100) / 100;
            this._applyView();
        }, { passive: false });

        // Middle mouse pan
        el.addEventListener('pointerdown', e => {
            if (e.button === 1) { // middle
                e.preventDefault();
                this._startPan(e);
            }
        });

        // Pan with hand tool (left click when activeTool=hand)
        // This is handled by ToolManager dispatching to us

        window.addEventListener('pointermove', e => {
            if (this.isPanning) {
                const dx = e.clientX - this.panStartX;
                const dy = e.clientY - this.panStartY;
                AppState.viewX = this.panStartViewX + dx;
                AppState.viewY = this.panStartViewY + dy;
                this._applyView();
            }
        });
        window.addEventListener('pointerup', e => {
            if (this.isPanning) this.isPanning = false;
        });

        // Touch pinch zoom
        let lastDist = 0;
        el.addEventListener('touchstart', e => {
            if (e.touches.length === 2) {
                lastDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        }, { passive: true });
        el.addEventListener('touchmove', e => {
            if (e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const delta = (dist - lastDist) * 0.005;
                lastDist = dist;
                let ns = AppState.viewScale + delta;
                ns = Math.max(0.2, Math.min(5, ns));
                AppState.viewScale = Math.round(ns * 100) / 100;
                this._applyView();
            }
        }, { passive: true });

        AppState.subscribe('viewScale', () => this._updateZoomBadge());
        AppState.subscribe('viewX', () => { });
        AppState.subscribe('viewY', () => { });
    },

    startPan(e) { this._startPan(e); },

    _startPan(e) {
        this.isPanning = true;
        this.panStartX = e.clientX;
        this.panStartY = e.clientY;
        this.panStartViewX = AppState.viewX;
        this.panStartViewY = AppState.viewY;
    },

    _applyView() {
        const s = AppState.viewScale;
        const x = AppState.viewX;
        const y = AppState.viewY;
        if (this.container) {
            this.container.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
        }
        this._updateZoomBadge();
    },

    _updateZoomBadge() {
        const badge = document.getElementById('zoom-badge');
        if (badge) badge.textContent = Math.round(AppState.viewScale * 100) + '%';
    },

    resetView() {
        AppState.viewScale = 1;
        AppState.viewX = 0;
        AppState.viewY = 0;
        this._applyView();
    },

    zoomIn() {
        AppState.viewScale = Math.min(5, Math.round((AppState.viewScale + 0.2) * 100) / 100);
        this._applyView();
    },

    zoomOut() {
        AppState.viewScale = Math.max(0.2, Math.round((AppState.viewScale - 0.2) * 100) / 100);
        this._applyView();
    },

    /* ── Coordinate conversion (screen → canvas) ───────────────────── */
    screenToCanvas(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) * (this.canvas.width / rect.width) / (window.devicePixelRatio || 1),
            y: (clientY - rect.top) * (this.canvas.height / rect.height) / (window.devicePixelRatio || 1)
        };
    },

    /* ── Undo / Redo ────────────────────────────────────────────────── */
    saveState() {
        const d = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.undoStack.push(new DrawCommand(d));
        if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
        this.redoStack = [];
    },
    undo() {
        if (!this.undoStack.length) return false;
        const cur = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.redoStack.push(new DrawCommand(cur));
        const prev = this.undoStack.pop();
        this.ctx.putImageData(prev.data, 0, 0);
        return true;
    },
    redo() {
        if (!this.redoStack.length) return false;
        const cur = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.undoStack.push(new DrawCommand(cur));
        const next = this.redoStack.pop();
        this.ctx.putImageData(next.data, 0, 0);
        return true;
    },
    clear() {
        this.saveState();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    getContext() { return this.ctx; },
    getCanvas() { return this.canvas; }
};

export default CanvasEngine;
