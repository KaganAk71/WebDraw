// ──────────────────────────────────────────────────────────────────────
// ToolManager + Tool Strategies  (js/tools.js)
// ──────────────────────────────────────────────────────────────────────

import AppState from './state.js';
import CanvasEngine from './canvas.js';

// ── Tool Strategies ──

const PenTool = {
    name: 'pen',
    drawing: false,
    lastX: 0,
    lastY: 0,

    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    },

    onPointerMove(e) {
        if (!this.drawing) return;
        const ctx = CanvasEngine.getContext();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.strokeStyle = AppState.strokeColor;
        ctx.lineWidth = AppState.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    },

    onPointerUp() {
        this.drawing = false;
    }
};

const TransparentPenTool = {
    name: 'transparentPen',
    drawing: false,
    lastX: 0,
    lastY: 0,

    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    },

    onPointerMove(e) {
        if (!this.drawing) return;
        const ctx = CanvasEngine.getContext();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = AppState.opacity / 100;
        ctx.strokeStyle = AppState.strokeColor;
        ctx.lineWidth = AppState.strokeWidth * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        ctx.globalAlpha = 1;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    },

    onPointerUp() {
        this.drawing = false;
        const ctx = CanvasEngine.getContext();
        ctx.globalAlpha = 1;
    }
};

const EraserTool = {
    name: 'eraser',
    drawing: false,
    lastX: 0,
    lastY: 0,

    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    },

    onPointerMove(e) {
        if (!this.drawing) return;
        const ctx = CanvasEngine.getContext();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1;
        ctx.lineWidth = AppState.strokeWidth * 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        ctx.globalCompositeOperation = 'source-over';
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    },

    onPointerUp() {
        this.drawing = false;
        const ctx = CanvasEngine.getContext();
        ctx.globalCompositeOperation = 'source-over';
    }
};

const BlurTool = {
    name: 'blur',
    drawing: false,
    lastX: 0,
    lastY: 0,

    onPointerDown(e) {
        CanvasEngine.saveState();
        this.drawing = true;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    },

    onPointerMove(e) {
        if (!this.drawing) return;
        const ctx = CanvasEngine.getContext();
        const canvas = CanvasEngine.getCanvas();
        const size = AppState.strokeWidth * 4;
        const x = e.offsetX - size / 2;
        const y = e.offsetY - size / 2;
        const dpr = window.devicePixelRatio || 1;

        // Read the area, draw it blurred
        try {
            ctx.save();
            ctx.filter = `blur(${3}px)`;
            ctx.drawImage(
                canvas,
                x * dpr, y * dpr, size * dpr, size * dpr,
                x, y, size, size
            );
            ctx.restore();
        } catch (err) {
            // Fallback: just skip if filter not supported
        }

        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    },

    onPointerUp() {
        this.drawing = false;
    }
};

// ── Tool Manager ──

const tools = {
    pen: PenTool,
    transparentPen: TransparentPenTool,
    eraser: EraserTool,
    blur: BlurTool,
};

const ToolManager = {
    activeTool: null,
    cursorPreview: null,

    init() {
        this.activeTool = tools[AppState.tool] || tools.pen;
        this.cursorPreview = document.getElementById('cursor-preview');

        const canvas = CanvasEngine.getCanvas();

        canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e));
        canvas.addEventListener('pointerleave', (e) => this.handlePointerUp(e));

        // Cursor preview tracking
        canvas.addEventListener('pointermove', (e) => this.updateCursorPreview(e));
        canvas.addEventListener('pointerenter', () => {
            if (this.cursorPreview) this.cursorPreview.classList.add('visible');
        });
        canvas.addEventListener('pointerleave', () => {
            if (this.cursorPreview) this.cursorPreview.classList.remove('visible');
        });

        // Tool switching
        AppState.subscribe('tool', (toolName) => {
            this.activeTool = tools[toolName] || tools.pen;
            this.updateToolButtons();
        });

        // Bind tool buttons
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                const toolName = btn.dataset.tool;
                if (toolName === 'settings') {
                    AppState.settingsOpen = !AppState.settingsOpen;
                } else if (toolName === 'urlOverlay') {
                    AppState.settingsOpen = true;
                    // Will scroll to URL section
                } else if (toolName === 'interact') {
                    AppState.interactMode = !AppState.interactMode;
                } else {
                    AppState.tool = toolName;
                }
            });
        });

        this.updateToolButtons();
    },

    handlePointerDown(e) {
        if (AppState.interactMode) return;
        e.preventDefault();
        this.activeTool?.onPointerDown(e);
    },

    handlePointerMove(e) {
        if (AppState.interactMode) return;
        this.activeTool?.onPointerMove(e);
    },

    handlePointerUp(e) {
        if (AppState.interactMode) return;
        this.activeTool?.onPointerUp(e);
    },

    updateCursorPreview(e) {
        if (!this.cursorPreview) return;
        let size = AppState.strokeWidth;
        const tool = AppState.tool;

        if (tool === 'eraser') size *= 3;
        else if (tool === 'blur') size *= 4;
        else if (tool === 'transparentPen') size *= 2;

        this.cursorPreview.style.width = size + 'px';
        this.cursorPreview.style.height = size + 'px';
        this.cursorPreview.style.left = (e.clientX - size / 2) + 'px';
        this.cursorPreview.style.top = (e.clientY - size / 2) + 'px';
    },

    updateToolButtons() {
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === AppState.tool);
        });
    }
};

export default ToolManager;
