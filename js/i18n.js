// ──────────────────────────────────────────────────────────────────────
// I18n — Internationalisation  (js/i18n.js)
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

        AppState.subscribe('lang', async (lang) => {
            await this.load(lang);
            this.apply();
            localStorage.setItem('wd-lang', lang);
        });

        // Lang buttons
        document.querySelectorAll('[data-lang-btn]').forEach(btn => {
            btn.addEventListener('click', () => {
                AppState.lang = btn.dataset.langBtn;
            });
        });
    },

    async load(lang) {
        if (cache[lang]) {
            this.strings = cache[lang];
            return;
        }
        try {
            const res = await fetch(`lang/${lang}.json`);
            this.strings = await res.json();
            cache[lang] = this.strings;
        } catch (e) {
            console.warn(`Failed to load language: ${lang}`, e);
        }
    },

    apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const val = this.resolve(key);
            if (val) el.textContent = val;
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            const val = this.resolve(key);
            if (val) el.placeholder = val;
        });

        document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
            const key = el.dataset.i18nTooltip;
            const val = this.resolve(key);
            if (val) el.setAttribute('data-tooltip', val);
        });

        // Update lang button active state
        document.querySelectorAll('[data-lang-btn]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.langBtn === AppState.lang);
        });
    },

    resolve(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.strings);
    },

    t(path) {
        return this.resolve(path) || path;
    }
};

export default I18n;
