import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Curva de regresión normalizada dentro del marco (x en [0, 1] -> y en [0, 1])
function evaluateModelCurve(nx) {
    const t = Math.max(0, Math.min(1, (nx - 0.08) / 0.84));
    const logistic = 1 / (1 + Math.exp(-7.5 * (t - 0.5)));
    const wave = Math.sin(t * Math.PI * 2) * 0.035;
    return 0.78 - logistic * 0.56 + wave;
}

// PRNG determinista para una distribución editorial reproducible y limpia
function createPRNG(seed = 2026) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
}

function smoothstep(v) {
    const c = Math.max(0, Math.min(1, v));
    return c * c * (3 - 2 * c);
}

/**
 * ACTOS 1 Y 2 UNIFICADOS:
 * Un único <canvas> a pantalla completa donde las mismas partículas pasan de:
 *   1) Caos a pantalla completa (Acto 1)
 *   2) Ruido encuadrado dentro de .data-stage-frame (Acto 2 · Beat 1)
 *   3) Patrón de regresión + banda de confianza + residuos en #1D4ED8 (Acto 2 · Beat 2)
 */
export function createHeroDataField(canvas, metricEl) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let stageX = 0;
    let stageY = 0;
    let stageW = 0;
    let stageH = 0;
    let count = 0;
    let isActive = true;
    let lastMetricText = '';

    const state = {
        frameProgress: 0, // 0: pantalla completa (Acto 1) -> 1: encuadrado en .data-stage-frame
        orderProgress: 0, // 0: ruido (Beat 1) -> 1: curva de regresión (Beat 2)
    };

    // Arrays tipados pre-calculados (cero garbage collection en el bucle a 60 FPS)
    let fullX, fullY;
    let stageChaosX, stageChaosY;
    let stageTargetX, stageTargetY, curveY;
    let phaseX, phaseY, speed, radius, isKeyNode, isHeroAccent, baseAlpha;

    function initParticles(particleCount) {
        count = particleCount;
        const rand = createPRNG(2026);

        fullX = new Float32Array(count);
        fullY = new Float32Array(count);
        stageChaosX = new Float32Array(count);
        stageChaosY = new Float32Array(count);
        stageTargetX = new Float32Array(count);
        stageTargetY = new Float32Array(count);
        curveY = new Float32Array(count);
        phaseX = new Float32Array(count);
        phaseY = new Float32Array(count);
        speed = new Float32Array(count);
        radius = new Float32Array(count);
        isKeyNode = new Uint8Array(count);
        isHeroAccent = new Uint8Array(count);
        baseAlpha = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // 1) Coordenadas en pantalla completa (Acto 1)
            fullX[i] = 0.03 + rand() * 0.94;
            fullY[i] = 0.06 + rand() * 0.88;

            // 2) Coordenadas de ruido dentro del marco editorial (Acto 2 · Beat 1)
            stageChaosX[i] = 0.06 + rand() * 0.88;
            stageChaosY[i] = 0.14 + rand() * 0.74;

            // 3) Coordenadas ordenadas en torno a la curva de regresión (Acto 2 · Beat 2)
            const t = i / (count - 1);
            const jitterX = (rand() - 0.5) * 0.018;
            const nx = Math.max(0.08, Math.min(0.92, 0.08 + t * 0.84 + jitterX));
            const nyCurve = evaluateModelCurve(nx);
            const gaussianNoise = (rand() + rand() - 1) * 0.082;
            const ny = Math.max(0.14, Math.min(0.86, nyCurve + gaussianNoise));

            stageTargetX[i] = nx;
            stageTargetY[i] = ny;
            curveY[i] = nyCurve;

            phaseX[i] = rand() * Math.PI * 2;
            phaseY[i] = rand() * Math.PI * 2;
            speed[i] = 0.4 + rand() * 0.65;
            isKeyNode[i] = Math.abs(gaussianNoise) < 0.028 || i % 7 === 0 ? 1 : 0;
            isHeroAccent[i] = rand() < 0.15 ? 1 : 0;
            radius[i] = isKeyNode[i] ? 2.4 + rand() * 1.3 : 1.5 + rand() * 1.1;
            baseAlpha[i] = 0.18 + rand() * 0.24;
        }
    }

    const stageFrameEl = document.querySelector('.data-stage-frame');

    function updateStageBounds() {
        // Lee las dimensiones reales del marco CSS (.data-stage-frame) para no desfasarse en portrait/landscape
        stageW =
            stageFrameEl && stageFrameEl.offsetWidth
                ? stageFrameEl.offsetWidth
                : Math.min(width * 0.88, 1100);
        stageH =
            stageFrameEl && stageFrameEl.offsetHeight
                ? stageFrameEl.offsetHeight
                : height * 0.7;
        stageX = (width - stageW) * 0.5;
        stageY = (height - stageH) * 0.5;
    }

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

        updateStageBounds();

        const targetCount = window.innerWidth <= 768 ? 70 : 132;
        if (targetCount !== count) {
            initParticles(targetCount);
        }
        render(gsap.ticker.time);
    }

    let resizeRaf = 0;
    function scheduleResize() {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
            resizeRaf = 0;
            resize();
        });
    }

    function drawEditorialGrid(frame, order) {
        if (frame <= 0.15) return;

        const visibility = smoothstep((frame - 0.15) / 0.85);
        const gridAlpha = (0.035 + order * 0.045) * visibility;
        const cols = 6;
        const rows = 4;

        ctx.strokeStyle = `rgba(17, 17, 17, ${gridAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let c = 1; c < cols; c++) {
            const x = Math.round(stageX + (stageW / cols) * c) + 0.5;
            ctx.moveTo(x, stageY);
            ctx.lineTo(x, stageY + stageH);
        }
        for (let r = 1; r < rows; r++) {
            const y = Math.round(stageY + (stageH / rows) * r) + 0.5;
            ctx.moveTo(stageX, y);
            ctx.lineTo(stageX + stageW, y);
        }
        ctx.stroke();
    }

    function drawRegressionModel(order) {
        if (order <= 0.15) return;

        const curveProgress = Math.min(1, (order - 0.15) / 0.85);
        const steps = 64;
        const exactStep = steps * curveProgress;
        const fullSteps = Math.floor(exactStep);
        const endNx = 0.08 + curveProgress * 0.84;
        const hasPartial = exactStep - fullSteps > 0.0001;
        const bandHalfHeight = stageH * (0.075 * (1 - curveProgress * 0.3));

        // 1. Banda de intervalo de confianza con avance continuo sub-píxel (sin saltos discretos)
        ctx.fillStyle = `rgba(29, 78, 216, ${0.065 * curveProgress})`;
        ctx.beginPath();
        for (let s = 0; s <= fullSteps; s++) {
            const nx = 0.08 + (s / steps) * 0.84;
            const ny = evaluateModelCurve(nx);
            const x = stageX + nx * stageW;
            const y = stageY + ny * stageH - bandHalfHeight;
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        if (hasPartial) {
            const nyEnd = evaluateModelCurve(endNx);
            ctx.lineTo(stageX + endNx * stageW, stageY + nyEnd * stageH - bandHalfHeight);
            ctx.lineTo(stageX + endNx * stageW, stageY + nyEnd * stageH + bandHalfHeight);
        }
        for (let s = fullSteps; s >= 0; s--) {
            const nx = 0.08 + (s / steps) * 0.84;
            const ny = evaluateModelCurve(nx);
            const x = stageX + nx * stageW;
            const y = stageY + ny * stageH + bandHalfHeight;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // 2. Curva principal de regresión en azul índigo (#1D4ED8) con punta continua
        ctx.strokeStyle = `rgba(29, 78, 216, ${0.88 * curveProgress})`;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let s = 0; s <= fullSteps; s++) {
            const nx = 0.08 + (s / steps) * 0.84;
            const ny = evaluateModelCurve(nx);
            const x = stageX + nx * stageW;
            const y = stageY + ny * stageH;
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        if (hasPartial) {
            const nyEnd = evaluateModelCurve(endNx);
            ctx.lineTo(stageX + endNx * stageW, stageY + nyEnd * stageH);
        }
        ctx.stroke();
    }

    function updateMetricReadout(order) {
        if (!metricEl) return;
        const r2 = (0.04 + order * 0.90).toFixed(2);
        const stateLabel = order > 0.55 ? 'PATRÓN' : 'RUIDO';
        const nextText = `${stateLabel} · R² = ${r2}`;
        if (nextText !== lastMetricText) {
            metricEl.textContent = nextText;
            lastMetricText = nextText;
        }
    }

    function render(time) {
        if (!width || !height) return;
        ctx.clearRect(0, 0, width, height);

        const smoothFrame = smoothstep(state.frameProgress);
        const smoothOrder = smoothstep(state.orderProgress);

        drawEditorialGrid(smoothFrame, smoothOrder);
        drawRegressionModel(smoothOrder);

        // Deriva orgánica: amplia en caos (18px -> 14px), micro-respiración en patrón (2.2px)
        const noiseDrift = 18 * (1 - smoothFrame) + 14 * smoothFrame;
        const driftAmp = noiseDrift * (1 - smoothOrder) + 2.2 * smoothOrder;
        const residualAlpha = Math.max(0, (smoothOrder - 0.35) / 0.65) * 0.22;

        // 1. Segmentos de residuo hacia la curva de regresión
        if (residualAlpha > 0.01) {
            ctx.strokeStyle = `rgba(29, 78, 216, ${residualAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < count; i += 2) {
                const fx = fullX[i] * width;
                const fy = fullY[i] * height;
                const sx = stageX + stageChaosX[i] * stageW;
                const sy = stageY + stageChaosY[i] * stageH;
                const tx = stageX + stageTargetX[i] * stageW;
                const ty = stageY + stageTargetY[i] * stageH;

                const xNoise = fx + (sx - fx) * smoothFrame;
                const yNoise = fy + (sy - fy) * smoothFrame;
                const dx = Math.cos(time * speed[i] + phaseX[i]) * driftAmp;
                const dy = Math.sin(time * speed[i] + phaseY[i]) * driftAmp;

                const px = xNoise + (tx - xNoise) * smoothOrder + dx;
                const py = yNoise + (ty - yNoise) * smoothOrder + dy;
                const cy = stageY + curveY[i] * stageH;

                ctx.moveTo(px, py);
                ctx.lineTo(px, cy);
            }
            ctx.stroke();
        }

        // 2. Renderizado continuo de las partículas
        for (let i = 0; i < count; i++) {
            const fx = fullX[i] * width;
            const fy = fullY[i] * height;
            const sx = stageX + stageChaosX[i] * stageW;
            const sy = stageY + stageChaosY[i] * stageH;
            const tx = stageX + stageTargetX[i] * stageW;
            const ty = stageY + stageTargetY[i] * stageH;

            const xNoise = fx + (sx - fx) * smoothFrame;
            const yNoise = fy + (sy - fy) * smoothFrame;

            const dx = Math.cos(time * speed[i] + phaseX[i]) * driftAmp;
            const dy = Math.sin(time * speed[i] + phaseY[i]) * driftAmp;

            const px = xNoise + (tx - xNoise) * smoothOrder + dx;
            const py = yNoise + (ty - yNoise) * smoothOrder + dy;

            ctx.beginPath();
            ctx.arc(px, py, radius[i], 0, Math.PI * 2);

            if (isHeroAccent[i]) {
                // Destellos azules (#1D4ED8) presentes desde el Acto 1 que se intensifican al ordenarse
                const a = baseAlpha[i] + 0.16 + smoothOrder * 0.44;
                ctx.fillStyle = `rgba(29, 78, 216, ${Math.min(0.92, a)})`;
            } else if (isKeyNode[i]) {
                // Empiezan en grafito neutro y viran a azul índigo (#1D4ED8) al formarse el patrón
                const r = Math.round(17 + (29 - 17) * smoothOrder);
                const g = Math.round(17 + (78 - 17) * smoothOrder);
                const b = Math.round(17 + (216 - 17) * smoothOrder);
                const a = baseAlpha[i] + 0.06 + smoothOrder * 0.54;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(0.92, a)})`;
            } else {
                const a = baseAlpha[i] + smoothOrder * 0.18;
                ctx.fillStyle = `rgba(102, 102, 98, ${Math.min(0.65, a)})`;
            }
            ctx.fill();
        }

        updateMetricReadout(smoothOrder);
    }

    function onTick(time) {
        if (isActive) render(time);
    }

    resize();
    gsap.ticker.add(onTick);
    window.addEventListener('resize', scheduleResize);
    window.addEventListener('orientationchange', scheduleResize);
    ScrollTrigger.addEventListener('refresh', scheduleResize);

    const ro =
        typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(scheduleResize)
            : null;
    if (ro) ro.observe(canvas);

    return {
        state,
        resize: scheduleResize,
        setActive(active) {
            isActive = active;
            if (active) render(gsap.ticker.time);
        },
        destroy() {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            gsap.ticker.remove(onTick);
            window.removeEventListener('resize', scheduleResize);
            window.removeEventListener('orientationchange', scheduleResize);
            ScrollTrigger.removeEventListener('refresh', scheduleResize);
            if (ro) ro.disconnect();
        },
    };
}
