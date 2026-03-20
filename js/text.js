// ──────────────────────────────────────────────────────────────────────
// TextTool  (js/text.js) — updated for chunks
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

        if (this.textarea) {
            this.textarea.addEventListener('blur', () => this._commit());
            this.textarea.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this._commit();
                }
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

        if (this.overlay?.classList.contains('active')) {
            this._commit();
            return;
        }

        const cfg = ToolConfig.get('text');
        const p = CanvasEngine.screenToCanvas(e.clientX, e.clientY);
        this.currentX = p.x;
        this.currentY = p.y;

        this.overlay.style.left = e.clientX + 'px';
        this.overlay.style.top = e.clientY + 'px';
        this.overlay.classList.add('active');

        this.textarea.style.fontFamily = cfg.fontFamily;
        // visual scaling
        this.textarea.style.fontSize = (cfg.fontSize * AppState.viewScale) + 'px';
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
        
        // Approx text bounds logic
        const boundsSize = 800; // conservative bound size
        const bounds = {
            minX: this.currentX, minY: this.currentY,
            maxX: this.currentX + boundsSize, maxY: this.currentY + boundsSize/2
        };

        CanvasEngine.executeOnChunks(bounds, (ctx) => {
            ctx.font = `${cfg.italic ? 'italic ' : ''}${cfg.bold ? '700' : '400'} ${cfg.fontSize}px ${cfg.fontFamily}`;
            ctx.fillStyle = cfg.color;
            ctx.textBaseline = 'top';

            const lines = text.split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, this.currentX, this.currentY + i * (cfg.fontSize * 1.4));
            });
        });

        CanvasEngine.commitState();
        this._hide();
    },

    _hide() {
        this.overlay?.classList.remove('active');
        if (this.textarea) this.textarea.value = '';
    }
};

export default TextTool;
