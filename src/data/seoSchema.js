import { CONTACT, HACKATHONS, WEB_PROJECTS } from './projects.js';

export function buildPortfolioSchema(siteUrl) {
    const base = String(siteUrl).replace(/\/$/, '');
    const personId = `${base}/#person`;
    const websiteId = `${base}/#website`;
    const profilePageId = `${base}/#profilepage`;

    const projectItems = [
        {
            '@type': 'CreativeWork',
            name: 'BPI València — Buscador Plenario Inteligente',
            description:
                'Sistema de transcripción, diarización y agente conversacional con IA para consultar en segundos los plenos del Ayuntamiento de València.',
            creator: { '@id': personId },
            inLanguage: 'es',
        },
        {
            '@type': 'CreativeWork',
            name: 'Análisis Ecocardiográfico con IA — Hospital Universitari i Politècnic La Fe',
            description:
                'Mejora de modelos de extracción de variables ecocardiográficas mediante transferencia de aprendizaje sobre la última capa de PanEcho.',
            creator: { '@id': personId },
            inLanguage: 'es',
        },
        ...WEB_PROJECTS.map((project) => ({
            '@type': 'CreativeWork',
            name: project.title,
            description: project.description,
            url: project.url,
            image: `${base}${project.image}`,
            creator: { '@id': personId },
            inLanguage: 'es',
        })),
    ];

    const awards = HACKATHONS.filter((h) => h.badgeType !== 'neutral').map(
        (h) => `${h.badge.replace(/^🏆\s*/, '')} — ${h.title}`
    );

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Person',
                '@id': personId,
                name: 'Iker Cuadros Ruiz',
                url: `${base}/`,
                image: `${base}/og-cover.png`,
                email: `mailto:${CONTACT.email}`,
                jobTitle: 'Científico de Datos y Diseñador Web',
                description:
                    'Perfil híbrido en València especializado en ciencia de datos, inteligencia artificial aplicada y diseño web editorial de alto rendimiento.',
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'València',
                    addressRegion: 'Comunitat Valenciana',
                    addressCountry: 'ES',
                },
                sameAs: [CONTACT.linkedin, CONTACT.github],
                knowsAbout: [
                    'Ciencia de Datos',
                    'Inteligencia Artificial',
                    'Machine Learning',
                    'Deep Learning',
                    'Procesamiento del Lenguaje Natural',
                    'Diseño Web',
                    'Desarrollo Frontend',
                    'Visualización de Datos',
                    'Astro',
                    'Power BI',
                ],
                award: awards,
            },
            {
                '@type': 'WebSite',
                '@id': websiteId,
                url: `${base}/`,
                name: 'Iker Cuadros Ruiz — Portfolio',
                inLanguage: 'es-ES',
                publisher: { '@id': personId },
            },
            {
                '@type': 'ProfilePage',
                '@id': profilePageId,
                url: `${base}/`,
                name: 'Iker Cuadros Ruiz — Ciencia de Datos y Diseño Web | València',
                inLanguage: 'es-ES',
                isPartOf: { '@id': websiteId },
                mainEntity: { '@id': personId },
            },
            {
                '@type': 'ItemList',
                '@id': `${base}/#projects`,
                name: 'Proyectos destacados de Iker Cuadros Ruiz',
                itemListElement: projectItems.map((item, idx) => ({
                    '@type': 'ListItem',
                    position: idx + 1,
                    item,
                })),
            },
        ],
    };
}
