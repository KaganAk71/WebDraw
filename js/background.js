// ──────────────────────────────────────────────────────────────────────
// BackgroundRenderer  (js/background.js)
// ──────────────────────────────────────────────────────────────────────

import AppState from './state.js';

const BackgroundRenderer = {
    /** @type {HTMLCanvasElement} */
    canvas: null,
    /** @type {CanvasRenderingContext2D} */
    ctx: null,

    init() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.render();

        window.addEventListener('resize', () => {
            this.resize();
            this.render();
        });

        AppState.subscribe('bgType', () => this.render());
        AppState.subscribe('bgColor', () => this.render());
        AppState.subscribe('gridSize', () => this.render());
        AppState.subscribe('theme', () => this.render());
    },

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.scale(dpr, dpr);
    },

    render() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const ctx = this.ctx;
        const type = AppState.bgType;
        const bgColor = AppState.bgColor;
        const gridSize = AppState.gridSize;
        const isDark = AppState.theme === 'dark';

        ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);

        // Fill background
        ctx.fillStyle = isDark ? '#1c1c1e' : bgColor;
        ctx.fillRect(0, 0, w, h);

        const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
        const dotColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';

        switch (type) {
            case 'dots':
                this.renderDots(w, h, gridSize, dotColor);
                break;
            case 'lines':
                this.renderLines(w, h, gridSize, gridColor);
                break;
            case 'grid':
                this.renderGrid(w, h, gridSize, gridColor);
                break;
            case 'solid':
            default:
                // Background already filled
                break;
        }
    },

    renderDots(w, h, spacing, color) {
        const ctx = this.ctx;
        ctx.fillStyle = color;
        const radius = 1.2;

        for (let x = spacing; x < w; x += spacing) {
            for (let y = spacing; y < h; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    renderLines(w, h, spacing, color) {
        const ctx = this.ctx;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;

        for (let y = spacing; y < h; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    },

    renderGrid(w, h, spacing, color) {
        const ctx = this.ctx;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;

        for (let x = spacing; x < w; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        for (let y = spacing; y < h; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    }
};

export default BackgroundRenderer;
