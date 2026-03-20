// ──────────────────────────────────────────────────────────────────────
// ToolManager + Pen Strategies  (js/tools.js)  — updated for chunks
// ──────────────────────────────────────────────────────────────────────
import AppState, { ToolConfig } from './state.js';
import CanvasEngine from './canvas.js';

function getCoords(e) {
    return CanvasEngine.screenToCanvas(e.clientX, e.clientY);
}

function getBounds(x1, y1, x2, y2, padding) {
    return {
        minX: Math.min(x1, x2) - padding,
        minY: Math.min(y1, y2) - padding,
        maxX: Math.max(x1, x2) + padding,
        maxY: Math.max(y1, y2) + padding
    };
}

const HandTool = {
    onPointerDown(e) { CanvasEngine.startPan(e); },
    onPointerMove() { },
    onPointerUp() { }
};

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
        const p = getCoords(e);
        
        CanvasEngine.executeOnChunks(getBounds(this.lx, this.ly, p.x, p.y, cfg.size), (ctx) => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = cfg.opacity / 100;
            ctx.strokeStyle = cfg.color;
            ctx.lineWidth = cfg.size;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(this.lx, this.ly); ctx.lineTo(p.x, p.y); ctx.stroke();
        });
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { if (this.drawing) { CanvasEngine.commitState(); this.drawing = false; } }
};

const FountainTool = {
    drawing: false, pts: [],
    brushAngle: -Math.PI / 4, // 45 degrees
    lastTime: 0,

    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        const p = getCoords(e);
        this.pts = [{ x: p.x, y: p.y, velocity: 0 }];
        this.lastTime = performance.now();
    },

    onPointerMove(e) {
        if (!this.drawing) return;
        const p = getCoords(e);
        const t = performance.now();
        const dt = Math.max(1, t - this.lastTime);
        this.lastTime = t;

        const lastP = this.pts[this.pts.length - 1];
        const dist = Math.hypot(p.x - lastP.x, p.y - lastP.y);
        if (dist < 0.5) return;

        // velocity: pixels per millisecond
        const velocity = dist / dt;
        this.pts.push({ x: p.x, y: p.y, velocity });

        if (this.pts.length >= 3) {
            const p0 = this.pts[this.pts.length - 3];
            const p1 = this.pts[this.pts.length - 2];
            const p2 = this.pts[this.pts.length - 1];

            // Quadratic curve midpoints
            const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
            const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            
            const cfg = ToolConfig.get('fountain');
            const baseWidth = Math.max(2, cfg.size * 2);

            const bounds = getBounds(mid1.x, mid1.y, mid2.x, mid2.y, baseWidth * 2);
            bounds.minX = Math.min(bounds.minX, p1.x); bounds.maxX = Math.max(bounds.maxX, p1.x);
            bounds.minY = Math.min(bounds.minY, p1.y); bounds.maxY = Math.max(bounds.maxY, p1.y);

            CanvasEngine.executeOnChunks(bounds, (ctx) => {
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = cfg.color;

                const flatnessFactor = 0.25; // Chisel tip height ratio
                const v1 = p0.velocity;
                const v2 = p2.velocity;
                
                // Stamp distance ~0.5px for smooth continuous line
                const steps = Math.max(5, Math.ceil(dist * 2)); 

                for (let i = 0; i <= steps; i++) {
                    const tVal = i / steps;
                    const u = 1 - tVal;

                    let sx = u * u * mid1.x + 2 * u * tVal * p1.x + tVal * tVal * mid2.x;
                    let sy = u * u * mid1.y + 2 * u * tVal * p1.y + tVal * tVal * mid2.y;

                    const interpV = u * v1 + tVal * v2;
                    // Pressure (clamp 1/velocity mapping):
                    let pressure = Math.min(1.8, Math.max(0.3, 0.4 / (interpV + 0.1)));

                    // Initial pooling / blob
                    let flow = 1.0;
                    if (this.pts.length < 8) flow = 1.0 + (8 - this.pts.length) * 0.15;

                    const w = baseWidth * pressure * flow;
                    const h = w * flatnessFactor;

                    // Paper jitter
                    sx += (Math.random() - 0.5) * 0.3;
                    sy += (Math.random() - 0.5) * 0.3;

                    ctx.save();
                    ctx.translate(sx, sy);
                    ctx.rotate(this.brushAngle);

                    const baseAlpha = cfg.opacity / 100;
                    
                    // Outer feather
                    ctx.globalAlpha = baseAlpha * (0.6 + Math.random() * 0.2);
                    ctx.fillRect(-w/2 * 1.15, -h/2 * 1.15, w * 1.15, h * 1.15);
                    
                    // Inner core
                    ctx.globalAlpha = baseAlpha;
                    ctx.fillRect(-w/2, -h/2, w, h);
                    
                    ctx.restore();
                }
            });
        }
    },
    
    onPointerUp() { if (this.drawing) { CanvasEngine.commitState(); this.drawing = false; this.pts = []; } }
};

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
        const p = getCoords(e);
        
        CanvasEngine.executeOnChunks(getBounds(this.lx, this.ly, p.x, p.y, cfg.size + 1), (ctx) => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = (cfg.opacity / 100) * (0.6 + Math.random() * 0.4);
            ctx.strokeStyle = cfg.color;
            ctx.lineWidth = cfg.size + Math.random() * 0.5;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(this.lx, this.ly); ctx.lineTo(p.x, p.y); ctx.stroke();
            if (Math.random() > 0.5) {
                ctx.fillStyle = cfg.color;
                ctx.globalAlpha = (cfg.opacity / 100) * 0.3;
                ctx.fillRect(p.x + (Math.random() - 0.5) * cfg.size, p.y + (Math.random() - 0.5) * cfg.size, 1, 1);
            }
        });
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { if (this.drawing) { CanvasEngine.commitState(); this.drawing = false; } }
};

