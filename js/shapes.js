// ──────────────────────────────────────────────────────────────────────
// ShapeTool  (js/shapes.js)
// Rectangle, Circle, Line, Arrow, Triangle, Star
// ──────────────────────────────────────────────────────────────────────
import AppState, { ToolConfig } from './state.js';
import CanvasEngine from './canvas.js';

function getCoords(e) {
    return CanvasEngine.screenToCanvas(e.clientX, e.clientY);
}

const ShapeTool = {
    drawing: false,
    startX: 0, startY: 0,
    previewCanvas: null,
    previewCtx: null,

    init() {
        const canvas = CanvasEngine.getCanvas();
        // Create preview overlay canvas
        this.previewCanvas = document.getElementById('shape-preview');
        if (!this.previewCanvas) {
            this.previewCanvas = document.createElement('canvas');
            this.previewCanvas.id = 'shape-preview';
            this.previewCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:31;pointer-events:none';
            canvas.parentElement.appendChild(this.previewCanvas);
        }
        this.previewCtx = this.previewCanvas.getContext('2d');

        window.addEventListener('resize', () => this._resizePreview());
        this._resizePreview();

        canvas.addEventListener('pointerdown', e => this.onPointerDown(e));
        canvas.addEventListener('pointermove', e => this.onPointerMove(e));
        canvas.addEventListener('pointerup', e => this.onPointerUp(e));
    },

    _resizePreview() {
        const dpr = window.devicePixelRatio || 1;
        this.previewCanvas.width = window.innerWidth * dpr;
        this.previewCanvas.height = window.innerHeight * dpr;
        this.previewCanvas.style.width = window.innerWidth + 'px';
        this.previewCanvas.style.height = window.innerHeight + 'px';
        this.previewCtx.scale(dpr, dpr);
    },

    onPointerDown(e) {
        if (AppState.activeTool !== 'shape' || e.button !== 0) return;
        CanvasEngine.saveState();
        this.drawing = true;
        const p = getCoords(e);
        this.startX = p.x; this.startY = p.y;
    },

    onPointerMove(e) {
        if (!this.drawing || AppState.activeTool !== 'shape') return;
        const p = getCoords(e);
        this._clearPreview();
        this._drawShape(this.previewCtx, this.startX, this.startY, p.x, p.y);
    },

    onPointerUp(e) {
        if (!this.drawing || AppState.activeTool !== 'shape') return;
        this.drawing = false;
        this._clearPreview();
        const p = getCoords(e);
        this._drawShape(CanvasEngine.getContext(), this.startX, this.startY, p.x, p.y);
    },

    _clearPreview() {
        const dpr = window.devicePixelRatio || 1;
        this.previewCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        this.previewCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    _drawShape(ctx, x1, y1, x2, y2) {
        const cfg = ToolConfig.get('shape');
        const type = AppState.shapeType;

        ctx.save();
        ctx.strokeStyle = cfg.strokeColor;
        ctx.fillStyle = cfg.fillColor;
        ctx.lineWidth = cfg.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        switch (type) {
            case 'rectangle':
                this._rect(ctx, x1, y1, x2, y2, cfg);
                break;
            case 'circle':
                this._circle(ctx, x1, y1, x2, y2, cfg);
                break;
            case 'line':
                this._line(ctx, x1, y1, x2, y2);
                break;
            case 'arrow':
                this._arrow(ctx, x1, y1, x2, y2);
                break;
            case 'triangle':
                this._triangle(ctx, x1, y1, x2, y2, cfg);
                break;
            case 'star':
                this._star(ctx, x1, y1, x2, y2, cfg);
                break;
        }
        ctx.restore();
    },

    _rect(ctx, x1, y1, x2, y2, cfg) {
        const w = x2 - x1, h = y2 - y1;
        if (cfg.fillColor && cfg.fillColor !== 'transparent') {
            ctx.fillRect(x1, y1, w, h);
        }
        ctx.strokeRect(x1, y1, w, h);
    },

    _circle(ctx, x1, y1, x2, y2, cfg) {
        const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
        const rx = Math.abs(x2 - x1) / 2, ry = Math.abs(y2 - y1) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (cfg.fillColor && cfg.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
    },

    _line(ctx, x1, y1, x2, y2) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    },

    _arrow(ctx, x1, y1, x2, y2) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        // Arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = Math.max(10, ctx.lineWidth * 4);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    },

    _triangle(ctx, x1, y1, x2, y2, cfg) {
        const mx = (x1 + x2) / 2;
        ctx.beginPath();
        ctx.moveTo(mx, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x1, y2);
        ctx.closePath();
        if (cfg.fillColor && cfg.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
    },

    _star(ctx, x1, y1, x2, y2, cfg) {
        const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
        const outerR = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
        const innerR = outerR * 0.4;
        const points = 5;
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (Math.PI * i) / points - Math.PI / 2;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        if (cfg.fillColor && cfg.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
    }
};

export default ShapeTool;
