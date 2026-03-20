// ──────────────────────────────────────────────────────────────────────
// SelectTool  (js/select.js) — Raster Selection & Manipulation
// ──────────────────────────────────────────────────────────────────────
import AppState from './state.js';
import CanvasEngine from './canvas.js';
import I18n from './i18n.js';

function getCoords(e) {
    return CanvasEngine.screenToCanvas(e.clientX, e.clientY);
}

const SelectTool = {
    previewCanvas: null, previewCtx: null,
    
    // Internal states
    mode: 'none', // 'selecting', 'moving', 'resizing-se', 'ready'
    startX: 0, startY: 0,
    
    // The floating selection object
    selDef: null, // { x, y, startW, startH, curW, curH, imgCanvas }

    init() {
        this.previewCanvas = document.createElement('canvas');
        this.previewCanvas.id = 'select-preview';
        this.previewCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:32;pointer-events:none';
        document.getElementById('canvas-container').appendChild(this.previewCanvas);
        this.previewCtx = this.previewCanvas.getContext('2d');
        
        window.addEventListener('resize', () => this._resizePreview());
        this._resizePreview();

        const canvas = CanvasEngine.getCanvas();
        canvas.addEventListener('pointerdown', e => this.onPointerDown(e));
        window.addEventListener('pointermove', e => this.onPointerMove(e)); // Window to catch drags
        window.addEventListener('pointerup', e => this.onPointerUp(e));

        // Listen for view changes to re-render preview
        AppState.subscribe('viewX', () => this.render());
        AppState.subscribe('viewY', () => this.render());
        AppState.subscribe('viewScale', () => this.render());

        // Commit selection if tool changes
        AppState.subscribe('activeTool', (t) => {
            if (t !== 'select') this.commit();
        });
        
        // Handle delete key
        document.addEventListener('keydown', e => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (AppState.activeTool === 'select' && this.selDef) {
                    this.selDef = null; // delete selection
                    this.mode = 'none';
                    this.render();
                    CanvasEngine.commitState(); // commits the clearance
                }
            }
        });
    },

    _resizePreview() {
        const dpr = window.devicePixelRatio || 1;
        this.previewCanvas.width = window.innerWidth * dpr;
        this.previewCanvas.height = window.innerHeight * dpr;
        this.previewCanvas.style.width = window.innerWidth + 'px';
        this.previewCanvas.style.height = window.innerHeight + 'px';
        this.render();
    },

    onPointerDown(e) {
        if (AppState.activeTool !== 'select' || e.button !== 0) return;
        
        const p = getCoords(e);
        
        // Check if interacting with existing selection
        if (this.selDef) {
            const hit = this._getHitTarget(p.x, p.y);
            if (hit === 'se') {
                this.mode = 'resizing-se';
                this.startX = p.x; this.startY = p.y;
                return;
            } else if (hit === 'inside') {
                this.mode = 'moving';
                this.startX = p.x; this.startY = p.y;
                return;
            } else {
                // Clicked outside -> commit
                this.commit();
            }
        }

        // Start new selection
        this.mode = 'selecting';
        this.startX = p.x;
        this.startY = p.y;
        this.selDef = { x: p.x, y: p.y, curW: 0, curH: 0 };
    },

    onPointerMove(e) {
        if (AppState.activeTool !== 'select') return;
        
        const p = getCoords(e);
        const canvas = CanvasEngine.getCanvas();
        
        // Update cursor logic
        if (this.selDef && this.mode === 'none') {
            const hit = this._getHitTarget(p.x, p.y);
            if (hit === 'se') canvas.style.cursor = 'nwse-resize';
            else if (hit === 'inside') canvas.style.cursor = 'move';
            else canvas.style.cursor = 'crosshair';
        } else if (this.mode === 'none') {
            canvas.style.cursor = 'crosshair';
        }
        
        if (this.mode === 'selecting') {
            this.selDef.curW = p.x - this.startX;
            this.selDef.curH = p.y - this.startY;
            this.render();
        } 
        else if (this.mode === 'moving') {
            const dx = p.x - this.startX;
            const dy = p.y - this.startY;
            this.selDef.x += dx;
            this.selDef.y += dy;
            this.startX = p.x; this.startY = p.y;
            this.render();
        }
        else if (this.mode === 'resizing-se') {
            const dx = p.x - this.startX;
            const dy = p.y - this.startY;
            this.selDef.curW += dx;
            this.selDef.curH += dy;
            this.startX = p.x; this.startY = p.y;
            this.render();
        }
    },

    onPointerUp(e) {
        if (AppState.activeTool !== 'select') return;

        if (this.mode === 'selecting') {
            // Finalize box
            let { x, y, curW, curH } = this.selDef;
            if (curW < 0) { x += curW; curW = Math.abs(curW); }
            if (curH < 0) { y += curH; curH = Math.abs(curH); }
            
            if (curW < 5 || curH < 5) {
                this.selDef = null; // too small, abort
            } else {
                CanvasEngine.saveState();
                
                // Extract pixels
                const imgCanvas = document.createElement('canvas');
                imgCanvas.width = curW; imgCanvas.height = curH;
                const iCtx = imgCanvas.getContext('2d');
                
                const minCx = Math.floor(x / CanvasEngine.getChunkSize());
                const maxCx = Math.floor((x + curW) / CanvasEngine.getChunkSize());
                const minCy = Math.floor(y / CanvasEngine.getChunkSize());
                const maxCy = Math.floor((y + curH) / CanvasEngine.getChunkSize());
                
                for(let cx = minCx; cx <= maxCx; cx++) {
                    for(let cy = minCy; cy <= maxCy; cy++) {
                       const key = `${cx},${cy}`;
                       if (CanvasEngine.chunks.has(key)) {
                           iCtx.drawImage(CanvasEngine.chunks.get(key), cx * CanvasEngine.getChunkSize() - x, cy * CanvasEngine.getChunkSize() - y);
                       }
                    }
                }
                
                // Clear original area
                CanvasEngine.executeOnChunks({minX:x, minY:y, maxX:x+curW, maxY:y+curH}, (ctx) => {
                    ctx.clearRect(x, y, curW, curH);
                });
                
                this.selDef = { x, y, startW: curW, startH: curH, curW, curH, imgCanvas };
            }
            this.mode = 'ready';
            this.render();
        } else if (this.mode === 'moving' || this.mode === 'resizing-se') {
            this.mode = 'ready';
        }
    },

    commit() {
        if (this.selDef && this.selDef.imgCanvas) {
            CanvasEngine.executeOnChunks({
                minX: this.selDef.x, minY: this.selDef.y, 
                maxX: this.selDef.x + this.selDef.curW, maxY: this.selDef.y + this.selDef.curH
            }, (ctx) => {
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(this.selDef.imgCanvas, this.selDef.x, this.selDef.y, this.selDef.curW, this.selDef.curH);
            });
            CanvasEngine.commitState();
        }
        this.selDef = null;
        this.mode = 'none';
        this.render();
    },

    _getHitTarget(px, py) {
        if (!this.selDef) return 'none';
        const { x, y, curW, curH } = this.selDef;
        // SE Handle
        const rx = x + curW;
        const ry = y + curH;
        const s = 10 / AppState.viewScale; // handle size
        if (px >= rx - s && px <= rx + s && py >= ry - s && py <= ry + s) return 'se';
        if (px >= x && px <= x + curW && py >= y && py <= y + curH) return 'inside';
        return 'none';
    },

    render() {
        const dpr = window.devicePixelRatio || 1;
        this.previewCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        if (!this.selDef || AppState.activeTool !== 'select') return;
        
        this.previewCtx.save();
        this.previewCtx.scale(dpr * AppState.viewScale, dpr * AppState.viewScale);
        this.previewCtx.translate(-AppState.viewX, -AppState.viewY);

        let { x, y, curW, curH, imgCanvas } = this.selDef;
        
        // If selecting, Box could be inverted, normalize for drawing
        if (this.mode === 'selecting') {
            let dx = x, dy = y, dw = curW, dh = curH;
            if (dw < 0) { dx += dw; dw = Math.abs(dw); }
            if (dh < 0) { dy += dh; dh = Math.abs(dh); }
            
            this.previewCtx.setLineDash([5 / AppState.viewScale, 5 / AppState.viewScale]);
            this.previewCtx.strokeStyle = '#007aff';
            this.previewCtx.lineWidth = 1 / AppState.viewScale;
            this.previewCtx.strokeRect(dx, dy, dw, dh);
            this.previewCtx.fillStyle = 'rgba(0,122,255,0.1)';
            this.previewCtx.fillRect(dx, dy, dw, dh);
        } else {
            // Draw image
            if (imgCanvas) {
                this.previewCtx.drawImage(imgCanvas, x, y, curW, curH);
            }
            
            // Draw outline & handles
            this.previewCtx.setLineDash([]);
            this.previewCtx.strokeStyle = '#007aff';
            this.previewCtx.lineWidth = 1 / AppState.viewScale;
            this.previewCtx.strokeRect(x, y, curW, curH);
            
            const s = 4 / AppState.viewScale;
            this.previewCtx.fillStyle = '#fff';
            this.previewCtx.fillRect(x + curW - s, y + curH - s, s*2, s*2);
            this.previewCtx.strokeRect(x + curW - s, y + curH - s, s*2, s*2);
        }

        this.previewCtx.restore();
    }
};

export default SelectTool;
