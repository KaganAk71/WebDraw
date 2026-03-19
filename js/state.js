// ──────────────────────────────────────────────────────────────────────
// AppState + ToolConfig  (js/state.js)
// ──────────────────────────────────────────────────────────────────────

/* ── AppState: UI-level reactive state ─────────────────────────────── */
const defaults = {
    activeTool: 'hand',       // hand|pen|eraser|blur|text|shape
    penType: 'ballpoint',     // ballpoint|fountain|pencil|marker|watercolor|crayon
    shapeType: 'rectangle',   // rectangle|circle|line|arrow|triangle|star
    theme: 'dark',
    lang: 'en',
    sidebarPosition: 'left',  // left|right|top|bottom|mac
    settingsOpen: false,
    toolPopupOpen: null,       // null | tool name string
    proMode: false,
    viewX: 0,
    viewY: 0,
    viewScale: 1,
    bgType: 'dots',
    bgColor: '#ffffff',
    bgDarkColor: '#1c1c1e',
    bgDynamic: true,
    gridSize: 24,
    urlBarVisible: false,
    urlOverlayVisible: false,
    urlOverlaySrc: '',
    interactMode: false,
    rightClickTool: 'eraser',  // eraser|pan|none
};

const listeners = {};

function createState(initial) {
    const state = { ...initial };
    return new Proxy(state, {
        set(_, key, value) {
            const old = state[key];
            state[key] = value;
            if (old !== value && listeners[key]) {
                listeners[key].forEach(fn => fn(value, old));
            }
            return true;
        },
        get(_, key) { return state[key]; }
    });
}

const AppState = createState(defaults);

AppState.subscribe = (key, cb) => {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(cb);
    return () => { listeners[key] = listeners[key].filter(fn => fn !== cb); };
};

AppState.getSnapshot = () => {
    const s = {};
    for (const k of Object.keys(defaults)) s[k] = AppState[k];
    return s;
};

// Restore saved UI prefs
try {
    const saved = JSON.parse(localStorage.getItem('wd-ui-prefs') || '{}');
    if (saved.sidebarPosition) AppState.sidebarPosition = saved.sidebarPosition;
    if (saved.proMode !== undefined) AppState.proMode = saved.proMode;
    if (saved.bgType) AppState.bgType = saved.bgType;
    if (saved.bgColor) AppState.bgColor = saved.bgColor;
    if (saved.bgDarkColor) AppState.bgDarkColor = saved.bgDarkColor;
    if (saved.bgDynamic !== undefined) AppState.bgDynamic = saved.bgDynamic;
    if (saved.gridSize) AppState.gridSize = saved.gridSize;
    if (saved.rightClickTool) AppState.rightClickTool = saved.rightClickTool;
} catch { }

// Auto-save UI prefs
const uiKeys = ['sidebarPosition', 'proMode', 'bgType', 'bgColor', 'bgDarkColor', 'bgDynamic', 'gridSize', 'rightClickTool'];
uiKeys.forEach(k => {
    AppState.subscribe(k, () => {
        const prefs = {};
        uiKeys.forEach(key => prefs[key] = AppState[key]);
        localStorage.setItem('wd-ui-prefs', JSON.stringify(prefs));
    });
});


/* ── ToolConfig: per-tool settings with localStorage ──────────────── */
const toolDefaults = {
    ballpoint: { size: 1, color: '#1d1d1f', opacity: 100 },
    fountain: { size: 2, color: '#1a1a2e', opacity: 100 },
    pencil: { size: 1, color: '#4a4a4a', opacity: 85 },
    marker: { size: 24, color: '#ffe066', opacity: 35 },
    watercolor: { size: 18, color: '#4fc3f7', opacity: 25 },
    crayon: { size: 8, color: '#ff7043', opacity: 85 },
    eraser: { size: 10 },
    blur: { size: 20, strength: 3 },
    text: { fontSize: 16, fontFamily: 'Inter', color: '#1d1d1f', bold: false, italic: false },
    shape: { strokeColor: '#1d1d1f', fillColor: 'transparent', strokeWidth: 2 },
};

const toolConfigListeners = [];

const ToolConfig = {
    _cache: null,

    _load() {
        if (this._cache) return this._cache;
        try {
            this._cache = JSON.parse(localStorage.getItem('wd-tool-settings') || '{}');
        } catch { this._cache = {}; }
        return this._cache;
    },

    get(tool) {
        const saved = this._load();
        return { ...(toolDefaults[tool] || {}), ...(saved[tool] || {}) };
    },

    set(tool, key, value) {
        const saved = this._load();
        if (!saved[tool]) saved[tool] = {};
        saved[tool][key] = value;
        this._cache = saved;
        localStorage.setItem('wd-tool-settings', JSON.stringify(saved));
        toolConfigListeners.forEach(fn => fn(tool, key, value));
    },

    subscribe(cb) {
        toolConfigListeners.push(cb);
        return () => {
            const i = toolConfigListeners.indexOf(cb);
            if (i >= 0) toolConfigListeners.splice(i, 1);
        };
    },

    getDefaults() { return toolDefaults; },
};

export { ToolConfig };
export default AppState;
