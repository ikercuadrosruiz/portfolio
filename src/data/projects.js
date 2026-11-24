export const BPI_DEMO_QUERIES = [
    {
        id: 'movilidad',
        label: 'Movilidad',
        question: '¿Qué medidas sobre movilidad y carriles bici se debatieron en el último pleno?',
        answer: 'Se aprobó la revisión del plan de conexión de carriles bici en accesos norte y la reorganización de frecuencias de la EMT en horas punta, con enmiendas sobre señalización en cruces escolares.',
        speaker: 'Orador 04 · Área de Movilidad',
        timestamp: '01:14:22',
        saved: 'Respuesta en 1.2 s · Pleno de 4 h 12 min',
    },
    {
        id: 'vivienda',
        label: 'Vivienda',
        question: '¿Qué acuerdos se mencionaron sobre vivienda pública y alquiler?',
        answer: 'Se expuso el calendario de licitación de nuevas parcelas municipales destinadas a alquiler asequible y la agilización de licencias urbanísticas para rehabilitación energética.',
        speaker: 'Orador 07 · Concejalía de Urbanismo',
        timestamp: '02:08:45',
        saved: 'Respuesta en 1.1 s · Pleno de 4 h 12 min',
    },
    {
        id: 'presupuestos',
        label: 'Presupuestos',
        question: 'Resume las partidas principales aprobadas para inversión en barrios.',
        answer: 'Las inversiones priorizan la renovación de alumbrado eficiente, mejora de zonas verdes y equipamiento deportivo de proximidad, con seguimiento trimestral de ejecución.',
        speaker: 'Orador 02 · Hacienda Municipal',
        timestamp: '00:46:10',
        saved: 'Respuesta en 0.9 s · Pleno de 4 h 12 min',
    },
];

export const WEB_PROJECTS = [
    {
        id: 'valocoach',
        title: 'ValoCoach AI',
        tag: 'IA & Producto Web',
        categories: ['ai', 'web'],
        description:
            'Analista inteligente para partidas de Valorant. Examina tus estadísticas reales, identifica errores repetidos y te propone mejoras concretas como un entrenador personal.',
        url: 'https://valocoach-ai.vercel.app/',
        domain: 'valocoach-ai.vercel.app',
        cta: 'Probar ValoCoach AI',
        image: '/images/projects/valocoach-web.webp',
        imageWidth: 1296,
        imageHeight: 906,
        imageAlt: 'Vista previa de la aplicación web ValoCoach AI',
        stack: ['IA Aplicada', 'Analítica de partidas', 'Web App'],
    },
    {
        id: 'valyesa',
        title: 'Valyesa — Yeso y Alta Decoración',
        tag: 'Diseño & Desarrollo Web',
        categories: ['web'],
        description:
            'Web corporativa para un profesional autónomo del yeso y la alta decoración. Pensada para transmitir oficio artesanal, mostrar trabajos reales y facilitar el contacto directo.',
        url: 'https://www.valyesa.com/',
        domain: 'valyesa.com',
        cta: 'Visitar valyesa.com',
        image: '/images/projects/valyesa-web.webp',
        imageWidth: 1280,
        imageHeight: 882,
        imageAlt: 'Vista previa de la web de Valyesa Yeso y Alta Decoración',
        stack: ['Diseño Editorial', 'SEO Local', 'Responsive'],
    },
    {
        id: 'judo-canet',
        title: 'Judo Club Canet',
        tag: 'Diseño & Desarrollo Web',
        categories: ['web'],
        description:
            'Web oficial del club de judo. Estructura clara para familias y deportistas con horarios, información de clases y una identidad digital limpia y fácil de mantener.',
        url: 'https://judoclubcanet.odoo.com/',
        domain: 'judoclubcanet.odoo.com',
        cta: 'Visitar web del club',
        image: '/images/projects/judo-canet-web.webp',
        imageWidth: 1281,
        imageHeight: 907,
        imageAlt: 'Vista previa de la web oficial del Judo Club Canet',
        stack: ['Identidad Digital', 'Arquitectura Clara', 'Odoo Web'],
    },
];

