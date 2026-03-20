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
        this._bindCanvasSize();
        this._bindBackground();
        this._bindRightClick();
    },

    _bindCanvasSize() {
        const dW = document.getElementById('doc-width');
        const dH = document.getElementById('doc-height');
        const dI = document.getElementById('doc-inf-btn');

        if (dW) {
            dW.value = AppState.docWidth || '';
            dW.addEventListener('change', e => { 
                AppState.docWidth = parseInt(e.target.value) || 0; 
                if (AppState.docWidth) AppState.viewX = -window.innerWidth / 2 + AppState.docWidth / 2;
                import('./canvas.js').then(m => m.default.renderViewport());
            });
        }
        if (dH) {
            dH.value = AppState.docHeight || '';
            dH.addEventListener('change', e => { 
                AppState.docHeight = parseInt(e.target.value) || 0; 
                if (AppState.docHeight) AppState.viewY = -100; // slightly above top
                import('./canvas.js').then(m => m.default.renderViewport());
            });
        }
        if (dI) {
            dI.addEventListener('click', () => {
                AppState.docWidth = 0; AppState.docHeight = 0;
                if (dW) dW.value = '';
                if (dH) dH.value = '';
                import('./canvas.js').then(m => m.default.resetView());
            });
        }
        
        AppState.subscribe('docWidth', w => { if (dW) dW.value = w || ''; });
        AppState.subscribe('docHeight', h => { if (dH) dH.value = h || ''; });
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

        // BG color
        const bgPicker = document.getElementById('bg-color');
        if (bgPicker) {
            bgPicker.value = AppState.bgColor;
            bgPicker.addEventListener('input', e => { AppState.bgColor = e.target.value; });
            AppState.subscribe('bgColor', c => bgPicker.value = c);
        }

        // Grid color
        const gridPicker = document.getElementById('grid-color');
        if (gridPicker) {
            gridPicker.value = AppState.gridColor;
            gridPicker.addEventListener('input', e => { AppState.gridColor = e.target.value; });
            AppState.subscribe('gridColor', c => gridPicker.value = c);
        }

        // Grid size & unit
        const gridSlider = document.getElementById('grid-size');
        const gridUnit = document.getElementById('grid-unit');
        
        if (gridSlider) {
            gridSlider.value = AppState.gridSize;
            gridSlider.addEventListener('input', e => {
                AppState.gridSize = parseInt(e.target.value);
            });
            AppState.subscribe('gridSize', v => { if(gridSlider.value != v) gridSlider.value = v; });
        }
        if (gridUnit) {
            gridUnit.value = AppState.gridUnit;
            gridUnit.addEventListener('change', e => {
                AppState.gridUnit = e.target.value;
            });
            AppState.subscribe('gridUnit', v => { if(gridUnit.value != v) gridUnit.value = v; });
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
