// ──────────────────────────────────────────────────────────────────────
// UrlOverlay  (js/overlay.js)  — Google Translate-style URL bar + iframe
// ──────────────────────────────────────────────────────────────────────
import AppState from './state.js';
import I18n from './i18n.js';

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

const UrlOverlay = {
    video: null,

    init() {
        this.video = document.getElementById('screen-video');

        // Screen Share tool button
        document.querySelectorAll('[data-tool="screenShare"]').forEach(btn => {
            btn.addEventListener('click', () => this.toggleScreenShare());
        });

        // File input
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.addEventListener('change', e => this._handleFile(e));
        document.getElementById('open-file-btn')?.addEventListener('click', () => {
            fileInput?.click();
        });

        this._initDragDrop();
    },

    async toggleScreenShare() {
        if (AppState.screenShareActive) {
            this.stopScreenShare();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            if (this.video) {
                this.video.srcObject = stream;
                this.video.onloadedmetadata = () => {
                    const w = this.video.videoWidth;
                    const h = this.video.videoHeight;
                    this.video.style.width = w + 'px';
                    this.video.style.height = h + 'px';
                    import('./canvas.js').then(({default: CanvasEngine}) => {
                        AppState.docWidth = w;
                        AppState.docHeight = h;
                        AppState.viewX = -window.innerWidth/2 + w/2;
                        AppState.viewY = -window.innerHeight/2 + h/2;
                        CanvasEngine.renderViewport();
                    });
                };
                this.video.style.display = 'block';
                this.video.play();
            }
            AppState.screenShareActive = true;
            AppState.interactMode = false;
            showToast('Screen sharing started. Drawing enabled.');
            
            stream.getVideoTracks()[0].addEventListener('ended', () => {
                this.stopScreenShare();
            });
        } catch (err) {
            console.error(err);
            showToast('Screen share failed or cancelled.');
        }
    },

    stopScreenShare() {
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
            this.video.style.display = 'none';
        }
        AppState.screenShareActive = false;
        showToast('Screen sharing stopped.');
    },

    async _handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = ev => {
                const img = new Image();
                img.onload = () => {
                    import('./canvas.js').then(({default: CanvasEngine}) => {
                        AppState.docWidth = img.width;
                        AppState.docHeight = img.height;
                        CanvasEngine.executeOnChunks({minX:0, minY:0, maxX:img.width, maxY:img.height}, ctx => {
                            ctx.drawImage(img, 0, 0);
                        });
                        showToast(I18n.t('toast.fileLoaded') || 'Image loaded successfully');
                    });
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
            try {
                // Ensure pdf.js is loaded
                if (!window.pdfjsLib) {
                     showToast('Loading PDF engine...');
                     await new Promise((res, rej) => {
                         const s = document.createElement('script');
                         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
                         s.onload = res;
                         s.onerror = rej;
                         document.head.appendChild(s);
                     });
                     window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                }

                const arr = new Uint8Array(await file.arrayBuffer());
                const pdf = await window.pdfjsLib.getDocument({data: arr}).promise;
                
                const pageCanvases = [];
                let totalHeight = 0;
                let maxWidth = 0;

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const tmpCanvas = document.createElement('canvas');
                    tmpCanvas.width = viewport.width;
                    tmpCanvas.height = viewport.height;
                    const tmpCtx = tmpCanvas.getContext('2d');
                    
                    await page.render({ canvasContext: tmpCtx, viewport }).promise;
                    pageCanvases.push(tmpCanvas);
                    
                    if (viewport.width > maxWidth) maxWidth = viewport.width;
                    totalHeight += viewport.height + 20; // 20px vertical gap
                }
                
                totalHeight -= 20; // remove last gap

                import('./canvas.js').then(({default: CanvasEngine}) => {
                    CanvasEngine.clear(); // clear before loading new PDF document
                    AppState.docWidth = Math.round(maxWidth);
                    AppState.docHeight = Math.round(totalHeight);
                    AppState.viewScale = 1;
                    AppState.viewX = -window.innerWidth/2 + maxWidth/2;
                    AppState.viewY = -50;
                    
                    let currentY = 0;
                    for (const tmpCanv of pageCanvases) {
                        CanvasEngine.executeOnChunks({minX:0, minY:currentY, maxX:tmpCanv.width, maxY:currentY + tmpCanv.height}, ctx => {
                            ctx.drawImage(tmpCanv, 0, currentY);
                        });
                        currentY += tmpCanv.height + 20;
                    }
                    showToast(`Loaded PDF (${pdf.numPages} pages)`);
                });
            } catch (err) {
                console.error(err);
                showToast('Failed to load PDF');
            }
        }
    },

    _initDragDrop() {
        const drop = document.getElementById('file-drop');
        document.addEventListener('dragenter', e => { e.preventDefault(); drop?.classList.add('active'); });
        document.addEventListener('dragover', e => { e.preventDefault(); });
        document.addEventListener('dragleave', e => { if (e.relatedTarget === null) drop?.classList.remove('active'); });
        document.addEventListener('drop', e => {
            e.preventDefault();
            drop?.classList.remove('active');
            const file = e.dataTransfer?.files?.[0];
            if (file) this._handleFile({target:{files:[file]}});
        });
    }
};

export { showToast };
export default UrlOverlay;