export const PRIVATE_ANALYSES = [
    {
        title: 'Satisfacción ciudadana — Ayto. de València',
        detail: 'Análisis técnico de quejas y sugerencias municipales para detectar patrones de mejora en servicios públicos.',
    },
    {
        title: 'Cuadro de mando económico en Power BI',
        detail: 'Modelado de datos financieros, seguimiento de márgenes y KPIs interactivos para toma de decisiones.',
    },
];

export const HACKATHONS = [
    {
        id: 'campus-salud-gandia',
        badge: '🏆 1er Premio',
        badgeType: 'winner',
        title: 'Campus Salud Gandía',
        meta: '30 h ininterrumpidas · Salud Pública & Datos',
        summary: 'Visor de simulación de inversión municipal contra la obesidad.',
        challenge:
            'Ayudar al Ayuntamiento de Gandía a reducir los índices de obesidad decidiendo qué iniciativas priorizar con recursos limitados.',
        approach:
            'Construimos un visor interactivo capaz de simular distintas inversiones municipales y proyectar su impacto económico y social a futuro.',
        result: 'Equipo ganador tras 30 horas de desarrollo continuo y presentación ante jurado.',
    },
    {
        id: 'semicon-startup-lab',
        badge: '🏆 Ganador',
        badgeType: 'winner',
        title: 'València Semicon Startup Lab',
        meta: 'Tecnologías Inmersivas · MedTech',
        summary: 'Interfaces físicas, hápticas y sensoriales para cirugía endovascular.',
        challenge:
            'Diseñar una solución innovadora para mejorar la precisión y el control en procedimientos de cirugía endovascular.',
        approach:
            'Planteamos un enfoque desde tecnologías inmersivas integrando interfaces físicas, hápticas y sensoriales adaptadas al entorno de quirófano.',
        result: 'Proyecto ganador del programa por viabilidad técnica e impacto clínico.',
    },
    {
        id: 'llmthon-legal-2026',
        badge: 'Finalista',
        badgeType: 'finalist',
        title: 'LLMthon Legal 2026',
        meta: 'Grant Thornton · Càtedra LegalTech & IA Minsait-UV · ETSE-UV',
        summary: 'Automatización de comparables y trazabilidad documental con LLMs.',
        challenge:
            'Automatizar la identificación y selección de empresas independientes comparables y la extracción documental de precios de transferencia.',
        approach:
            'Diseñamos un flujo con modelos de lenguaje orientado a minimizar trabajo manual garantizando trazabilidad completa de cada fuente y criterio.',
        result: 'Finalistas a las puertas del primer puesto en un reto real planteado por Grant Thornton España.',
    },
    {
        id: 'dedalus-datathon',
        badge: 'Datathon',
        badgeType: 'neutral',
        title: 'Dedalus Datathon València',
        meta: 'Salud Digital · Agentes Conversacionales',
        summary: 'Agente conversacional clínico para detectar cohortes de pacientes crónicos.',
        challenge:
            'Permitir a profesionales sanitarios identificar cohortes de pacientes crónicos (diabetes, hipertensión, EPOC) sin consultas técnicas complejas.',
        approach:
            'Desarrollamos un agente conversacional capaz de traducir preguntas clínicas en lenguaje natural a filtros precisos sobre datos de pacientes.',
        result: 'Prototipo funcional enfocado en velocidad clínica y facilidad de uso.',
    },
];

export const CONTACT = {
    email: 'ikercuadruizz@gmail.com',
    linkedin: 'https://www.linkedin.com/in/iker-cuadros-ruiz/',
    github: 'https://github.com/ikercuadrosruiz',
    location: 'VALÈNCIA · REMOTO',
};
