#!/usr/bin/env node
/**
 * Conferência de SEO on-page no HTML gerado (o que de fato vai ao ar):
 *  - <html lang="en">, 1 único <h1>, <title> (até 65 car.) e meta description (80 a 155 car.)
 *  - toda página indexável carimba <meta name="dsci:updated"> (lastmod do sitemap)
 *  - canonical absoluto apontando para a própria URL
 *  - JSON-LD válido; nó Organization completo SÓ em /about/; Person SÓ na página de autora
 *  - nenhum placeholder "[" publicado em title/description, nenhuma palavra "guarantee"
 */
import fs from 'node:fs';
import path from 'node:path';
import { findDist } from './_dist.mjs';

const DIST = findDist();
const walk = (dir, cb) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const f = path.join(dir, e.name); e.isDirectory() ? walk(f, cb) : cb(f); } };
const rota = (f) => '/' + path.relative(DIST, f).split(path.sep).join('/').replace(/index\.html$/, '');
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const erros = [];
const linhas = [];
walk(DIST, (f) => {
  if (path.basename(f) !== 'index.html') return;
  const r = rota(f);
  const html = fs.readFileSync(f, 'utf8');
  const err = (m) => erros.push(`${r}: ${m}`);
  if (!/<html lang="en"/.test(html)) err('lang != en');
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(`${h1} <h1>`);
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
  if (!title) err('sem <title>'); else if (title.length > 65) err(`title com ${title.length} car. (limite: 65)`);
  if (!desc) err('sem meta description'); else if (desc.length < 80 || desc.length > 155) err(`description com ${desc.length} car. (limite: 80 a 155)`);
  const indexavel = !/<meta[^>]+name="robots"[^>]*noindex/i.test(html);
  if (indexavel && r !== '/404/' && !/<meta name="dsci:updated" content="\d{4}-\d{2}-\d{2}"/.test(html)) err('página indexável sem dsci:updated (lastmod)');
  if (/\[/.test(title + desc)) err('placeholder [ ] publicado');
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canon) err('sem canonical'); else if (new URL(canon).pathname !== r) err(`canonical aponta para ${canon}`);
  if (/\bguarantee/i.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) err('texto com "guarantee" (restrição do prompt)');
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let g; try { g = JSON.parse(m[1]); } catch { err('JSON-LD inválido'); continue; }
    const nodes = g['@graph'] ?? [g];
    const fullOrg = nodes.some((n) => n['@type'] === 'Organization');
    const person = nodes.some((n) => n['@type'] === 'Person');
    if (fullOrg && r !== '/about/') err('nó Organization completo fora de /about/');
    if (person && !r.startsWith('/authors/')) err('nó Person fora da página de autora');
    if (/founder|worksFor/.test(m[1])) err('founder/worksFor na fase 1');
  }
  linhas.push(`${r.padEnd(42)} ${String(title.length).padStart(3)} | ${String(desc.length).padStart(3)}`);
});
console.log('[check-seo] rota                                       title | desc');
linhas.sort().forEach((l) => console.log('  ' + l));
if (erros.length) { erros.forEach((e) => console.error('  ' + e)); console.error(`[check-seo] REPROVADO: ${erros.length}`); process.exit(1); }
console.log('[check-seo] OK');