const MarkerTool = {
    drawing: false, pts: [],
    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        this.pts = [getCoords(e)];
    },
    onPointerMove(e) {
        if (!this.drawing) return;
        const cfg = ToolConfig.get('marker');
        const p = getCoords(e);
        this.pts.push(p);

        CanvasEngine.restoreToActiveCommand(); // wipes intermediate overlapping dashes
        
        let minX = this.pts[0].x, minY = this.pts[0].y, maxX = minX, maxY = minY;
        for (const pt of this.pts) {
            if (pt.x < minX) minX = pt.x;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.y > maxY) maxY = pt.y;
        }
        
        CanvasEngine.executeOnChunks(getBounds(minX, minY, maxX, maxY, cfg.size), (ctx) => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = cfg.opacity / 100;
            ctx.strokeStyle = cfg.color;
            ctx.lineWidth = cfg.size;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); 
            ctx.moveTo(this.pts[0].x, this.pts[0].y);
            for(let i=1; i<this.pts.length; i++) {
                ctx.lineTo(this.pts[i].x, this.pts[i].y);
            }
            ctx.stroke();
        });
    },
    onPointerUp() { if (this.drawing) { CanvasEngine.commitState(); this.drawing = false; this.pts = []; } }
};

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
        const p = getCoords(e);
        
        const offsets = Array.from({length:3}, () => [
            (Math.random() - 0.5) * cfg.size * 0.3, 
            (Math.random() - 0.5) * cfg.size * 0.3,
            cfg.size * (0.7 + Math.random() * 0.6),
            (cfg.opacity / 100) * (0.3 + Math.random() * 0.3)
        ]);
        
        CanvasEngine.executeOnChunks(getBounds(this.lx, this.ly, p.x, p.y, cfg.size), (ctx) => {
            ctx.globalCompositeOperation = 'source-over';
            for (let i = 0; i < 3; i++) {
                const [jx, jy, w, a] = offsets[i];
                ctx.globalAlpha = a;
                ctx.strokeStyle = cfg.color;
                ctx.lineWidth = w;
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(this.lx + jx, this.ly + jy);
                ctx.lineTo(p.x + jx, p.y + jy);
                ctx.stroke();
            }
        });
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { if (this.drawing) { CanvasEngine.commitState(); this.drawing = false; } }
};

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
        const p = getCoords(e);
        
        const dist = Math.hypot(p.x - this.lx, p.y - this.ly);
        const steps = Math.max(1, Math.floor(dist));
        const dots = [];
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const cx = this.lx + (p.x - this.lx) * t;
            const cy = this.ly + (p.y - this.ly) * t;
            for (let j = 0; j < 4; j++) {
                dots.push([
                    cx + (Math.random() - 0.5) * cfg.size,
                    cy + (Math.random() - 0.5) * cfg.size,
                    (cfg.opacity / 100) * (0.3 + Math.random() * 0.5),
                    1 + Math.random(), 1 + Math.random()
                ]);
            }
        }
        
        CanvasEngine.executeOnChunks(getBounds(this.lx, this.ly, p.x, p.y, cfg.size), (ctx) => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = cfg.color;
            for(const [rx, ry, alpha, w, h] of dots) {
                ctx.globalAlpha = alpha;
                ctx.fillRect(rx, ry, w, h);
            }
        });
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { if (this.drawing) { CanvasEngine.commitState(); this.drawing = false; } }
};

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
        const p = getCoords(e);
        
        CanvasEngine.executeOnChunks(getBounds(this.lx, this.ly, p.x, p.y, cfg.size), (ctx) => {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.globalAlpha = 1;
            ctx.lineWidth = cfg.size;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(this.lx, this.ly); ctx.lineTo(p.x, p.y); ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
        });
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { if (this.drawing) { CanvasEngine.commitState(); this.drawing = false; } }
};

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
        const p = getCoords(e);
        const size = cfg.size;
        const strength = cfg.strength || 3;
        
        const bounds = { minX: p.x - size/2, minY: p.y - size/2, maxX: p.x + size/2, maxY: p.y + size/2 };
        
        CanvasEngine.executeOnChunks(bounds, (ctx, chunk, cx, cy) => {
            const dpr = window.devicePixelRatio || 1;
            const lx = (bounds.minX - cx * CanvasEngine.getChunkSize()) * dpr;
            const ly = (bounds.minY - cy * CanvasEngine.getChunkSize()) * dpr;
            const sw = size * dpr;
            const sh = size * dpr;
            
            const sx = Math.max(0, Math.floor(lx));
            const sy = Math.max(0, Math.floor(ly));
            const ew = Math.min(chunk.width - sx, Math.ceil(sw - (sx - lx)));
            const eh = Math.min(chunk.height - sy, Math.ceil(sh - (sy - ly)));
            
            if (ew <= 0 || eh <= 0) return;
            
            try {
                const tmp = document.createElement('canvas');
                tmp.width = ew; tmp.height = eh;
                const tc = tmp.getContext('2d');
                tc.drawImage(chunk, sx, sy, ew, eh, 0, 0, ew, eh);
                
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(sx, sy, ew, eh);
                ctx.filter = `blur(${strength}px)`;
                ctx.drawImage(tmp, 0, 0, ew, eh, sx, sy, ew, eh);
                ctx.filter = 'none';
                ctx.restore();
            } catch { }
        });
        this.lx = p.x; this.ly = p.y;
    },
    onPointerUp() { if (this.drawing) { CanvasEngine.commitState(); this.drawing = false; } }
};

