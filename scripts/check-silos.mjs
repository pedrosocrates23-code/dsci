#!/usr/bin/env node
/**
 * Trava dos silos de serviço no HTML gerado (plano SILOS-SEMANTICOS-2026-11-02, seção 6):
 *  1. Fluxo ascendente: toda filha linka a mãe e toda neta linka a filha.
 *  2. Âncora exata: todo <a> que aponta para um nó usa a âncora registrada em silos.json, e uma
 *     âncora registrada nunca aponta para outro destino (ex.: termo da filha linkando a mãe).
 *  3. Toda neta tem o formulário com o campo oculto `service`.
 *  + toda página de silo fecha com a seção References com pelo menos 1 link externo.
 * Vale para o site inteiro (Home, Services, blog), não só para as páginas dos silos.
 */
import fs from 'node:fs';
import path from 'node:path';
import { findDist } from './_dist.mjs';

const DIST = findDist();
const { nodes } = JSON.parse(fs.readFileSync('src/config/silos.json', 'utf8'));
const byId = new Map(nodes.map((n) => [n.id, n]));
const chain = (id) => { const c = []; for (let n = byId.get(id); n; n = n.parent ? byId.get(n.parent) : null) c.unshift(n); return c; };
const pathOf = (id) => `/services/${chain(id).map((n) => n.slug).join('/')}/`;
const byPath = new Map(nodes.map((n) => [pathOf(n.id), n]));
const byAnchor = new Map(nodes.map((n) => [n.anchor.toLowerCase(), n]));

const walk = (dir, cb) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const f = path.join(dir, e.name); e.isDirectory() ? walk(f, cb) : cb(f); } };
const rota = (f) => '/' + path.relative(DIST, f).split(path.sep).join('/').replace(/index\.html$/, '');
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;/g, "'");
const text = (html) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const norm = (href) => { try { const u = new URL(href, 'https://x'); return u.host === 'x' || /dsciconsult\.com$/.test(u.host) ? u.pathname : null; } catch { return null; } };

const erros = [];
const vivos = [];
walk(DIST, (f) => {
  if (path.basename(f) !== 'index.html') return;
  const r = rota(f);
  const html = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  const err = (m) => erros.push(`${r}: ${m}`);
  const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({ href: m[1].match(/href="([^"]*)"/)?.[1] ?? '', txt: text(m[2]) }));

  // Regra 2, no site inteiro.
  for (const { href, txt } of links) {
    const p = norm(href);
    if (p && byPath.has(p)) {
      const alvo = byPath.get(p);
      if (txt.toLowerCase() !== alvo.anchor.toLowerCase()) err(`link para ${alvo.id} com âncora "${txt}" (registrada: "${alvo.anchor}")`);
    }
    const dono = byAnchor.get(txt.toLowerCase());
    if (dono && p !== pathOf(dono.id)) err(`âncora "${txt}" é do nó ${dono.id} e aponta para ${href}`);
  }

  const no = byPath.get(r);
  if (!no) return;
  vivos.push(`${no.id.padEnd(6)} ${r}`);
  const nivel = no.id.split('.').length;
  // Regra 1.
  if (no.parent && !links.some((l) => norm(l.href) === pathOf(no.parent))) err(`sem link para o pai ${no.parent}`);
  // Regra 3.
  if (nivel === 3 && !/data-contact-form/.test(html)) err('neta sem formulário');
  if (nivel === 3 && !/name="service"/.test(html)) err('neta sem o campo oculto service');
  // Referências.
  const refs = html.match(/<section[^>]*class="silo-refs[\s\S]*?<\/section>/)?.[0] ?? '';
  if (!/href="https?:\/\//.test(refs)) err('sem seção References com fonte externa');
});

console.log(`[check-silos] ${vivos.length} página(s) de silo no ar`);
vivos.sort().forEach((v) => console.log('  ' + v));
if (erros.length) { erros.forEach((e) => console.error('  ' + e)); console.error(`[check-silos] REPROVADO: ${erros.length}`); process.exit(1); }
console.log('[check-silos] OK');
