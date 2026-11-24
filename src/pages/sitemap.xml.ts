import type { APIRoute } from 'astro';

const ROUTES = [
    { path: '/', changefreq: 'monthly', priority: '1.0' },
];

export const GET: APIRoute = ({ site }) => {
    const baseUrl = site ?? new URL('https://ikercuadrosruiz.com');
    const lastmod = new Date().toISOString().split('T')[0];

    const urls = ROUTES.map(({ path, changefreq, priority }) => {
        const loc = new URL(path, baseUrl).href;
        return [
            '  <url>',
            `    <loc>${loc}</loc>`,
            `    <lastmod>${lastmod}</lastmod>`,
            `    <changefreq>${changefreq}</changefreq>`,
            `    <priority>${priority}</priority>`,
            '  </url>',
        ].join('\n');
    }).join('\n');

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urls,
        '</urlset>',
        '',
    ].join('\n');

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
        },
    });
};
