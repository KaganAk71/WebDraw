// ──────────────────────────────────────────────────────────────────────
// ToolManager + Pen Strategies  (js/tools.js)
// Multiple pen types: ballpoint, fountain, pencil, marker, watercolor, crayon
// Eraser, Blur with strength control, Hand/Pan tool
// ──────────────────────────────────────────────────────────────────────
import AppState, { ToolConfig } from './state.js';
import CanvasEngine from './canvas.js';

/* ═══ Helper ═══ */
function getCoords(e) {
    return CanvasEngine.screenToCanvas(e.clientX, e.clientY);
}

/* ═══ Hand (Pan) ═══ */
const HandTool = {
    onPointerDown(e) { CanvasEngine.startPan(e); },
    onPointerMove() { },
    onPointerUp() { }
};

/* ═══ Ballpoint Pen ═══ */
const BallpointTool = {
    drawing: false, lx: 0, ly: 0,
    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        const p = getCoords(e); this.lx = p.x; this.ly = p.y;
    },
    onPointerMove(e) {
        if (!this.drawing) return;
        const cfg = ToolConfig.get('ballpoint');
        const ctx = CanvasEngine.getContext();
        const p = getCoords(e);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = cfg.opacity / 100;
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = cfg.size;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(this.lx, this.ly); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.globalAlpha = 1;
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { this.drawing = false; CanvasEngine.getContext().globalAlpha = 1; }
};

/* ═══ Fountain Pen — speed-sensitive width ═══ */
const FountainTool = {
    drawing: false, lx: 0, ly: 0, lt: 0,
    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        const p = getCoords(e); this.lx = p.x; this.ly = p.y; this.lt = Date.now();
    },
    onPointerMove(e) {
        if (!this.drawing) return;
        const cfg = ToolConfig.get('fountain');
        const ctx = CanvasEngine.getContext();
        const p = getCoords(e);
        const now = Date.now();
        const dist = Math.hypot(p.x - this.lx, p.y - this.ly);
        const dt = Math.max(1, now - this.lt);
        const speed = dist / dt;
        const width = Math.max(cfg.size * 0.4, cfg.size * (1.6 - speed * 0.8));

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = cfg.opacity / 100;
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(this.lx, this.ly); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.globalAlpha = 1;
        this.lx = p.x; this.ly = p.y; this.lt = now;
    },
    onPointerUp() { this.drawing = false; CanvasEngine.getContext().globalAlpha = 1; }
};

/* ═══ Pencil — textured, lighter ═══ */
const PencilTool = {
    drawing: false, lx: 0, ly: 0,
    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        const p = getCoords(e); this.lx = p.x; this.ly = p.y;
    },
    onPointerMove(e) {
        if (!this.drawing) return;
        const cfg = ToolConfig.get('pencil');
        const ctx = CanvasEngine.getContext();
        const p = getCoords(e);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = (cfg.opacity / 100) * (0.6 + Math.random() * 0.4);
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = cfg.size + Math.random() * 0.5;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(this.lx, this.ly); ctx.lineTo(p.x, p.y); ctx.stroke();
        // slight texture via jitter
        if (Math.random() > 0.5) {
            ctx.fillStyle = cfg.color;
            ctx.globalAlpha = (cfg.opacity / 100) * 0.3;
            ctx.fillRect(p.x + (Math.random() - 0.5) * cfg.size, p.y + (Math.random() - 0.5) * cfg.size, 1, 1);
        }
        ctx.globalAlpha = 1;
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { this.drawing = false; CanvasEngine.getContext().globalAlpha = 1; }
};

/* ═══ Marker (Highlighter) — wide, semi-transparent, flat ═══ */
const MarkerTool = {
    drawing: false, lx: 0, ly: 0,
    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        const p = getCoords(e); this.lx = p.x; this.ly = p.y;
    },
    onPointerMove(e) {
        if (!this.drawing) return;
        const cfg = ToolConfig.get('marker');
        const ctx = CanvasEngine.getContext();
        const p = getCoords(e);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = cfg.opacity / 100;
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = cfg.size;
        ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
        ctx.beginPath(); ctx.moveTo(this.lx, this.ly); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.globalAlpha = 1;
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { this.drawing = false; CanvasEngine.getContext().globalAlpha = 1; }
};

