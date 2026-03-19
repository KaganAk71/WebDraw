// ──────────────────────────────────────────────────────────────────────
// ThemeManager  (js/theme.js)
// ──────────────────────────────────────────────────────────────────────

import AppState from './state.js';

const ThemeManager = {
    init() {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const saved = localStorage.getItem('wd-theme');
        AppState.theme = saved || (prefersDark ? 'dark' : 'light');

        this.apply(AppState.theme);

        AppState.subscribe('theme', (theme) => {
            this.apply(theme);
            localStorage.setItem('wd-theme', theme);
        });

        // Toggle button
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
            });
        }

        // System preference change
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('wd-theme')) {
                AppState.theme = e.matches ? 'dark' : 'light';
            }
        });
    },

    apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }
};

export default ThemeManager;
