import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createJudoScrubber } from './judoCanvas.js';
import { createHeroDataField } from './particlesCanvas.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

// 1. Scroll suave con Lenis sincronizado con GSAP
const lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Recalibración limpia al rotar el teléfono o terminar un redimensionado de ventana
let resizeRefreshTimer = 0;
function scheduleScrollRefresh() {
    window.clearTimeout(resizeRefreshTimer);
    resizeRefreshTimer = window.setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
    }, 180);
}
window.addEventListener('orientationchange', scheduleScrollRefresh);
window.addEventListener('resize', scheduleScrollRefresh);

// Enlaces de navegación suaves
document.querySelectorAll('[data-scroll-to]').forEach((link) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-scroll-to');
        if (target) lenis.scrollTo(target, { duration: 1.2 });
    });
});

// 2. Inicializar los canvas (Actos 1-2 unificados y Acto 4)
const particlesCanvasEl = document.getElementById('particles-canvas');
const dataMetricEl = document.getElementById('data-metric');
const heroDataField = particlesCanvasEl
    ? createHeroDataField(particlesCanvasEl, dataMetricEl)
    : null;

const judoCanvasEl = document.getElementById('judo-canvas');
const judoScrubber = judoCanvasEl ? createJudoScrubber(judoCanvasEl) : null;

// 2b. Micro-interacciones reales del Acto 3 (modos Diseño/Retícula/Inspeccionar/Wireframe + comparador + FPS reales)
const uiFrameEl = document.getElementById('ui-frame');
const uiViewBtns = document.querySelectorAll('[data-ui-view]');
const uiBlocksWithCols = document.querySelectorAll('.ui-block[data-grid-cols]');

function updateInspectMetrics() {
    uiBlocksWithCols.forEach((block) => {
        const badge = block.querySelector('.ui-inspect-badge');
        if (!badge) return;
        const cols = block.getAttribute('data-grid-cols') || '';
        const w = Math.round(block.offsetWidth);
        const h = Math.round(block.offsetHeight);
        badge.textContent = `${cols} · ${w}×${h}px`;
    });
}

if (uiFrameEl && uiViewBtns.length) {
    updateInspectMetrics();
    window.addEventListener('resize', updateInspectMetrics);

    uiViewBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-ui-view');
            if (!view) return;

            uiFrameEl.setAttribute('data-view', view);
            uiViewBtns.forEach((b) => {
                const active = b === btn;
                b.classList.toggle('is-active', active);
                b.setAttribute('aria-pressed', String(active));
            });

            if (view === 'inspect' || view === 'wireframe') {
                updateInspectMetrics();
            }
        });
    });
}

// Medidor real de FPS en vivo (solo activo mientras el Acto 3 está en viewport)
const uiScoreEl = document.getElementById('ui-score');
const uiFpsMetaEl = document.getElementById('ui-fps-meta');
let act3Active = false;
let fpsFrames = 0;
let fpsLastSample = performance.now();
let lastFpsLabel = '';

gsap.ticker.add(() => {
    if (!act3Active) return;
    fpsFrames += 1;
    const now = performance.now();
    const elapsed = now - fpsLastSample;

    if (elapsed >= 500) {
        const measured = Math.max(
            24,
            Math.min(240, Math.round((fpsFrames * 1000) / elapsed))
        );
        const label = `${measured} FPS`;
        if (label !== lastFpsLabel) {
            if (uiScoreEl) uiScoreEl.textContent = label;
            if (uiFpsMetaEl) uiFpsMetaEl.textContent = label;
            lastFpsLabel = label;
        }
        fpsFrames = 0;
        fpsLastSample = now;
    }
});

const uiDemoStage = document.getElementById('ui-demo-stage');
const uiSegmented = document.getElementById('ui-segmented');
const uiModeBtns = document.querySelectorAll('[data-ui-mode]');

if (uiDemoStage && uiModeBtns.length) {
    uiModeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-ui-mode');
            if (!mode) return;

            uiDemoStage.setAttribute('data-mode', mode);
            if (uiSegmented) uiSegmented.classList.add('has-interacted');
            uiModeBtns.forEach((b) => {
                const active = b === btn;
                b.classList.toggle('is-active', active);
                b.setAttribute('aria-pressed', String(active));
            });

            if (mode === 'clear') {
                gsap.fromTo(
                    '.ui-mini-bar',
                    { scaleY: 0 },
                    { scaleY: 1, stagger: 0.04, duration: 0.35, ease: 'power2.out' }
                );
            }
        });
    });
}