/* ═══ Watercolor — soft, blending ═══ */
const WatercolorTool = {
    drawing: false, lx: 0, ly: 0,
    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        const p = getCoords(e); this.lx = p.x; this.ly = p.y;
    },
    onPointerMove(e) {
        if (!this.drawing) return;
        const cfg = ToolConfig.get('watercolor');
        const ctx = CanvasEngine.getContext();
        const p = getCoords(e);
        ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 3; i++) {
            ctx.globalAlpha = (cfg.opacity / 100) * (0.3 + Math.random() * 0.3);
            ctx.strokeStyle = cfg.color;
            ctx.lineWidth = cfg.size * (0.7 + Math.random() * 0.6);
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            const jx = (Math.random() - 0.5) * cfg.size * 0.3;
            const jy = (Math.random() - 0.5) * cfg.size * 0.3;
            ctx.beginPath();
            ctx.moveTo(this.lx + jx, this.ly + jy);
            ctx.lineTo(p.x + jx, p.y + jy);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { this.drawing = false; CanvasEngine.getContext().globalAlpha = 1; }
};

/* ═══ Crayon — textured, rough ═══ */
const CrayonTool = {
    drawing: false, lx: 0, ly: 0,
    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        const p = getCoords(e); this.lx = p.x; this.ly = p.y;
    },
    onPointerMove(e) {
        if (!this.drawing) return;
        const cfg = ToolConfig.get('crayon');
        const ctx = CanvasEngine.getContext();
        const p = getCoords(e);
        ctx.globalCompositeOperation = 'source-over';
        const dist = Math.hypot(p.x - this.lx, p.y - this.ly);
        const steps = Math.max(1, Math.floor(dist));
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const cx = this.lx + (p.x - this.lx) * t;
            const cy = this.ly + (p.y - this.ly) * t;
            for (let j = 0; j < 4; j++) {
                const rx = cx + (Math.random() - 0.5) * cfg.size;
                const ry = cy + (Math.random() - 0.5) * cfg.size;
                ctx.globalAlpha = (cfg.opacity / 100) * (0.3 + Math.random() * 0.5);
                ctx.fillStyle = cfg.color;
                ctx.fillRect(rx, ry, 1 + Math.random(), 1 + Math.random());
            }
        }
        ctx.globalAlpha = 1;
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { this.drawing = false; CanvasEngine.getContext().globalAlpha = 1; }
};

