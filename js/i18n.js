// ──────────────────────────────────────────────────────────────────────
// I18n  (js/i18n.js)
// ──────────────────────────────────────────────────────────────────────
import AppState from './state.js';

const cache = {};

const I18n = {
    strings: {},

    async init() {
        const saved = localStorage.getItem('wd-lang') || 'en';
        AppState.lang = saved;
        await this.load(AppState.lang);
        this.apply();

        AppState.subscribe('lang', async lang => {
            await this.load(lang);
            this.apply();
            localStorage.setItem('wd-lang', lang);
        });

        document.querySelectorAll('[data-lang-btn]').forEach(btn => {
            btn.addEventListener('click', () => { AppState.lang = btn.dataset.langBtn; });
        });
    },

    async load(lang) {
        if (cache[lang]) { this.strings = cache[lang]; return; }
        try {
            const r = await fetch(`lang/${lang}.json`);
            this.strings = await r.json();
            cache[lang] = this.strings;
        } catch (e) { console.warn('i18n load fail', lang, e); }
    },

    apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const v = this.resolve(el.dataset.i18n);
            if (v) el.textContent = v;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const v = this.resolve(el.dataset.i18nPlaceholder);
            if (v) el.placeholder = v;
        });
        document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
            const v = this.resolve(el.dataset.i18nTooltip);
            if (v) el.setAttribute('data-tooltip', v);
        });
        document.querySelectorAll('[data-lang-btn]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.langBtn === AppState.lang);
        });
    },

    resolve(path) {
        return path.split('.').reduce((o, k) => o?.[k], this.strings);
    },

    t(path) {
        return this.resolve(path) || path;
    }
};

export default I18n;
