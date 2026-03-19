// ──────────────────────────────────────────────────────────────────────
// UrlOverlay  (js/overlay.js)  — Google Translate-style URL bar + iframe
// ──────────────────────────────────────────────────────────────────────
import AppState from './state.js';
import I18n from './i18n.js';

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

const UrlOverlay = {
    iframe: null,
    urlInput: null,

    init() {
        this.iframe = document.getElementById('url-frame');
        this.urlInput = document.getElementById('url-input');

        // URL bar visibility
        AppState.subscribe('urlBarVisible', v => {
            document.getElementById('url-bar')?.classList.toggle('visible', v);
            if (!v) this._closeOverlay();
        });

        // Interact mode
        AppState.subscribe('interactMode', interacting => {
            const canvas = document.getElementById('draw-canvas');
            const ind = document.getElementById('mode-indicator');
            if (interacting) {
                canvas.classList.add('mode-interact');
                if (ind) { ind.textContent = I18n.t('mode.interact'); ind.classList.add('visible'); }
            } else {
                canvas.classList.remove('mode-interact');
                if (ind) {
                    ind.textContent = I18n.t('mode.draw');
                    ind.classList.add('visible');
                    setTimeout(() => ind.classList.remove('visible'), 2000);
                }
            }
        });

        // URL bar buttons
        document.getElementById('url-go-btn')?.addEventListener('click', () => this._loadUrl());
        document.getElementById('url-back-btn')?.addEventListener('click', () => {
            try { this.iframe.contentWindow.history.back(); } catch { }
        });
        document.getElementById('url-forward-btn')?.addEventListener('click', () => {
            try { this.iframe.contentWindow.history.forward(); } catch { }
        });
        document.getElementById('url-refresh-btn')?.addEventListener('click', () => {
            if (this.iframe.src && this.iframe.src !== 'about:blank') this.iframe.src = this.iframe.src;
        });
        document.getElementById('url-close-btn')?.addEventListener('click', () => {
            AppState.urlBarVisible = false;
        });

        this.urlInput?.addEventListener('keydown', e => {
            if (e.key === 'Enter') this._loadUrl();
        });

        // File input
        document.getElementById('file-input')?.addEventListener('change', e => this._handleFile(e));
        document.getElementById('open-file-btn')?.addEventListener('click', () => {
            document.getElementById('file-input')?.click();
        });

        // Drag and drop
        this._initDragDrop();
    },

    _loadUrl() {
        let url = this.urlInput?.value?.trim();
        if (!url) return;
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        this.iframe.src = url;
        AppState.urlOverlaySrc = url;
        AppState.urlOverlayVisible = true;
        this.iframe.classList.add('visible');
        showToast(I18n.t('toast.urlLoaded'));
    },

    _closeOverlay() {
        this.iframe.classList.remove('visible');
        this.iframe.src = 'about:blank';
        AppState.urlOverlayVisible = false;
        AppState.urlOverlaySrc = '';
        AppState.interactMode = false;
    },

    _handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = ev => {
                const img = new Image();
                img.onload = () => {
                    const ctx = CanvasEngine_getCtx();
                    if (ctx) ctx.drawImage(img, 0, 0);
                    showToast(I18n.t('toast.fileLoaded'));
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
            // Load PDF in iframe
            const url = URL.createObjectURL(file);
            this.iframe.src = url;
            this.iframe.classList.add('visible');
            AppState.urlOverlayVisible = true;
            showToast(I18n.t('toast.fileLoaded'));
        }
    },

    _initDragDrop() {
        const drop = document.getElementById('file-drop');
        document.addEventListener('dragenter', e => {
            e.preventDefault();
            drop?.classList.add('active');
        });
        document.addEventListener('dragover', e => {
            e.preventDefault();
        });
        document.addEventListener('dragleave', e => {
            if (e.relatedTarget === null) drop?.classList.remove('active');
        });
        document.addEventListener('drop', e => {
            e.preventDefault();
            drop?.classList.remove('active');
            const file = e.dataTransfer?.files?.[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = ev => {
                    const img = new Image();
                    img.onload = () => {
                        const ctx = CanvasEngine_getCtx();
                        if (ctx) ctx.drawImage(img, 0, 0);
                        showToast(I18n.t('toast.fileLoaded'));
                    };
                    img.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
};

// Lazy canvas context getter (avoids circular import at module eval time)
function CanvasEngine_getCtx() {
    const c = document.getElementById('draw-canvas');
    return c?.getContext('2d');
}

export { showToast };
export default UrlOverlay;
