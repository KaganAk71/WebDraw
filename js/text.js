// ──────────────────────────────────────────────────────────────────────
// TextTool  (js/text.js)
// Click to place text, type, then commit to canvas
// ──────────────────────────────────────────────────────────────────────
import AppState, { ToolConfig } from './state.js';
import CanvasEngine from './canvas.js';

const TextTool = {
    overlay: null,
    textarea: null,
    currentX: 0,
    currentY: 0,

    init() {
        this.overlay = document.getElementById('text-overlay');
        this.textarea = this.overlay?.querySelector('textarea');

        const canvas = CanvasEngine.getCanvas();
        canvas.addEventListener('pointerdown', e => this._onCanvasClick(e));

        // Commit on blur or Enter
        if (this.textarea) {
            this.textarea.addEventListener('blur', () => this._commit());
            this.textarea.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this._commit();
                }
                // Escape to cancel
                if (e.key === 'Escape') {
                    this.textarea.value = '';
                    this._hide();
                }
            });
        }
    },

    _onCanvasClick(e) {
        if (AppState.activeTool !== 'text' || e.button !== 0) return;
        e.preventDefault();

        // If already editing, commit first
        if (this.overlay?.classList.contains('active')) {
            this._commit();
            return;
        }

        const cfg = ToolConfig.get('text');
        const p = CanvasEngine.screenToCanvas(e.clientX, e.clientY);
        this.currentX = p.x;
        this.currentY = p.y;

        // Position overlay
        this.overlay.style.left = e.clientX + 'px';
        this.overlay.style.top = e.clientY + 'px';
        this.overlay.classList.add('active');

        // Style textarea
        this.textarea.style.fontFamily = cfg.fontFamily;
        this.textarea.style.fontSize = cfg.fontSize + 'px';
        this.textarea.style.color = cfg.color;
        this.textarea.style.fontWeight = cfg.bold ? '700' : '400';
        this.textarea.style.fontStyle = cfg.italic ? 'italic' : 'normal';
        this.textarea.value = '';
        this.textarea.focus();
    },

    _commit() {
        const text = this.textarea?.value?.trim();
        if (!text) { this._hide(); return; }

        CanvasEngine.saveState();
        const cfg = ToolConfig.get('text');
        const ctx = CanvasEngine.getContext();

        ctx.save();
        ctx.font = `${cfg.italic ? 'italic ' : ''}${cfg.bold ? '700' : '400'} ${cfg.fontSize}px ${cfg.fontFamily}`;
        ctx.fillStyle = cfg.color;
        ctx.textBaseline = 'top';

        // Multi-line support
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            ctx.fillText(line, this.currentX, this.currentY + i * (cfg.fontSize * 1.4));
        });
        ctx.restore();
        this._hide();
    },

    _hide() {
        this.overlay?.classList.remove('active');
        if (this.textarea) this.textarea.value = '';
    }
};

export default TextTool;
