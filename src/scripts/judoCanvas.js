import { ScrollTrigger } from 'gsap/ScrollTrigger';

const USE_REAL_FRAMES = true;  // Secuencia WebP real en public/frames/judo/
const DESKTOP_FRAME_COUNT = 120;
const MOBILE_FRAME_COUNT = 60;

export function createJudoScrubber(canvas) {
    const ctx = canvas.getContext('2d');
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSaveData = Boolean(conn && (conn.saveData || conn.effectiveType === '2g'));
    const useMobileAssets = window.innerWidth <= 768 || isSaveData;

    const frameCount = useMobileAssets ? MOBILE_FRAME_COUNT : DESKTOP_FRAME_COUNT;
    const basePath = useMobileAssets ? '/frames/judo/mobile' : '/frames/judo';
    const framePath = (index) =>
        `${basePath}/frame_${String(index + 1).padStart(4, '0')}.webp`;

    const images = new Array(frameCount);
    let currentFrame = 0;
    let width = 0;
    let height = 0;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const nextW = Math.round(rect.width);
        const nextH = Math.round(rect.height);
        if (!nextW || !nextH) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = nextW;
        height = nextH;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        render(currentFrame);
    }

    let resizeRaf = 0;
    function scheduleResize() {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
            resizeRaf = 0;
            resize();
        });
    }

    // Equivalente a CSS object-fit: cover con punto focal horizontal en el nudo (54.5%)
    function drawImageCover(img) {
        const FOCAL_X = 0.545;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = width / height;
        let drawW, drawH;

        if (canvasRatio > imgRatio) {
            drawW = width;
            drawH = width / imgRatio;
        } else {
            drawH = height;
            drawW = height * imgRatio;
        }

        // En pantallas anchas (16:9) amplía solo lo mínimo (~1.1x) para recortar el sobrante
        // izquierdo y centrar exactamente el nudo; en móvil ya sobra ancho y no hace zoom extra.
        const minDrawWForFocal = width * (0.5 / Math.min(FOCAL_X, 1 - FOCAL_X));
        if (drawW < minDrawWForFocal) {
            const boost = minDrawWForFocal / drawW;
            drawW *= boost;
            drawH *= boost;
        }

        const offsetX = Math.max(
            width - drawW,
            Math.min(0, width * 0.5 - drawW * FOCAL_X)
        );
        const offsetY = (height - drawH) * 0.5;

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    }

    // Placeholder visual para probar el greybox antes de grabar el vídeo
    function drawGreyboxFrame(index) {
        const progress = index / (frameCount - 1);

        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, width, height);

        // Simulación de tensión/equilibrio (dos líneas que convergen en un nudo central)
        const cx = width / 2;
        const cy = height / 2;
        const spread = (1 - progress) * (width * 0.28);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();

        // Dos bloques que simbolizan el agarre/tensión del cinturón
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 + progress * 4;
        ctx.beginPath();
        ctx.arc(cx - spread, cy, 48 + progress * 24, 0, Math.PI * 2);
        ctx.arc(cx + spread, cy, 48 + progress * 24, 0, Math.PI * 2);
        ctx.stroke();

        // Marcador editorial de fotograma
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.font = '13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
            `[GREYBOX JUDO B&W] FRAME ${String(index + 1).padStart(3, '0')} / ${frameCount}`,
            cx,
            height - 32
        );
    }

    function isImageReady(img) {
        return Boolean(img && img.complete && img.naturalWidth > 0);
    }

    function findNearestReadyImage(targetIndex) {
        if (isImageReady(images[targetIndex])) return images[targetIndex];
        for (let offset = 1; offset < frameCount; offset++) {
            const prev = targetIndex - offset;
            if (prev >= 0 && isImageReady(images[prev])) return images[prev];
            const next = targetIndex + offset;
            if (next < frameCount && isImageReady(images[next])) return images[next];
        }
        return null;
    }

    function render(frameIndex) {
        currentFrame = Math.max(0, Math.min(frameCount - 1, Math.round(frameIndex)));

        if (!USE_REAL_FRAMES) {
            drawGreyboxFrame(currentFrame);
            return;
        }

        const img = findNearestReadyImage(currentFrame);
        if (img) {
            ctx.clearRect(0, 0, width, height);
            drawImageCover(img);
        }
    }

    // Precarga temprana desde el inicio con cola controlada (6 descargas simultáneas):
    // aprovecha el tiempo de lectura de los Actos 1-3 sin saturar la red del móvil.
    function preloadFrames() {
        if (!USE_REAL_FRAMES) return;

        const queued = new Set([0]);
        const queue = [];

        // En modo ahorro de datos extremo, cargamos solo 1 de cada 2 frames móviles (30 frames)
        const step = isSaveData ? 2 : 1;

        // Prioridad 1: fotogramas clave espaciados para respuesta inmediata
        for (let i = 4; i < frameCount; i += 4) {
            if (!queued.has(i)) {
                queued.add(i);
                queue.push(i);
            }
        }
        // Prioridad 2: resto de fotogramas
        for (let i = step; i < frameCount; i += step) {
            if (!queued.has(i)) {
                queued.add(i);
                queue.push(i);
            }
        }

        const loadOne = (i, onDone) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => {
                if (i === 0 || currentFrame === i) render(currentFrame);
                if (onDone) onDone();
            };
            img.onerror = () => {
                if (onDone) onDone();
            };
            img.src = framePath(i);
            images[i] = img;
        };

        // Frame 0 inmediato
        loadOne(0);

        const startQueue = () => {
            const CONCURRENCY = 6;
            let cursor = 0;

            const next = () => {
                if (cursor >= queue.length) return;
                const index = queue[cursor++];
                loadOne(index, next);
            };

            for (let w = 0; w < CONCURRENCY; w++) {
                next();
            }
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(startQueue);
        } else {
            setTimeout(startQueue, 250);
        }
    }

    resize();
    preloadFrames();
    window.addEventListener('resize', scheduleResize);
    window.addEventListener('orientationchange', scheduleResize);
    ScrollTrigger.addEventListener('refresh', scheduleResize);

    const ro =
        typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(scheduleResize)
            : null;
    if (ro) ro.observe(canvas);

    return {
        frameCount,
        render,
        resize: scheduleResize,
        destroy: () => {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            window.removeEventListener('resize', scheduleResize);
            window.removeEventListener('orientationchange', scheduleResize);
            ScrollTrigger.removeEventListener('refresh', scheduleResize);
            if (ro) ro.disconnect();
        },
    };
}