// ──────────────────────────────────────────────────────────────────────
// ToolPopup  (js/popup.js)  — floating popover for pen/eraser/blur/text/shape
// Reads/writes ToolConfig, positions relative to sidebar
// ──────────────────────────────────────────────────────────────────────
import AppState, { ToolConfig } from './state.js';
import I18n from './i18n.js';

const PRESET_COLORS = [
    '#1d1d1f', '#6e6e73', '#ff3b30', '#ff9500', '#ffcc00',
    '#34c759', '#007aff', '#5856d6', '#af52de', '#ff2d55',
    '#00c7be', '#ffe066', '#5ac8fa', '#ff6b6b', '#48dbfb',
];

const ToolPopup = {
    el: null,

    init() {
        this.el = document.getElementById('tool-popup');

        AppState.subscribe('toolPopupOpen', tool => {
            if (tool) {
                this._render(tool);
                this._position(tool);
                this.el.classList.add('open');
            } else {
                this.el.classList.remove('open');
            }
        });

        // Close on click outside
        document.addEventListener('pointerdown', e => {
            if (!AppState.toolPopupOpen) return;
            if (this.el.contains(e.target)) return;
            if (e.target.closest('.sidebar')) return;
            AppState.toolPopupOpen = null;
        });
    },

    _position(tool) {
        const btn = document.querySelector(`[data-tool="${tool}"]`);
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const pos = AppState.sidebarPosition;
        const pw = 260; // popup width approx

        // Mobile override
        if (window.innerWidth <= 640) return; // CSS handles mobile centering

        if (pos === 'left') {
            this.el.style.left = (rect.right + 8) + 'px';
            this.el.style.top = rect.top + 'px';
            this.el.style.right = 'auto';
            this.el.style.bottom = 'auto';
        } else if (pos === 'right') {
            this.el.style.right = (window.innerWidth - rect.left + 8) + 'px';
            this.el.style.top = rect.top + 'px';
            this.el.style.left = 'auto';
            this.el.style.bottom = 'auto';
        } else if (pos === 'top') {
            this.el.style.left = rect.left + 'px';
            this.el.style.top = (rect.bottom + 8) + 'px';
            this.el.style.right = 'auto';
            this.el.style.bottom = 'auto';
        } else { // bottom, mac
            this.el.style.left = rect.left + 'px';
            this.el.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
            this.el.style.top = 'auto';
            this.el.style.right = 'auto';
        }

        // Clamp to viewport
        requestAnimationFrame(() => {
            const pr = this.el.getBoundingClientRect();
            if (pr.right > window.innerWidth - 8) {
                this.el.style.left = (window.innerWidth - pr.width - 8) + 'px';
                this.el.style.right = 'auto';
            }
            if (pr.bottom > window.innerHeight - 8) {
                this.el.style.top = (window.innerHeight - pr.height - 8) + 'px';
                this.el.style.bottom = 'auto';
            }
        });
    },

    _render(tool) {
        let html = '';
        if (tool === 'pen') html = this._penPopup();
        else if (tool === 'eraser') html = this._eraserPopup();
        else if (tool === 'blur') html = this._blurPopup();
        else if (tool === 'text') html = this._textPopup();
        else if (tool === 'shape') html = this._shapePopup();
        this.el.innerHTML = html;
        this._bindPopupEvents(tool);
    },

    /* ── Pen Popup ──────────────────────────────────────────────────── */
    _penPopup() {
        const penType = AppState.penType;
        const cfg = ToolConfig.get(penType);
        const types = ['ballpoint', 'fountain', 'pencil', 'marker', 'watercolor', 'crayon'];
        const icons = { ballpoint: '✒️', fountain: '🖋️', pencil: '✏️', marker: '🖍️', watercolor: '🎨', crayon: '🖊️' };

        return `
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.penType')}</div>
      <div class="pen-type-row">
        ${types.map(t => `<button class="pen-type-btn ${t === penType ? 'active' : ''}"
          data-pen-type="${t}" title="${I18n.t('penTypes.' + t)}">${icons[t]}</button>`).join('')}
      </div>
    </div>
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.color')}</div>
      <div class="color-palette">
        ${PRESET_COLORS.map(c => `<div class="color-dot ${c === cfg.color ? 'active' : ''}"
          data-color="${c}" style="background:${c}"></div>`).join('')}
      </div>
      <div class="color-row" style="margin-top:6px">
        <div class="color-swatch"><input type="color" id="popup-color" value="${cfg.color}"></div>
        <input type="text" class="color-hex" id="popup-color-hex" value="${cfg.color}" maxlength="7">
      </div>
    </div>
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.size')}</div>
      <div class="slider-row">
        <input type="range" id="popup-size" min="1" max="80" value="${cfg.size}">
        <span class="slider-val" id="popup-size-val">${cfg.size}px</span>
      </div>
    </div>
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.opacity')}</div>
      <div class="slider-row">
        <input type="range" id="popup-opacity" min="1" max="100" value="${cfg.opacity}">
        <span class="slider-val" id="popup-opacity-val">${cfg.opacity}%</span>
      </div>
    </div>`;
    },

    /* ── Eraser Popup ───────────────────────────────────────────────── */
    _eraserPopup() {
        const cfg = ToolConfig.get('eraser');
        return `
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.size')}</div>
      <div class="slider-row">
        <input type="range" id="popup-size" min="1" max="100" value="${cfg.size}">
        <span class="slider-val" id="popup-size-val">${cfg.size}px</span>
      </div>
    </div>`;
    },

    /* ── Blur Popup ─────────────────────────────────────────────────── */
    _blurPopup() {
        const cfg = ToolConfig.get('blur');
        return `
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.size')}</div>
      <div class="slider-row">
        <input type="range" id="popup-size" min="4" max="80" value="${cfg.size}">
        <span class="slider-val" id="popup-size-val">${cfg.size}px</span>
      </div>
    </div>
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.strength')}</div>
      <div class="slider-row">
        <input type="range" id="popup-strength" min="1" max="20" value="${cfg.strength}">
        <span class="slider-val" id="popup-strength-val">${cfg.strength}</span>
      </div>
    </div>`;
    },

    /* ── Text Popup ─────────────────────────────────────────────────── */
    _textPopup() {
        const cfg = ToolConfig.get('text');
        const fonts = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Times New Roman', 'Verdana'];
        return `
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.font')}</div>
      <div class="text-controls">
        <select id="popup-font">${fonts.map(f => `<option value="${f}" ${f === cfg.fontFamily ? 'selected' : ''}>${f}</option>`).join('')}</select>
      </div>
    </div>
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.fontSize')}</div>
      <div class="slider-row">
        <input type="range" id="popup-fontsize" min="8" max="120" value="${cfg.fontSize}">
        <span class="slider-val" id="popup-fontsize-val">${cfg.fontSize}px</span>
      </div>
    </div>
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.color')}</div>
      <div class="color-palette">
        ${PRESET_COLORS.map(c => `<div class="color-dot ${c === cfg.color ? 'active' : ''}"
          data-color="${c}" style="background:${c}"></div>`).join('')}
      </div>
      <div class="color-row" style="margin-top:6px">
        <div class="color-swatch"><input type="color" id="popup-color" value="${cfg.color}"></div>
      </div>
    </div>
    <div class="tool-popup__section">
      <div class="tool-popup__label" style="margin-bottom:4px">Style</div>
      <div class="text-controls">
        <button class="toggle-btn ${cfg.bold ? 'active' : ''}" id="popup-bold">B</button>
        <button class="toggle-btn ${cfg.italic ? 'active' : ''}" id="popup-italic" style="font-style:italic">I</button>
      </div>
    </div>`;
    },

    /* ── Shape Popup ────────────────────────────────────────────────── */
    _shapePopup() {
        const cfg = ToolConfig.get('shape');
        const shapes = ['rectangle', 'circle', 'line', 'arrow', 'triangle', 'star'];
        const icons = {
            rectangle: '<rect x="2" y="4" width="16" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>',
            circle: '<circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>',
            line: '<line x1="2" y1="18" x2="18" y2="2" stroke="currentColor" stroke-width="1.5"/>',
            arrow: '<line x1="2" y1="18" x2="18" y2="2" stroke="currentColor" stroke-width="1.5"/><polyline points="10,2 18,2 18,10" fill="none" stroke="currentColor" stroke-width="1.5"/>',
            triangle: '<polygon points="10,2 18,18 2,18" fill="none" stroke="currentColor" stroke-width="1.5"/>',
            star: '<polygon points="10,1 12.5,7 19,7.5 14,12 15.5,19 10,15.5 4.5,19 6,12 1,7.5 7.5,7" fill="none" stroke="currentColor" stroke-width="1.2"/>'
        };

        return `
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.shapeType')}</div>
      <div class="shape-type-row">
        ${shapes.map(s => `<button class="shape-type-btn ${s === AppState.shapeType ? 'active' : ''}"
          data-shape-type="${s}" title="${I18n.t('shapeTypes.' + s)}">
          <svg viewBox="0 0 20 20">${icons[s]}</svg></button>`).join('')}
      </div>
    </div>
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.strokeColor')}</div>
      <div class="color-row">
        <div class="color-swatch"><input type="color" id="popup-stroke-color" value="${cfg.strokeColor}"></div>
        <input type="text" class="color-hex" id="popup-stroke-hex" value="${cfg.strokeColor}" maxlength="7">
      </div>
    </div>
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.fillColor')}</div>
      <div class="color-row">
        <div class="color-swatch"><input type="color" id="popup-fill-color" value="${cfg.fillColor === 'transparent' ? '#ffffff' : cfg.fillColor}"></div>
        <label style="font-size:11px;display:flex;align-items:center;gap:4px;color:var(--tx2)">
          <input type="checkbox" id="popup-no-fill" ${cfg.fillColor === 'transparent' ? 'checked' : ''}> No fill
        </label>
      </div>
    </div>
    <div class="tool-popup__section">
      <div class="tool-popup__label">${I18n.t('popup.strokeWidth')}</div>
      <div class="slider-row">
        <input type="range" id="popup-stroke-width" min="1" max="20" value="${cfg.strokeWidth}">
        <span class="slider-val" id="popup-strokew-val">${cfg.strokeWidth}px</span>
      </div>
    </div>`;
    },

    /* ── Bind events for current popup content ──────────────────────── */
    _bindPopupEvents(tool) {
        const getToolKey = () => tool === 'pen' ? AppState.penType : tool;

        // Pen type buttons
        this.el.querySelectorAll('[data-pen-type]').forEach(b => {
            b.addEventListener('click', () => {
                AppState.penType = b.dataset.penType;
                this._render('pen');
                this._bindPopupEvents('pen');
            });
        });

        // Shape type buttons
        this.el.querySelectorAll('[data-shape-type]').forEach(b => {
            b.addEventListener('click', () => {
                AppState.shapeType = b.dataset.shapeType;
                this.el.querySelectorAll('[data-shape-type]').forEach(x =>
                    x.classList.toggle('active', x.dataset.shapeType === b.dataset.shapeType));
            });
        });

        // Color dots
        this.el.querySelectorAll('.color-dot[data-color]').forEach(d => {
            d.addEventListener('click', () => {
                const c = d.dataset.color;
                ToolConfig.set(getToolKey(), 'color', c);
                this.el.querySelectorAll('.color-dot').forEach(x =>
                    x.classList.toggle('active', x.dataset.color === c));
                const picker = this.el.querySelector('#popup-color');
                if (picker) picker.value = c;
                const hex = this.el.querySelector('#popup-color-hex');
                if (hex) hex.value = c;
            });
        });

        // Color picker
        this.el.querySelector('#popup-color')?.addEventListener('input', e => {
            ToolConfig.set(getToolKey(), 'color', e.target.value);
            const hex = this.el.querySelector('#popup-color-hex');
            if (hex) hex.value = e.target.value;
        });
        this.el.querySelector('#popup-color-hex')?.addEventListener('change', e => {
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                ToolConfig.set(getToolKey(), 'color', e.target.value);
                const picker = this.el.querySelector('#popup-color');
                if (picker) picker.value = e.target.value;
            }
        });

        // Size slider
        const sizeS = this.el.querySelector('#popup-size');
        const sizeV = this.el.querySelector('#popup-size-val');
        sizeS?.addEventListener('input', e => {
            ToolConfig.set(getToolKey(), 'size', parseInt(e.target.value));
            if (sizeV) sizeV.textContent = e.target.value + 'px';
        });

        // Opacity slider
        const opS = this.el.querySelector('#popup-opacity');
        const opV = this.el.querySelector('#popup-opacity-val');
        opS?.addEventListener('input', e => {
            ToolConfig.set(getToolKey(), 'opacity', parseInt(e.target.value));
            if (opV) opV.textContent = e.target.value + '%';
        });

        // Blur strength
        const strS = this.el.querySelector('#popup-strength');
        const strV = this.el.querySelector('#popup-strength-val');
        strS?.addEventListener('input', e => {
            ToolConfig.set('blur', 'strength', parseInt(e.target.value));
            if (strV) strV.textContent = e.target.value;
        });

        // Text controls
        this.el.querySelector('#popup-font')?.addEventListener('change', e => {
            ToolConfig.set('text', 'fontFamily', e.target.value);
        });
        const fsS = this.el.querySelector('#popup-fontsize');
        const fsV = this.el.querySelector('#popup-fontsize-val');
        fsS?.addEventListener('input', e => {
            ToolConfig.set('text', 'fontSize', parseInt(e.target.value));
            if (fsV) fsV.textContent = e.target.value + 'px';
        });
        this.el.querySelector('#popup-bold')?.addEventListener('click', e => {
            const cur = ToolConfig.get('text').bold;
            ToolConfig.set('text', 'bold', !cur);
            e.target.classList.toggle('active');
        });
        this.el.querySelector('#popup-italic')?.addEventListener('click', e => {
            const cur = ToolConfig.get('text').italic;
            ToolConfig.set('text', 'italic', !cur);
            e.target.classList.toggle('active');
        });

        // Shape controls
        this.el.querySelector('#popup-stroke-color')?.addEventListener('input', e => {
            ToolConfig.set('shape', 'strokeColor', e.target.value);
        });
        this.el.querySelector('#popup-stroke-hex')?.addEventListener('change', e => {
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value))
                ToolConfig.set('shape', 'strokeColor', e.target.value);
        });
        this.el.querySelector('#popup-fill-color')?.addEventListener('input', e => {
            if (!this.el.querySelector('#popup-no-fill')?.checked)
                ToolConfig.set('shape', 'fillColor', e.target.value);
        });
        this.el.querySelector('#popup-no-fill')?.addEventListener('change', e => {
            ToolConfig.set('shape', 'fillColor', e.target.checked ? 'transparent' :
                (this.el.querySelector('#popup-fill-color')?.value || '#ffffff'));
        });
        const swS = this.el.querySelector('#popup-stroke-width');
        const swV = this.el.querySelector('#popup-strokew-val');
        swS?.addEventListener('input', e => {
            ToolConfig.set('shape', 'strokeWidth', parseInt(e.target.value));
            if (swV) swV.textContent = e.target.value + 'px';
        });
    }
};

export default ToolPopup;
