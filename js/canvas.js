// ──────────────────────────────────────────────────────────────────────
// CanvasEngine  (js/canvas.js)  — Chunked Infinite Canvas
// ──────────────────────────────────────────────────────────────────────
import AppState from './state.js';

const CHUNK_SIZE = 1024;

class DrawCommand {
    constructor() {
        this.chunkStates = new Map(); // key -> { imgData, cx, cy }
    }
}

const CanvasEngine = {
    canvas: null, ctx: null, container: null,
    chunks: new Map(), // 'cx,cy' -> HTMLCanvasElement
    undoStack: [], redoStack: [], maxHistory: 60,
    activeCommand: null,

    isPanning: false, panStartX: 0, panStartY: 0,
    panStartViewX: 0, panStartViewY: 0,

    init() {
        this.canvas = document.getElementById('draw-canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.container = document.getElementById('canvas-container');
        
        if (this.container) {
            this.container.style.transform = ''; // remove CSS transform bounds mapping
        }

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this._initZoomPan();

        AppState.subscribe('viewX', () => this.renderViewport());
        AppState.subscribe('viewY', () => this.renderViewport());
        AppState.subscribe('viewScale', () => {
            this._updateZoomBadge();
            this.renderViewport();
        });
    },

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth, h = window.innerHeight;
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.renderViewport();
    },

    /* ── Zoom / Pan ─────────────────────────────────────────────────── */
    _initZoomPan() {
        const el = this.canvas;

        el.addEventListener('wheel', e => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            let ns = AppState.viewScale + delta;
            ns = Math.max(0.1, Math.min(10, ns));
            ns = Math.round(ns * 100) / 100;
            
            if (ns !== AppState.viewScale) {
                const worldX = (mouseX / AppState.viewScale) + AppState.viewX;
                const worldY = (mouseY / AppState.viewScale) + AppState.viewY;
                AppState.viewX = worldX - (mouseX / ns);
                AppState.viewY = worldY - (mouseY / ns);
                AppState.viewScale = ns;
            }
        }, { passive: false });

        el.addEventListener('pointerdown', e => {
            if (e.button === 1) { // middle click
                e.preventDefault();
                this._startPan(e);
            }
        });

        window.addEventListener('pointermove', e => {
            if (this.isPanning) {
                const dx = e.clientX - this.panStartX;
                const dy = e.clientY - this.panStartY;
                AppState.viewX = this.panStartViewX - (dx / AppState.viewScale);
                AppState.viewY = this.panStartViewY - (dy / AppState.viewScale);
            }
        });

        window.addEventListener('pointerup', () => { this.isPanning = false; });

        // Touch pinch zoom
        let lastDist = 0;
        let lastPinchCenter = { x: 0, y: 0 };

        el.addEventListener('touchstart', e => {
            if (e.touches.length === 2) {
                lastDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                lastPinchCenter = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                };
            }
        }, { passive: true });

        el.addEventListener('touchmove', e => {
            if (e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const rect = el.getBoundingClientRect();
                const center = {
                    x: ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left,
                    y: ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top
                };

                const delta = (dist - lastDist) * 0.005;
                lastDist = dist;

                let ns = AppState.viewScale + delta;
                ns = Math.max(0.1, Math.min(10, ns));
                ns = Math.round(ns * 100) / 100;

                if (ns !== AppState.viewScale) {
                    const worldX = (center.x / AppState.viewScale) + AppState.viewX;
                    const worldY = (center.y / AppState.viewScale) + AppState.viewY;
                    AppState.viewX = worldX - (center.x / ns);
                    AppState.viewY = worldY - (center.y / ns);
                    AppState.viewScale = ns;
                }
            }
        }, { passive: true });
    },

    startPan(e) { this._startPan(e); },

    _startPan(e) {
        this.isPanning = true;
        this.panStartX = e.clientX;
        this.panStartY = e.clientY;
        this.panStartViewX = AppState.viewX;
        this.panStartViewY = AppState.viewY;
    },

    _updateZoomBadge() {
        const badge = document.getElementById('zoom-badge');
        if (badge) badge.textContent = Math.round(AppState.viewScale * 100) + '%';
    },

    resetView() {
        AppState.viewScale = 1;
        AppState.viewX = 0;
        AppState.viewY = 0;
    },

    zoomIn() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const ns = Math.min(10, Math.round((AppState.viewScale + 0.2) * 100) / 100);
        const worldX = (cx / AppState.viewScale) + AppState.viewX;
        const worldY = (cy / AppState.viewScale) + AppState.viewY;
        AppState.viewX = worldX - (cx / ns);
        AppState.viewY = worldY - (cy / ns);
        AppState.viewScale = ns;
    },

    zoomOut() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const ns = Math.max(0.1, Math.round((AppState.viewScale - 0.2) * 100) / 100);
        const worldX = (cx / AppState.viewScale) + AppState.viewX;
        const worldY = (cy / AppState.viewScale) + AppState.viewY;
        AppState.viewX = worldX - (cx / ns);
        AppState.viewY = worldY - (cy / ns);
        AppState.viewScale = ns;
    },

    screenToCanvas(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: ((clientX - rect.left) / AppState.viewScale) + AppState.viewX,
            y: ((clientY - rect.top) / AppState.viewScale) + AppState.viewY
        };
    },

    /* ── Chunk Logic ────────────────────────────────────────────────── */
    getChunkSize() { return CHUNK_SIZE; },

    getChunk(cx, cy) {
        const key = `${cx},${cy}`;
        if (!this.chunks.has(key)) {
            const c = document.createElement('canvas');
            const dpr = window.devicePixelRatio || 1;
            c.width = CHUNK_SIZE * dpr;
            c.height = CHUNK_SIZE * dpr;
            const ctx = c.getContext('2d', { willReadFrequently: true });
            ctx.scale(dpr, dpr);
            this.chunks.set(key, c);
        }
        return this.chunks.get(key);
    },

    executeOnChunks(bounds, fn) {
        // bounds: {minX, minY, maxX, maxY} in world coords
        const minCx = Math.floor(bounds.minX / CHUNK_SIZE);
        const maxCx = Math.floor(bounds.maxX / CHUNK_SIZE);
        const minCy = Math.floor(bounds.minY / CHUNK_SIZE);
        const maxCy = Math.floor(bounds.maxY / CHUNK_SIZE);

        const dpr = window.devicePixelRatio || 1;

        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cy = minCy; cy <= maxCy; cy++) {
                const key = `${cx},${cy}`;
                const canvas = this.getChunk(cx, cy);
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                
                // Track state if activeCommand is open
                if (this.activeCommand && !this.activeCommand.chunkStates.has(key)) {
                    // Temporarily reset transform to get raw pixels
                    ctx.save();
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    this.activeCommand.chunkStates.set(key, {
                        imgData: ctx.getImageData(0, 0, canvas.width, canvas.height),
                        cx, cy
                    });
                    ctx.restore();
                }

                ctx.save();
                ctx.translate(-cx * CHUNK_SIZE, -cy * CHUNK_SIZE);
                fn(ctx, canvas, cx, cy);
                ctx.restore();
            }
        }
        this.renderViewport();
    },

    renderViewport() {
        if (!this.ctx) return;
        const dpr = window.devicePixelRatio || 1;
        const vW = this.canvas.width;
        const vH = this.canvas.height;
        this.ctx.clearRect(0, 0, vW, vH);
        
        this.ctx.save();
        this.ctx.scale(dpr * AppState.viewScale, dpr * AppState.viewScale);
        this.ctx.translate(-AppState.viewX, -AppState.viewY);

        const minX = AppState.viewX;
        const minY = AppState.viewY;
        const maxX = minX + (vW / (dpr * AppState.viewScale));
        const maxY = minY + (vH / (dpr * AppState.viewScale));

        const minCx = Math.floor(minX / CHUNK_SIZE);
        const maxCx = Math.floor(maxX / CHUNK_SIZE);
        const minCy = Math.floor(minY / CHUNK_SIZE);
        const maxCy = Math.floor(maxY / CHUNK_SIZE);

        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cy = minCy; cy <= maxCy; cy++) {
                const key = `${cx},${cy}`;
                if (this.chunks.has(key)) {
                    // Destination width/height is the logical CHUNK_SIZE so it scales back from dpr correctly
                    this.ctx.drawImage(this.chunks.get(key), cx * CHUNK_SIZE, cy * CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE);
                }
            }
        }
        this.ctx.restore();
    },

    /* ── Undo / Redo ────────────────────────────────────────────────── */
    saveState() {
        this.activeCommand = new DrawCommand();
    },

    commitState() {
        if (this.activeCommand && this.activeCommand.chunkStates.size > 0) {
            this.undoStack.push(this.activeCommand);
            if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
            this.redoStack = [];
        }
        this.activeCommand = null;
    },

    undo() {
        if (!this.undoStack.length) return false;
        const cmd = this.undoStack.pop();
        
        const redoCmd = new DrawCommand();
        for (const [key, state] of cmd.chunkStates.entries()) {
            const canvas = this.getChunk(state.cx, state.cy);
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            redoCmd.chunkStates.set(key, {
                imgData: ctx.getImageData(0, 0, canvas.width, canvas.height),
                cx: state.cx, cy: state.cy
            });
            ctx.putImageData(state.imgData, 0, 0);
            ctx.restore();
        }
        this.redoStack.push(redoCmd);
        this.renderViewport();
        return true;
    },

    redo() {
        if (!this.redoStack.length) return false;
        const cmd = this.redoStack.pop();

        const undoCmd = new DrawCommand();
        for (const [key, state] of cmd.chunkStates.entries()) {
            const canvas = this.getChunk(state.cx, state.cy);
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            undoCmd.chunkStates.set(key, {
                imgData: ctx.getImageData(0, 0, canvas.width, canvas.height),
                cx: state.cx, cy: state.cy
            });
            ctx.putImageData(state.imgData, 0, 0);
            ctx.restore();
        }
        this.undoStack.push(undoCmd);
        this.renderViewport();
        return true;
    },

    clear() {
        this.saveState();
        for (const [key, canvas] of this.chunks.entries()) {
            const [cx, cy] = key.split(',').map(Number);
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.activeCommand.chunkStates.set(key, {
                imgData: ctx.getImageData(0, 0, canvas.width, canvas.height),
                cx, cy
            });
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
        this.commitState();
        this.renderViewport();
    },

    getCanvas() { return this.canvas; },
    getContext() { return this.ctx; } // for text shapes preview overlay only!
};

export default CanvasEngine;
