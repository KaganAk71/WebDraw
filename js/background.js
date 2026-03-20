// ──────────────────────────────────────────────────────────────────────
// BackgroundRenderer  (js/background.js)  — Infinite Dynamic background
// ──────────────────────────────────────────────────────────────────────
import AppState from './state.js';

const BackgroundRenderer = {
    canvas: null, ctx: null,

    init() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.render();
        window.addEventListener('resize', () => { this.resize(); this.render(); });
        ['bgType', 'bgColor', 'gridColor', 'gridSize', 'gridUnit', 'theme', 'viewX', 'viewY', 'viewScale', 'docWidth', 'docHeight'].forEach(
            k => AppState.subscribe(k, () => this.render())
        );
    },

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth, h = window.innerHeight;
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
    },

    _getGridSizeInPx() {
        const val = AppState.gridSize || 24;
        const u = AppState.gridUnit || 'px';
        if (u === 'cm') return val * 37.7952755;
        if (u === 'in') return val * 96;
        return val;
    },

    render() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth * dpr, h = window.innerHeight * dpr;
        const ctx = this.ctx;
        const type = AppState.bgType;
        const scale = AppState.viewScale;
        
        const baseGridSize = this._getGridSizeInPx();
        const gs = baseGridSize * scale * dpr;
        const isDark = AppState.theme === 'dark';
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        let bg = AppState.bgColor;
        let wsBg = isDark ? '#0f0f11' : '#f0f0f5';

        if (AppState.docWidth > 0 && AppState.docHeight > 0) {
            ctx.fillStyle = wsBg;
            ctx.fillRect(0, 0, w, h);
            
            ctx.save();
            ctx.translate(-AppState.viewX * scale * dpr, -AppState.viewY * scale * dpr);
            
            ctx.shadowColor = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)';
            ctx.shadowBlur = 12 * scale;
            ctx.shadowOffsetX = 2 * scale;
            ctx.shadowOffsetY = 4 * scale;
            
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, AppState.docWidth * scale * dpr, AppState.docHeight * scale * dpr);
            ctx.restore();

            // Clip grid to document
            ctx.save();
            ctx.translate(-AppState.viewX * scale * dpr, -AppState.viewY * scale * dpr);
            ctx.beginPath();
            ctx.rect(0, 0, AppState.docWidth * scale * dpr, AppState.docHeight * scale * dpr);
            ctx.clip();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);
        }

        const patternColor = AppState.gridColor;

        if (type === 'solid' || gs < 4) return; // Hide pattern if zoomed too far out

        let offsetX = - (AppState.viewX * scale * dpr) % gs;
        let offsetY = - (AppState.viewY * scale * dpr) % gs;
        if (offsetX > 0) offsetX -= gs;
        if (offsetY > 0) offsetY -= gs;

        if (type === 'dots') this._dots(w, h, gs, patternColor, offsetX, offsetY, scale * dpr);
        else if (type === 'lines') this._lines(w, h, gs, patternColor, offsetY);
        else if (type === 'grid') this._grid(w, h, gs, patternColor, offsetX, offsetY);

        if (AppState.docWidth > 0 && AppState.docHeight > 0) {
            ctx.restore();
        }
    },

    _dots(w, h, s, c, ox, oy, scaleFactor) {
        const ctx = this.ctx; ctx.fillStyle = c;
        for (let x = ox; x <= w + s; x += s) {
            for (let y = oy; y <= h + s; y += s) {
                ctx.beginPath(); ctx.arc(x, y, 1.2 * scaleFactor, 0, Math.PI * 2); ctx.fill();
            }
        }
    },
    _lines(w, h, s, c, oy) {
        const ctx = this.ctx; ctx.strokeStyle = c; ctx.lineWidth = .5;
        for (let y = oy; y <= h + s; y += s) { 
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); 
        }
    },
    _grid(w, h, s, c, ox, oy) {
        const ctx = this.ctx; ctx.strokeStyle = c; ctx.lineWidth = .5;
        for (let x = ox; x <= w + s; x += s) { 
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); 
        }
        for (let y = oy; y <= h + s; y += s) { 
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); 
        }
    }
};

export default BackgroundRenderer;
