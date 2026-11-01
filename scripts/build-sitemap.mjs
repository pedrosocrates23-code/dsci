#!/usr/bin/env node
/**
 * Monta o /sitemap.xml AUTOMATICAMENTE a partir do que o build gerou: toda página nova e
 * indexável entra sozinha, sem lista manual (regra da casa: um /sitemap.xml único, <urlset>).
 *
 * Para cada index.html do build:
 *   - pula o 404 e as páginas com meta robots noindex;
 *   - <loc>     = o canonical da página (já no domínio certo);
 *   - <lastmod> = <meta name="dsci:updated"> (data da última mudança de conteúdo); sem ela,
 *                 o <lastmod> é omitido em vez de inventar data.
 * Roda no `npm run build`, antes das travas (check-sitemap e check-seo).
 */
import fs from 'node:fs';
import path from 'node:path';

const outDirs = ['.vercel/output/static', 'dist/client', 'dist'].filter((d) => fs.existsSync(path.join(d, 'index.html')));
if (!outDirs.length) { console.error('[sitemap] build não encontrado'); process.exit(1); }
const DIST = outDirs[0];

const walk = (dir, cb) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const f = path.join(dir, e.name); e.isDirectory() ? walk(f, cb) : cb(f); } };
const robotsOf = (html) => html.match(/<meta[^>]+name=["']robots["'][^>]*>/i)?.[0] ?? '';

const urls = [];
walk(DIST, (f) => {
  if (path.basename(f) !== 'index.html') return;
  const html = fs.readFileSync(f, 'utf8');
  if (/noindex/i.test(robotsOf(html))) return;
  const loc = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!loc) return;
  const lastmod = html.match(/<meta name="dsci:updated" content="(\d{4}-\d{2}-\d{2})"/)?.[1];
  urls.push({ loc, lastmod });
});

// Ordem estável: home primeiro, depois por caminho.
urls.sort((a, b) => (new URL(a.loc).pathname === '/' ? -1 : new URL(b.loc).pathname === '/' ? 1 : a.loc.localeCompare(b.loc)));
const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') +
  '\n</urlset>\n';
for (const d of outDirs) fs.writeFileSync(path.join(d, 'sitemap.xml'), xml);
console.log(`[sitemap] /sitemap.xml com ${urls.length} URLs (${urls.filter((u) => !u.lastmod).length} sem lastmod)`);