const penTools = {
    ballpoint: BallpointTool,
    fountain: FountainTool,
    pencil: PencilTool,
    marker: MarkerTool,
    watercolor: WatercolorTool,
    crayon: CrayonTool,
};

const ToolManager = {
    cursorPreview: null,

    init() {
        this.cursorPreview = document.getElementById('cursor-preview');
        const canvas = CanvasEngine.getCanvas();

        canvas.addEventListener('pointerdown', e => this._onDown(e));
        canvas.addEventListener('pointermove', e => this._onMove(e));
        canvas.addEventListener('pointerup', e => this._onUp(e));
        canvas.addEventListener('pointerleave', e => this._onUp(e));

        canvas.addEventListener('pointermove', e => this._updateCursor(e));
        canvas.addEventListener('pointerenter', () => this.cursorPreview?.classList.add('visible'));
        canvas.addEventListener('pointerleave', () => this.cursorPreview?.classList.remove('visible'));

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
        return null;
    },

    _onDown(e) {
        if (e.button === 1) return;
        if (AppState.interactMode) return;
        
        if (e.button === 2) {
            e.preventDefault();
            const rc = AppState.rightClickTool;
            if (rc === 'eraser') { EraserTool.onPointerDown(e); this._rightClickActive = EraserTool; }
            else if (rc === 'pan') { CanvasEngine.startPan(e); this._rightClickActive = 'pan'; }
            return;
        }

        if (AppState.toolPopupOpen) AppState.toolPopupOpen = null;

        const tool = this._getActiveTool();
        if (tool) { e.preventDefault(); tool.onPointerDown(e); }
    },

    _onMove(e) {
        if (AppState.interactMode) return;
        if (this._rightClickActive) {
            if (this._rightClickActive === 'pan') return;
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
        if (tool && tool.onPointerUp) tool.onPointerUp(e);
    },

    _onToolBtnClick(toolName) {
        if (toolName === 'settings') {
            AppState.settingsOpen = !AppState.settingsOpen;
            AppState.toolPopupOpen = null;
            return;
        }
        if (toolName === 'interact') { AppState.interactMode = !AppState.interactMode; return; }
        if (toolName === 'urlOverlay') {
            AppState.urlBarVisible = !AppState.urlBarVisible;
            AppState.toolPopupOpen = null;
            return;
        }

        const popupTools = ['pen', 'eraser', 'blur', 'text', 'shape'];
        if (popupTools.includes(toolName)) {
            if (AppState.activeTool === toolName) AppState.toolPopupOpen = AppState.toolPopupOpen === toolName ? null : toolName;
            else { AppState.activeTool = toolName; AppState.toolPopupOpen = toolName; }
        } else {
            AppState.activeTool = toolName;
            AppState.toolPopupOpen = null;
        }
    },

    _updateUI() {
        const tool = AppState.activeTool;
        const canvas = CanvasEngine.getCanvas();
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
        canvas.classList.remove('tool-active', 'tool-text');
        if (tool === 'hand') canvas.style.cursor = 'grab';
        else if (tool === 'text') canvas.classList.add('tool-text');
        else if (tool !== 'hand') canvas.classList.add('tool-active');
    },

    _updateCursor(e) {
        if (!this.cursorPreview) return;
        const tool = AppState.activeTool;
        let size = 2;
        if (tool === 'pen') size = ToolConfig.get(AppState.penType).size;
        else if (tool === 'eraser') size = ToolConfig.get('eraser').size;
        else if (tool === 'blur') size = ToolConfig.get('blur').size;
        else { this.cursorPreview.classList.remove('visible'); return; }

        // Scale the cursor based on zoom!
        const dpr = window.devicePixelRatio || 1;
        const scaledSize = size * AppState.viewScale;
        
        this.cursorPreview.style.width = scaledSize + 'px';
        this.cursorPreview.style.height = scaledSize + 'px';
        this.cursorPreview.style.left = (e.clientX - scaledSize / 2) + 'px';
        this.cursorPreview.style.top = (e.clientY - scaledSize / 2) + 'px';
    },

    preventContextMenu() {
        CanvasEngine.getCanvas().addEventListener('contextmenu', e => e.preventDefault());
    }
};

export { penTools, EraserTool, BlurTool, HandTool };
export default ToolManager;
