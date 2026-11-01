#!/usr/bin/env node
/**
 * Trava de build (regra da casa, 08/10 e 31/10/2026): /sitemap.xml é um <urlset> único com
 * todas as URLs, e toda página indexável do build está nele.
 *   1. /sitemap.xml é <urlset> (nunca <sitemapindex>) e não existe sitemap-index.xml;
 *   2. toda página indexável (index.html sem noindex próprio) está no sitemap;
 *   3. toda URL do sitemap existe no build e não é noindex.
 * Domínio pendente (host .invalid): as páginas saem com noindex marcado data-domain-pending,
 * provisório, que NÃO tira a página da conta.
 */
import fs from 'node:fs';
import path from 'node:path';
import { findDist } from './_dist.mjs';

const DIST = findDist();
const walk = (dir, cb) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const f = path.join(dir, e.name); e.isDirectory() ? walk(f, cb) : cb(f); } };
const rota = (f) => '/' + path.relative(DIST, f).split(path.sep).join('/').replace(/index\.html$/, '');
const noindexReal = (html) => {
  const m = html.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
  if (!m) return false;
  return /noindex/i.test(m[0]) && !/data-domain-pending=["']true["']/i.test(m[0]);
};

const erros = [];
const xml = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
if (!/<urlset[\s>]/.test(xml) || /<sitemapindex[\s>]/.test(xml)) erros.push('sitemap.xml não é um <urlset> (virou índice?)');
if (fs.existsSync(path.join(DIST, 'sitemap-index.xml'))) erros.push('existe sitemap-index.xml: a regra é um /sitemap.xml único');

const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const noSitemap = new Set(locs);
if (noSitemap.size !== locs.length) erros.push('URL repetida no sitemap');

const paginas = new Map();
walk(DIST, (f) => {
  if (path.basename(f) !== 'index.html') return;
  const r = rota(f);
  if (r === '/404/') return;
  paginas.set(r, noindexReal(fs.readFileSync(f, 'utf8')));
});

for (const [r, ni] of paginas) if (!ni && !noSitemap.has(r)) erros.push(`página indexável fora do sitemap: ${r}`);
for (const r of noSitemap) {
  if (!paginas.has(r)) erros.push(`URL do sitemap sem página no build: ${r}`);
  else if (paginas.get(r)) erros.push(`página noindex dentro do sitemap: ${r}`);
}

console.log(`[check-sitemap] ${noSitemap.size} URLs no /sitemap.xml; ${[...paginas.values()].filter((v) => !v).length} páginas indexáveis`);
if (erros.length) { erros.forEach((e) => console.error('  ' + e)); console.error(`[check-sitemap] REPROVADO: ${erros.length}`); process.exit(1); }
console.log('[check-sitemap] OK');
