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
        ['bgType', 'bgColor', 'bgDarkColor', 'bgDynamic', 'gridSize', 'theme', 'viewX', 'viewY', 'viewScale'].forEach(
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

    render() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth * dpr, h = window.innerHeight * dpr;
        const ctx = this.ctx;
        const type = AppState.bgType;
        const scale = AppState.viewScale;
        const gs = AppState.gridSize * scale * dpr;
        const isDark = AppState.theme === 'dark';
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Background color
        let bg = AppState.bgDynamic ? (isDark ? AppState.bgDarkColor : AppState.bgColor) : AppState.bgColor;
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        const gridC = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)';
        const dotC = isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.12)';

        if (type === 'solid' || gs < 4) return; // Hide pattern if zoomed too far out

        let offsetX = - (AppState.viewX * scale * dpr) % gs;
        let offsetY = - (AppState.viewY * scale * dpr) % gs;
        if (offsetX > 0) offsetX -= gs;
        if (offsetY > 0) offsetY -= gs;

        if (type === 'dots') this._dots(w, h, gs, dotC, offsetX, offsetY, scale * dpr);
        else if (type === 'lines') this._lines(w, h, gs, gridC, offsetY);
        else if (type === 'grid') this._grid(w, h, gs, gridC, offsetX, offsetY);
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