// 3. Coreografía responsive con gsap.matchMedia()
const mm = gsap.matchMedia();

mm.add(
    {
        isDesktop: '(min-width: 769px)',
        isMobile: '(max-width: 768px)',
        canPinAct3: '(min-width: 769px) and (min-height: 560px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
        const { isDesktop, canPinAct3, reduceMotion } = context.conditions;

        // Si el usuario tiene activado "Reducir movimiento" en su sistema, desactivamos
        // el scrollytelling fijado y dejamos la página estática, legible y accesible.
        if (reduceMotion) {
            if (heroDataField) {
                heroDataField.state.frameProgress = 1;
                heroDataField.state.orderProgress = 1;
                heroDataField.setActive(false);
            }
            if (judoScrubber) {
                judoScrubber.render(judoScrubber.frameCount - 1);
            }
            return;
        }

        // --- ACTOS 1 Y 2 UNIFICADOS: Caos -> Encuadre continuo -> Patrón de regresión ---
        const tlAct12 = gsap.timeline({
            scrollTrigger: {
                trigger: '.act-1-2',
                start: 'top top',
                end: isDesktop ? '+=375%' : '+=250%',
                pin: true,
                scrub: 0.75,
                onToggle: (self) => {
                    if (heroDataField) heroDataField.setActive(self.isActive);
                },
            },
        });

        // 1) Acto 1: el titular se acerca y desaparece de forma pausada
        tlAct12.to(
            '.hero-inner',
            {
                scale: isDesktop ? 1.14 : 1.08,
                opacity: 0,
                duration: 0.65,
                ease: 'power2.inOut',
            },
            0
        );

        // 2) Transición continua: las partículas se recogen lentamente y el marco nace detrás
        if (heroDataField) {
            tlAct12.to(
                heroDataField.state,
                {
                    frameProgress: 1,
                    duration: 0.9,
                    ease: 'power2.inOut',
                },
                0.25
            );
        }

        tlAct12.fromTo(
            '.data-stage-frame',
            { scale: 0.92, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.72,
                ease: 'power2.out',
            },
            0.38
        );

        tlAct12.to(
            '.data-stage-header',
            {
                opacity: 1,
                duration: 0.45,
                ease: 'power2.out',
            },
            0.8
        );

        // 3) Acto 2 · Beat 1: entrada suave, pausa breve y salida más ágil
        tlAct12
            .to(
                '.beat-1',
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
                1.15
            )
            .to(
                '.beat-1',
                { opacity: 0, y: -24, duration: 0.33, ease: 'power2.in' },
                1.87
            )
            .to(
                '.data-stage-frame',
                { borderColor: '#1d4ed8', duration: 0.6 },
                1.95
            );

        // 4) Acto 2 · Convergencia fluida de las partículas hacia la curva de regresión
        if (heroDataField) {
            tlAct12.to(
                heroDataField.state,
                {
                    orderProgress: 1,
                    duration: 0.9,
                    ease: 'power2.inOut',
                },
                1.95
            );
        }

        // 5) Acto 2 · Beat 2: entrada suave con el patrón ya visible y salida más ágil
        tlAct12
            .to(
                '.beat-2',
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
                2.65
            )
            .to(
                '.beat-2',
                { opacity: 0, y: -24, duration: 0.33, ease: 'power2.in' },
                3.37
            );

        // --- ACTO 3: Diseño Web ---
        // Escritorio con altura suficiente: tarjeta fijada (pin) con expansión simétrica a 100svh.
        // Móvil (vertical u horizontal): flujo natural (height: auto) a tamaño real sin recortes.
        if (canPinAct3) {
            const tlAct3 = gsap.timeline({
                scrollTrigger: {
                    trigger: '.act-3',
                    start: 'top top',
                    end: '+=200%',
                    pin: true,
                    scrub: 0.7,
                    onToggle: (self) => {
                        act3Active = self.isActive;
                        if (self.isActive) {
                            fpsFrames = 0;
                            fpsLastSample = performance.now();
                            updateInspectMetrics();
                        }
                    },
                },
            });

            tlAct3
                .fromTo(
                    '.ui-frame',
                    {
                        scale: 0.84,
                        borderRadius: '24px',
                        boxShadow: '0 24px 60px rgba(17, 17, 17, 0.07)',
                    },
                    {
                        scale: 1,
                        borderRadius: '0px',
                        boxShadow: '0 0px 0px rgba(17, 17, 17, 0)',
                        duration: 0.45,
                        ease: 'none',
                    },
                    0
                )
                .to(
                    '.ui-header',
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out',
                    },
                    0.22
                )
                .to(
                    '.ui-block',
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.09,
                        duration: 0.35,
                        ease: 'power2.out',
                    },
                    0.32
                )
                .to(
                    '.ui-mini-bar',
                    {
                        scaleY: 1,
                        stagger: 0.04,
                        duration: 0.35,
                        ease: 'power2.out',
                    },
                    0.45
                )
                .to(
                    '.ui-bar-fill',
                    {
                        scaleX: (_, el) =>
                            parseFloat(
                                getComputedStyle(el).getPropertyValue('--target-scale')
                            ) || 1,
                        stagger: 0.06,
                        duration: 0.38,
                        ease: 'power2.out',
                    },
                    0.5
                )
                .to({}, { duration: 0.25 });
        } else {
            // Móvil y pantallas cortas: entrada elegante de tarjeta + revelación fluida por bloque
            ScrollTrigger.create({
                trigger: '.act-3',
                start: 'top bottom',
                end: 'bottom top',
                onToggle: (self) => {
                    act3Active = self.isActive;
                    if (self.isActive) {
                        fpsFrames = 0;
                        fpsLastSample = performance.now();
                    }
                },
            });

            gsap.fromTo(
                '.ui-frame',
                {
                    scale: 0.94,
                    borderRadius: '22px',
                    boxShadow: '0 18px 46px rgba(17, 17, 17, 0.08)',
                },
                {
                    scale: 1,
                    borderRadius: '0px',
                    boxShadow: '0 0px 0px rgba(17, 17, 17, 0)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.act-3',
                        start: 'top 92%',
                        end: 'top 22%',
                        scrub: true,
                    },
                }
            );

            gsap.to('.ui-header', {
                opacity: 1,
                y: 0,
                duration: 0.45,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.ui-header',
                    start: 'top 88%',
                    toggleActions: 'play none none reverse',
                },
            });

            gsap.utils.toArray('.ui-block').forEach((block) => {
                gsap.to(block, {
                    opacity: 1,
                    y: 0,
                    duration: 0.45,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: block,
                        start: 'top 88%',
                        toggleActions: 'play none none reverse',
                    },
                });
            });

            gsap.to('.ui-mini-bar', {
                scaleY: 1,
                stagger: 0.05,
                duration: 0.4,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.ui-block--product',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
            });

            gsap.to('.ui-bar-fill', {
                scaleX: (_, el) =>
                    parseFloat(
                        getComputedStyle(el).getPropertyValue('--target-scale')
                    ) || 1,
                stagger: 0.08,
                duration: 0.45,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.ui-block--perf',
                    start: 'top 82%',
                    toggleActions: 'play none none reverse',
                },
            });
        }

        // --- ACTO 4: Judo (Marco GTA expandible simétrico + Canvas Scrubbing) ---
        if (judoScrubber) {
            const playhead = { frame: 0 };

            const tlAct4 = gsap.timeline({
                scrollTrigger: {
                    trigger: '.act-4',
                    start: 'top top',
                    end: isDesktop ? '+=320%' : '+=200%',
                    pin: true,
                    scrub: 0.5,
                },
            });

            // A) fromTo con exactamente 2 valores (vertical/horizontal) -> cero saltos
            tlAct4.fromTo(
                '.judo-frame',
                {
                    clipPath: isDesktop
                        ? 'inset(16% 24% round 16px)'
                        : 'inset(8% 6% round 12px)',
                },
                {
                    clipPath: 'inset(0% 0% round 0px)',
                    duration: 0.35,
                    ease: 'none',
                },
                0
            );

            // B) Scrubbing de fotogramas durante todo el tramo
            tlAct4.to(
                playhead,
                {
                    frame: judoScrubber.frameCount - 1,
                    duration: 1,
                    ease: 'none',
                    onUpdate: () => judoScrubber.render(playhead.frame),
                },
                0
            );

            // C) Aparición del copy cuando el marco ya ocupa la pantalla
            tlAct4.to(
                '.judo-copy',
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.25,
                    ease: 'power2.out',
                },
                0.4
            );
        }
    }
);