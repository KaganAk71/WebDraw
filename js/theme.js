// ──────────────────────────────────────────────────────────────────────
// ThemeManager  (js/theme.js)
// ──────────────────────────────────────────────────────────────────────
import AppState from './state.js';

const ThemeManager = {
    init() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const saved = localStorage.getItem('wd-theme');
        AppState.theme = saved || (prefersDark ? 'dark' : 'light');
        this.apply(AppState.theme);

        AppState.subscribe('theme', t => { this.apply(t); localStorage.setItem('wd-theme', t); });

        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('wd-theme')) AppState.theme = e.matches ? 'dark' : 'light';
        });
    },
    apply(t) { document.documentElement.setAttribute('data-theme', t); }
};

export default ThemeManager;
