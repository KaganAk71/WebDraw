// ──────────────────────────────────────────────────────────────────────
// UrlOverlay  (js/overlay.js)
// ──────────────────────────────────────────────────────────────────────

import AppState from './state.js';
import I18n from './i18n.js';

const UrlOverlay = {
    iframe: null,

    init() {
        this.iframe = document.getElementById('url-frame');

        AppState.subscribe('urlOverlayVisible', (visible) => {
            this.iframe.classList.toggle('visible', visible);
            if (!visible) {
                this.iframe.src = 'about:blank';
            }
        });

        AppState.subscribe('interactMode', (interacting) => {
            const canvas = document.getElementById('draw-canvas');
            const indicator = document.getElementById('mode-indicator');

            if (interacting) {
                canvas.classList.add('mode-interact');
                if (indicator) {
                    indicator.textContent = I18n.t('mode.interact');
                    indicator.classList.add('visible');
                }
            } else {
                canvas.classList.remove('mode-interact');
                if (indicator) {
                    indicator.textContent = I18n.t('mode.draw');
                    indicator.classList.add('visible');
                    setTimeout(() => indicator.classList.remove('visible'), 2000);
                }
            }
        });

        // URL input
        const urlInput = document.getElementById('url-input');
        const urlGoBtn = document.getElementById('url-go-btn');
        const urlCloseBtn = document.getElementById('url-close-btn');

        if (urlGoBtn) {
            urlGoBtn.addEventListener('click', () => this.loadUrl());
        }

        if (urlInput) {
            urlInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.loadUrl();
            });
        }

        if (urlCloseBtn) {
            urlCloseBtn.addEventListener('click', () => this.closeUrl());
        }
    },

    loadUrl() {
        const urlInput = document.getElementById('url-input');
        if (!urlInput) return;

        let url = urlInput.value.trim();
        if (!url) return;

        // Add https:// if missing
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }

        this.iframe.src = url;
        AppState.urlOverlaySrc = url;
        AppState.urlOverlayVisible = true;
        showToast(I18n.t('toast.urlLoaded'));
    },

    closeUrl() {
        AppState.urlOverlayVisible = false;
        AppState.urlOverlaySrc = '';
        AppState.interactMode = false;
        showToast(I18n.t('toast.urlClosed'));
    }
};

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

export { showToast };
export default UrlOverlay;
