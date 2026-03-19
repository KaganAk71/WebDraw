// ──────────────────────────────────────────────────────────────────────
// SettingsPanel  (js/settings.js)  — sidebar pos, pro/simple, bg, etc.
// ──────────────────────────────────────────────────────────────────────
import AppState, { ToolConfig } from './state.js';
import I18n from './i18n.js';

const SettingsPanel = {
    init() {
        const panel = document.getElementById('settings-panel');

        AppState.subscribe('settingsOpen', open => panel?.classList.toggle('open', open));
        document.getElementById('settings-close')?.addEventListener('click', () => {
            AppState.settingsOpen = false;
        });

        this._bindSidebarPosition();
        this._bindProMode();
        this._bindBackground();
        this._bindRightClick();
    },

    _bindSidebarPosition() {
        document.querySelectorAll('[data-sidebar-pos]').forEach(btn => {
            btn.addEventListener('click', () => {
                AppState.sidebarPosition = btn.dataset.sidebarPos;
                this._updateSidebarUI();
            });
            btn.classList.toggle('active', btn.dataset.sidebarPos === AppState.sidebarPosition);
        });

        AppState.subscribe('sidebarPosition', pos => {
            this._applySidebarPosition(pos);
            this._updateSidebarUI();
        });
        this._applySidebarPosition(AppState.sidebarPosition);
    },

    _applySidebarPosition(pos) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        sidebar.className = 'sidebar sidebar--' + pos;
    },

    _updateSidebarUI() {
        document.querySelectorAll('[data-sidebar-pos]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sidebarPos === AppState.sidebarPosition);
        });
    },

    _bindProMode() {
        document.querySelectorAll('[data-mode-opt]').forEach(btn => {
            btn.addEventListener('click', () => {
                const isPro = btn.dataset.modeOpt === 'pro';
                AppState.proMode = isPro;
                document.body.classList.toggle('pro-mode', isPro);
                document.querySelectorAll('[data-mode-opt]').forEach(b => {
                    b.classList.toggle('active', b.dataset.modeOpt === btn.dataset.modeOpt);
                });
            });
        });
        // Init
        document.body.classList.toggle('pro-mode', AppState.proMode);
        document.querySelectorAll('[data-mode-opt]').forEach(b => {
            b.classList.toggle('active',
                (b.dataset.modeOpt === 'pro' && AppState.proMode) ||
                (b.dataset.modeOpt === 'simple' && !AppState.proMode)
            );
        });
    },

    _bindBackground() {
        // BG type buttons
        document.querySelectorAll('[data-bg-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                AppState.bgType = btn.dataset.bgType;
                document.querySelectorAll('[data-bg-type]').forEach(b =>
                    b.classList.toggle('active', b.dataset.bgType === AppState.bgType));
            });
            btn.classList.toggle('active', btn.dataset.bgType === AppState.bgType);
        });

        // BG color (light)
        const bgPicker = document.getElementById('bg-color');
        if (bgPicker) {
            bgPicker.value = AppState.bgColor;
            bgPicker.addEventListener('input', e => { AppState.bgColor = e.target.value; });
        }

        // BG color (dark)
        const bgDarkPicker = document.getElementById('bg-dark-color');
        if (bgDarkPicker) {
            bgDarkPicker.value = AppState.bgDarkColor;
            bgDarkPicker.addEventListener('input', e => { AppState.bgDarkColor = e.target.value; });
        }

        // Dynamic toggle
        const dynCheck = document.getElementById('bg-dynamic');
        if (dynCheck) {
            dynCheck.checked = AppState.bgDynamic;
            dynCheck.addEventListener('change', e => { AppState.bgDynamic = e.target.checked; });
        }

        // Grid size
        const gridSlider = document.getElementById('grid-size');
        const gridVal = document.getElementById('grid-size-value');
        if (gridSlider) {
            gridSlider.value = AppState.gridSize;
            gridSlider.addEventListener('input', e => {
                AppState.gridSize = parseInt(e.target.value);
                if (gridVal) gridVal.textContent = e.target.value + 'px';
            });
        }
    },

    _bindRightClick() {
        const sel = document.getElementById('right-click-select');
        if (sel) {
            sel.value = AppState.rightClickTool;
            sel.addEventListener('change', e => { AppState.rightClickTool = e.target.value; });
        }
    }
};

export default SettingsPanel;
