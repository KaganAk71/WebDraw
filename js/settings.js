// ──────────────────────────────────────────────────────────────────────
// SettingsPanel  (js/settings.js)
// ──────────────────────────────────────────────────────────────────────

import AppState from './state.js';
import BackgroundRenderer from './background.js';

const SettingsPanel = {
    panel: null,

    init() {
        this.panel = document.getElementById('settings-panel');

        // Toggle
        AppState.subscribe('settingsOpen', (open) => {
            this.panel?.classList.toggle('open', open);
        });

        // Close button
        document.getElementById('settings-close')?.addEventListener('click', () => {
            AppState.settingsOpen = false;
        });

        this.bindControls();
    },

    bindControls() {
        // Stroke color
        const colorPicker = document.getElementById('stroke-color');
        const colorHex = document.getElementById('stroke-color-hex');
        if (colorPicker) {
            colorPicker.value = AppState.strokeColor;
            colorPicker.addEventListener('input', (e) => {
                AppState.strokeColor = e.target.value;
                if (colorHex) colorHex.value = e.target.value;
            });
        }
        if (colorHex) {
            colorHex.value = AppState.strokeColor;
            colorHex.addEventListener('change', (e) => {
                let val = e.target.value;
                if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                    AppState.strokeColor = val;
                    if (colorPicker) colorPicker.value = val;
                }
            });
        }

        // Stroke width
        const widthSlider = document.getElementById('stroke-width');
        const widthValue = document.getElementById('stroke-width-value');
        if (widthSlider) {
            widthSlider.value = AppState.strokeWidth;
            widthSlider.addEventListener('input', (e) => {
                AppState.strokeWidth = parseInt(e.target.value);
                if (widthValue) widthValue.textContent = e.target.value + 'px';
            });
        }

        // Opacity
        const opacitySlider = document.getElementById('opacity-slider');
        const opacityValue = document.getElementById('opacity-value');
        if (opacitySlider) {
            opacitySlider.value = AppState.opacity;
            opacitySlider.addEventListener('input', (e) => {
                AppState.opacity = parseInt(e.target.value);
                if (opacityValue) opacityValue.textContent = e.target.value + '%';
            });
        }

        // Background type buttons
        document.querySelectorAll('[data-bg-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                AppState.bgType = btn.dataset.bgType;
                document.querySelectorAll('[data-bg-type]').forEach(b => {
                    b.classList.toggle('active', b.dataset.bgType === AppState.bgType);
                });
            });
            btn.classList.toggle('active', btn.dataset.bgType === AppState.bgType);
        });

        // Background color
        const bgColorPicker = document.getElementById('bg-color');
        if (bgColorPicker) {
            bgColorPicker.value = AppState.bgColor;
            bgColorPicker.addEventListener('input', (e) => {
                AppState.bgColor = e.target.value;
            });
        }

        // Grid size
        const gridSlider = document.getElementById('grid-size');
        const gridValue = document.getElementById('grid-size-value');
        if (gridSlider) {
            gridSlider.value = AppState.gridSize;
            gridSlider.addEventListener('input', (e) => {
                AppState.gridSize = parseInt(e.target.value);
                if (gridValue) gridValue.textContent = e.target.value + 'px';
            });
        }
    }
};

export default SettingsPanel;
