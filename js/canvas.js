// ──────────────────────────────────────────────────────────────────────
// CanvasEngine  (js/canvas.js)
// ──────────────────────────────────────────────────────────────────────

import AppState from './state.js';

// Command for undo/redo
class DrawCommand {
    constructor(imageData) {
        this.imageData = imageData;
    }
}

const CanvasEngine = {
    /** @type {HTMLCanvasElement} */
    canvas: null,
    /** @type {CanvasRenderingContext2D} */
    ctx: null,

    undoStack: [],
    redoStack: [],
    maxHistory: 50,

    init() {
        this.canvas = document.getElementById('draw-canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.resize();

        window.addEventListener('resize', () => this.resize());

        // Update canvas bg based on theme
        AppState.subscribe('theme', () => {
            // Canvas is transparent — no action needed.
        });
    },

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Save current state
        let imageData = null;
        if (this.canvas.width > 0 && this.canvas.height > 0) {
            imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        }

        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.scale(dpr, dpr);

        // Restore
        if (imageData) {
            this.ctx.putImageData(imageData, 0, 0);
        }
    },

    saveState() {
        const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.undoStack.push(new DrawCommand(data));
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    },

    undo() {
        if (this.undoStack.length === 0) return false;
        const current = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.redoStack.push(new DrawCommand(current));
        const prev = this.undoStack.pop();
        this.ctx.putImageData(prev.imageData, 0, 0);
        return true;
    },

    redo() {
        if (this.redoStack.length === 0) return false;
        const current = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.undoStack.push(new DrawCommand(current));
        const next = this.redoStack.pop();
        this.ctx.putImageData(next.imageData, 0, 0);
        return true;
    },

    clear() {
        this.saveState();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    getContext() {
        return this.ctx;
    },

    getCanvas() {
        return this.canvas;
    }
};

export default CanvasEngine;
