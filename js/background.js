// ──────────────────────────────────────────────────────────────────────
// BackgroundRenderer  (js/background.js)  — dynamic theme colors
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
        ['bgType', 'bgColor', 'bgDarkColor', 'bgDynamic', 'gridSize', 'theme'].forEach(
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
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    render() {
        const w = window.innerWidth, h = window.innerHeight;
        const ctx = this.ctx;
        const type = AppState.bgType;
        const gs = AppState.gridSize;
        const isDark = AppState.theme === 'dark';
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Background color: dynamic or manual
        let bg;
        if (AppState.bgDynamic) {
            bg = isDark ? AppState.bgDarkColor : AppState.bgColor;
        } else {
            bg = AppState.bgColor;
        }
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        const gridC = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)';
        const dotC = isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.12)';

        if (type === 'dots') this._dots(w, h, gs, dotC);
        else if (type === 'lines') this._lines(w, h, gs, gridC);
        else if (type === 'grid') this._grid(w, h, gs, gridC);
    },

    _dots(w, h, s, c) {
        const ctx = this.ctx; ctx.fillStyle = c;
        for (let x = s; x < w; x += s) for (let y = s; y < h; y += s) {
            ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
        }
    },
    _lines(w, h, s, c) {
        const ctx = this.ctx; ctx.strokeStyle = c; ctx.lineWidth = .5;
        for (let y = s; y < h; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    },
    _grid(w, h, s, c) {
        const ctx = this.ctx; ctx.strokeStyle = c; ctx.lineWidth = .5;
        for (let x = s; x < w; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = s; y < h; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    }
};

export default BackgroundRenderer;