/* ═══ Eraser ═══ */
const EraserTool = {
    drawing: false, lx: 0, ly: 0,
    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        const p = getCoords(e); this.lx = p.x; this.ly = p.y;
    },
    onPointerMove(e) {
        if (!this.drawing) return;
        const cfg = ToolConfig.get('eraser');
        const ctx = CanvasEngine.getContext();
        const p = getCoords(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1;
        ctx.lineWidth = cfg.size;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(this.lx, this.ly); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() {
        this.drawing = false;
        CanvasEngine.getContext().globalCompositeOperation = 'source-over';
    }
};

/* ═══ Blur — fixed: uses temp canvas, strength control ═══ */
const BlurTool = {
    drawing: false, lx: 0, ly: 0,
    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        const p = getCoords(e); this.lx = p.x; this.ly = p.y;
    },
    onPointerMove(e) {
        if (!this.drawing) return;
        const cfg = ToolConfig.get('blur');
        const ctx = CanvasEngine.getContext();
        const canvas = CanvasEngine.getCanvas();
        const p = getCoords(e);
        const size = cfg.size;
        const strength = cfg.strength || 3;
        const dpr = window.devicePixelRatio || 1;
        const sx = Math.max(0, Math.floor((p.x - size / 2) * dpr));
        const sy = Math.max(0, Math.floor((p.y - size / 2) * dpr));
        const sw = Math.min(canvas.width - sx, Math.floor(size * dpr));
        const sh = Math.min(canvas.height - sy, Math.floor(size * dpr));
        if (sw <= 0 || sh <= 0) return;

        try {
            // Read area into temp canvas, apply blur, write back
            const tmp = document.createElement('canvas');
            tmp.width = sw; tmp.height = sh;
            const tc = tmp.getContext('2d');
            tc.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
            // Clear original area
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(sx, sy, sw, sh);
            ctx.filter = `blur(${strength}px)`;
            ctx.drawImage(tmp, 0, 0, sw, sh, sx, sy, sw, sh);
            ctx.filter = 'none';
            ctx.restore();
        } catch { }
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { this.drawing = false; }
};

/* ═══ Pen type map ═════════════════════════════════════════════════ */
const penTools = {
    ballpoint: BallpointTool,
    fountain: FountainTool,
    pencil: PencilTool,
    marker: MarkerTool,
    watercolor: WatercolorTool,
    crayon: CrayonTool,
};

/* ═══ ToolManager ═════════════════════════════════════════════════ */
const ToolManager = {
    cursorPreview: null,

    init() {
        this.cursorPreview = document.getElementById('cursor-preview');
        const canvas = CanvasEngine.getCanvas();

        canvas.addEventListener('pointerdown', e => this._onDown(e));
        canvas.addEventListener('pointermove', e => this._onMove(e));
        canvas.addEventListener('pointerup', e => this._onUp(e));
        canvas.addEventListener('pointerleave', e => this._onUp(e));

        // Cursor preview
        canvas.addEventListener('pointermove', e => this._updateCursor(e));
        canvas.addEventListener('pointerenter', () => this.cursorPreview?.classList.add('visible'));
        canvas.addEventListener('pointerleave', () => this.cursorPreview?.classList.remove('visible'));

        // Tool button clicks
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => this._onToolBtnClick(btn.dataset.tool));
        });

        AppState.subscribe('activeTool', () => this._updateUI());
        AppState.subscribe('penType', () => this._updateUI());
        this._updateUI();
    },

    _getActiveTool() {
        const t = AppState.activeTool;
        if (t === 'hand') return HandTool;
        if (t === 'pen') return penTools[AppState.penType] || BallpointTool;
        if (t === 'eraser') return EraserTool;
        if (t === 'blur') return BlurTool;
        // text and shape handled by their own modules
        return null;
    },

    _onDown(e) {
        if (e.button === 1) return; // middle handled by CanvasEngine
        if (AppState.interactMode) return;

        // Right click → configurable tool
        if (e.button === 2) {
            e.preventDefault();
            const rc = AppState.rightClickTool;
            if (rc === 'eraser') { EraserTool.onPointerDown(e); this._rightClickActive = EraserTool; }
            else if (rc === 'pan') { CanvasEngine.startPan(e); this._rightClickActive = 'pan'; }
            return;
        }

        // Close popup when clicking canvas
        if (AppState.toolPopupOpen) {
            AppState.toolPopupOpen = null;
        }

        const tool = this._getActiveTool();
        if (tool) {
            e.preventDefault();
            tool.onPointerDown(e);
        }
    },

    _onMove(e) {
        if (AppState.interactMode) return;
        // right click tool movement
        if (this._rightClickActive) {
            if (this._rightClickActive === 'pan') return; // handled by CanvasEngine
            this._rightClickActive.onPointerMove(e);
            return;
        }
        const tool = this._getActiveTool();
        if (tool) tool.onPointerMove(e);
    },

    _onUp(e) {
        if (this._rightClickActive) {
            if (this._rightClickActive !== 'pan') this._rightClickActive.onPointerUp(e);
            this._rightClickActive = null;
            return;
        }
        const tool = this._getActiveTool();
        if (tool) tool.onPointerUp(e);
    },

    _onToolBtnClick(toolName) {
        if (toolName === 'settings') {
            AppState.settingsOpen = !AppState.settingsOpen;
            AppState.toolPopupOpen = null;
            return;
        }
        if (toolName === 'interact') {
            AppState.interactMode = !AppState.interactMode;
            return;
        }
        if (toolName === 'urlOverlay') {
            AppState.urlBarVisible = !AppState.urlBarVisible;
            AppState.toolPopupOpen = null;
            return;
        }

        // For tools that have popups (pen, eraser, blur, text, shape)
        const popupTools = ['pen', 'eraser', 'blur', 'text', 'shape'];
        if (popupTools.includes(toolName)) {
            if (AppState.activeTool === toolName) {
                // Toggle popup
                AppState.toolPopupOpen = AppState.toolPopupOpen === toolName ? null : toolName;
            } else {
                AppState.activeTool = toolName;
                AppState.toolPopupOpen = toolName;
            }
        } else {
            AppState.activeTool = toolName;
            AppState.toolPopupOpen = null;
        }
    },

    _updateUI() {
        const tool = AppState.activeTool;
        const canvas = CanvasEngine.getCanvas();

        // Update active button
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });

        // Cursor style
        canvas.classList.remove('tool-active', 'tool-text');
        if (tool === 'hand') {
            canvas.style.cursor = 'grab';
        } else if (tool === 'text') {
            canvas.classList.add('tool-text');
        } else if (tool !== 'hand') {
            canvas.classList.add('tool-active');
        }
    },

    _updateCursor(e) {
        if (!this.cursorPreview) return;
        const tool = AppState.activeTool;
        let size = 2;
        if (tool === 'pen') {
            const cfg = ToolConfig.get(AppState.penType);
            size = cfg.size;
        } else if (tool === 'eraser') {
            size = ToolConfig.get('eraser').size;
        } else if (tool === 'blur') {
            size = ToolConfig.get('blur').size;
        } else {
            this.cursorPreview.classList.remove('visible');
            return;
        }

        this.cursorPreview.style.width = size + 'px';
        this.cursorPreview.style.height = size + 'px';
        this.cursorPreview.style.left = (e.clientX - size / 2) + 'px';
        this.cursorPreview.style.top = (e.clientY - size / 2) + 'px';
    },

    // Right-click context menu prevention
    preventContextMenu() {
        CanvasEngine.getCanvas().addEventListener('contextmenu', e => e.preventDefault());
    }
};

export { penTools, EraserTool, BlurTool, HandTool };
export default ToolManager;
