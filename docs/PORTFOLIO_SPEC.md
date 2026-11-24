# Especificación del Portfolio — Scrollytelling Híbrido (Data Science + Diseño Web)

## 1. Objetivo y posicionamiento
Portfolio personal para un perfil híbrido de **Científico de Datos y Diseñador Web**.
- Debe mostrar dominio técnico y criterio estético desde el primer segundo mediante *scrollytelling*, pero sin sacrificar usabilidad (navegación fija siempre visible hacia **Proyectos** y **Contacto**).
- Hilo conductor narrativo: ***Seiryoku Zenyo*** (principio del judo: máxima eficiencia mediante técnica, equilibrio y cuidado artesanal en cada detalle), aplicado al paso del caos de los datos al orden de una interfaz limpia.

## 2. Dirección de arte ("Apple editorial + coreografía GTA")
- **Estética:** Clara, luminosa, editorial y minimalista. Evitar estéticas oscuras genéricas o neones.
- **Paleta:**
  - Fondo principal: `#F7F7F5` (blanco roto cálido)
  - Superficies/tarjetas: `#ECECE8` y `#FFFFFF`
  - Tinta principal: `#111111` (grafito) | Secundaria: `#666662`
  - Acento único (quirúrgico): `#1D4ED8` (azul índigo — datos técnicos + judogi azul)
  - Contraste dramático reservado únicamente para el Acto 4 (Judo en blanco y negro de alto contraste).
- **Tipografía:** Sans-serif geométrica limpia (`Plus Jakarta Sans`) para titulares + monoespaciada (`JetBrains Mono`) para etiquetas técnicas, índices y métricas.

## 3. Stack técnico y arquitectura
- **Framework:** Astro (HTML estático, cero JS innecesario en el *scrollytelling*).
- **Scroll y animación:** GSAP (`ScrollTrigger`) + Lenis (sincronizados en `gsap.ticker` con `lagSmoothing(0)`).
- **Gráficos Actos 1 y 2:** Canvas 2D nativo (o WebGL muy ligero) a 60 FPS.
- **Acto 4 (Judo):** Secuencia de fotogramas WebP (~90 frames, 3s a 30fps) renderizada en `<canvas>` (*canvas scrubbing* estilo Apple con precarga en `requestIdleCallback`).
- **Acto 5 (Proyectos):** Islas interactivas de Astro (React/D3 solo donde hagan falta demos reales) y estructura modular fácil de actualizar.

## 4. Escaleta de 5 actos
1. **Acto 1 — El Caos (Hero):** Titular principal + partículas sutiles en desorden a pantalla completa. Al hacer scroll, el titular se acerca y desaparece mientras las mismas partículas se recogen dentro del marco editorial del Acto 2 sin cortes de sección.
2. **Acto 2 — La Estructura (Ciencia de Datos):** En continuidad directa sobre el mismo `<canvas>`, las partículas ya encuadradas pasan del ruido a una curva de regresión en `#1D4ED8` con dos tiempos de texto (*"Los datos sin contexto son solo ruido."* → *"Mi trabajo empieza encontrando el patrón."*).
3. **Acto 3 — La Forma (Diseño Web):** Expansión limpia de tarjeta editorial a pantalla completa (`scale` + `border-radius`, sin `clip-path`) revelando cabecera y retícula de interfaz de 12 columnas.
4. **Acto 4 — El Equilibrio (Judo):** Ventana editorial en blanco y negro que se expande a pantalla completa estilo GTA mediante `clip-path` mientras el scroll controla fotograma a fotograma un clip de 3s en el tatami.
5. **Acto 5 — La Prueba (Proyectos):** Scroll natural. Tarjetas interactivas con previsualización y mini-demos reales, incluyendo:
   - **Analizador de Plenos del Ayuntamiento de València** (mini-demo interactiva de datos/IA).
   - **Web oficial del Club de Judo** (vista previa y acceso directo).

## 5. Reglas técnicas estrictas (lecciones ya verificadas)
- **Prohibido hacer scroll scrubbing con `<video>` (`currentTime`).** Usar siempre secuencia WebP sobre `<canvas>` con ajuste proporcional tipo `object-fit: cover` y soporte DPR (`<= 2`).
- **Consistencia de `clip-path` en GSAP:** Usar siempre `gsap.fromTo()` con exactamente 2 valores (`inset(Y% X% round Rpx)` → `inset(0% 0% round 0px)`) para evitar saltos asimétricos por simplificación del navegador.
- **No escalar elementos pequeños hacia arriba:** Dar al elemento su tamaño final en CSS y animar desde `scale < 1` hacia `1` para mantener bordes nítidos.
- **Responsive obligatorio:** Mantener `gsap.matchMedia()` para acortar recorridos de scroll y simplificar animaciones en móvil (`<= 768px`).

## 6. Roadmap por hitos
- [x] **Hito 1:** Estructura Astro + GSAP + Lenis y *greybox* de los 5 actos con ritmo de scroll validado.
- [x] **Hito 2A:** Sustituir el placeholder de los Actos 1 y 2 por un `<canvas>` de partículas reales (caos → patrón de datos).
- [x] **Hito 2B:** Integrar secuencia WebP real en `public/frames/judo/` activando `USE_REAL_FRAMES = true` en `judoCanvas.js`.
- [x] **Hito 3:** Diseñar sección de proyectos (Acto 5) e integrar la vista previa de la web del club de judo y la mini-demo del analizador de plenos de València.