# Portfolio — Iker Cuadros Ruiz

Portfolio personal en formato *scrollytelling* para un perfil híbrido de **Ciencia de Datos, Inteligencia Artificial y Diseño Web** ([ikercuadrosruiz.com](https://ikercuadrosruiz.com)).

## Arquitectura y Stack

- **Framework:** [Astro](https://astro.build) (HTML estático optimizado, cero JS innecesario).
- **Coreografía de scroll:** GSAP (`ScrollTrigger` + `gsap.matchMedia`) sincronizado con Lenis a 60 FPS.
- **Actos 1 y 2 (Caos → Estructura):** `<canvas>` 2D nativo unificado con `Float32Array` y `DPR <= 2`.
- **Acto 3 (Diseño de Interfaces):** Retícula interactiva de 12 columnas con comparador de claridad, medidor de FPS reales en vivo y modos de inspección (`Diseño final`, `Columnas`, `Medidas`, `Boceto`).
- **Acto 4 (Seiryoku Zenyo — Judo):** *Canvas scrubbing* con secuencia WebP en B&N de alto contraste (120 frames en escritorio / 60 frames adaptativos en móvil).
- **Acto 5 (Proyectos, Hackatones y Contacto):** Estructura modular en `src/data/projects.js` con mini-demo interactiva de BPI València, casos reales y acordeón de reconocimientos.
- **SEO Técnico:** `robots.txt` y `sitemap.xml` dinámicos, `canonical`, Open Graph (`og-cover.png`), JSON-LD Schema.org (`Person`, `WebSite`, `ProfilePage`, `ItemList`), `prefers-reduced-motion` y cabeceras de caché inmutable en `vercel.json`.

## Comandos locales

```bash
npm install      # Instalar dependencias
npm run dev      # Servidor local en http://localhost:4321
npm run build    # Generar versión de producción en ./dist
npm run preview  # Previsualizar el build de producción
```
