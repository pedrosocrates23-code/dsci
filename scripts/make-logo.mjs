#!/usr/bin/env node
/**
 * Gera a logo D-Sci Consulting em vetor (letras convertidas em contorno, sem depender de
 * fonte no navegador), reproduzindo a construção da logo de referência da cliente:
 *  - colchete alto, partido no meio, com braços longos que passam por cima do "D";
 *  - "D-Sci" em peso forte; "Consulting" mais fino, alinhado à direita do "Sci".
 * Proporções medidas na referência (unidade H = altura de maiúscula do "D-Sci").
 *
 * Saídas: src/assets/logo/logo-paths.json (usado pelo componente Logo.astro).
 * Uso: npm run logo   (depois: npm run og, para favicon/logo 512/OG)
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import opentype from 'opentype.js';

// opentype.js lê TTF/OTF; o WOFF do Fontsource é descomprimido aqui (WOFF 1.0 = tabelas zlib).
function woffToSfnt(buf) {
  const numTables = buf.readUInt16BE(12);
  const flavor = buf.readUInt32BE(4);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const o = 44 + i * 20;
    tables.push({ tag: buf.readUInt32BE(o), offset: buf.readUInt32BE(o + 4), compLength: buf.readUInt32BE(o + 8), origLength: buf.readUInt32BE(o + 12), checksum: buf.readUInt32BE(o + 16) });
  }
  const head = 12 + numTables * 16;
  let size = head;
  const datas = tables.map((t) => {
    const raw = buf.subarray(t.offset, t.offset + t.compLength);
    const data = t.compLength < t.origLength ? zlib.inflateSync(raw) : raw;
    size += (data.length + 3) & ~3;
    return data;
  });
  const out = Buffer.alloc(size);
  out.writeUInt32BE(flavor, 0); out.writeUInt16BE(numTables, 4);
  let p = head;
  tables.forEach((t, i) => {
    const r = 12 + i * 16;
    out.writeUInt32BE(t.tag, r); out.writeUInt32BE(t.checksum, r + 4); out.writeUInt32BE(p, r + 8); out.writeUInt32BE(datas[i].length, r + 12);
    datas[i].copy(out, p); p += (datas[i].length + 3) & ~3;
  });
  return out.buffer.slice(out.byteOffset, out.byteOffset + out.length);
}
const load = (w) => opentype.parse(woffToSfnt(fs.readFileSync(`node_modules/@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff`)));
const bold = load(600);
const light = load(400);

// Escala: altura de maiúscula do "D-Sci" = H unidades de desenho.
const H = 100;
const capOf = (font) => font.charToGlyph('D').getBoundingBox().y2; // altura do D em unidades da fonte
const sizeFor = (font, capH) => (capH * font.unitsPerEm) / capOf(font);

// Medidas da referência (em H): ver comentário no topo.
const T = 0.2 * H;            // espessura do colchete
const ARM = 0.87 * H;         // comprimento dos braços
const BR_TOP = -0.41 * H;     // topo do colchete (acima do topo do D)
const GAP = 0.18 * H;         // corte no meio do traço vertical
const BR_BOTTOM = H + 0.39 * H; // base do colchete (abaixo da base do D)
const D_X = T + 0.24 * H;     // início do "D" (depois do traço vertical)
const SUB_CAP = 0.385 * H;     // altura de maiúscula de "Consulting"
const SUB_BASE = H + 0.69 * H; // linha de base de "Consulting"

/**
 * Desenha o texto e troca o pingo redondo do "i" da Montserrat por um pingo QUADRADO, como na
 * referência. O pingo é o contorno mais alto do glifo "i": vira um quadrado do tamanho da
 * largura da haste, centralizado onde estava o pingo.
 */
function textPath(font, text, x, baseline, capH) {
  const size = sizeFor(font, capH);
  const path = font.getPath(text, x, baseline, size);
  // posição de cada "i" no texto (avanço com kerning, igual ao getPath)
  const glyphs = font.stringToGlyphs(text);
  let cursor = x;
  const iSpans = [];
  glyphs.forEach((g, k) => {
    const adv = (g.advanceWidth ?? 0) * (size / font.unitsPerEm);
    if (text[k] === 'i') iSpans.push([cursor, cursor + adv]);
    let kern = 0;
    if (k < glyphs.length - 1) kern = font.getKerningValue(g, glyphs[k + 1]) * (size / font.unitsPerEm);
    cursor += adv + kern;
  });
  // divide em contornos
  const contours = [];
  for (const c of path.commands) { if (c.type === 'M') contours.push([]); contours[contours.length - 1].push(c); }
  const bbox = (cs) => {
    const xs = [], ys = [];
    for (const c of cs) for (const [kx, ky] of [['x', 'y'], ['x1', 'y1'], ['x2', 'y2']]) if (c[kx] !== undefined) { xs.push(c[kx]); ys.push(c[ky]); }
    return { x1: Math.min(...xs), x2: Math.max(...xs), y1: Math.min(...ys), y2: Math.max(...ys) };
  };
  const parts = [];
  for (const cs of contours) {
    const b = bbox(cs);
    const cx = (b.x1 + b.x2) / 2;
    const isDot = iSpans.some(([a, z]) => cx > a && cx < z) && b.y2 < baseline - capH * 0.75 && (b.x2 - b.x1) < capH * 0.4;
    if (isDot) {
      // haste do mesmo "i": contorno logo abaixo, no mesmo intervalo horizontal
      const stem = contours.map(bbox).find((s) => s !== b && s.x1 < cx && s.x2 > cx && s.y1 > b.y2);
      const w = stem ? stem.x2 - stem.x1 : b.x2 - b.x1;
      const sx = stem ? stem.x1 : cx - w / 2;
      const sy = (b.y1 + b.y2) / 2 - w / 2;
      parts.push(`M${sx.toFixed(2)} ${sy.toFixed(2)}h${w.toFixed(2)}v${w.toFixed(2)}h${(-w).toFixed(2)}Z`);
    } else {
      const sub = new opentype.Path(); sub.commands = cs; parts.push(sub.toPathData(2));
    }
  }
  return { d: parts.join(''), box: path.getBoundingBox() };
}
const name = textPath(bold, 'D-Sci', D_X, H, H);
const nameRight = name.box.x2;
// "Consulting" alinhado à direita do "Sci"
const tmp = textPath(light, 'Consulting', 0, SUB_BASE, SUB_CAP);
const sub = textPath(light, 'Consulting', nameRight - tmp.box.x2, SUB_BASE, SUB_CAP);

const mid = (BR_TOP + BR_BOTTOM) / 2;
const bracket = [
  // peça de cima
  `M0 ${BR_TOP}H${ARM}V${BR_TOP + T}H${T}V${mid - GAP / 2}H0Z`,
  // peça de baixo
  `M0 ${mid + GAP / 2}H${T}V${BR_BOTTOM - T}H${ARM}V${BR_BOTTOM}H0Z`,
].join('');

const minY = BR_TOP;
const maxY = Math.max(BR_BOTTOM, sub.box.y2);
const width = Math.max(nameRight, sub.box.x2);
const out = {
  viewBox: `0 ${minY.toFixed(2)} ${width.toFixed(2)} ${(maxY - minY).toFixed(2)}`,
  width: +width.toFixed(2),
  height: +(maxY - minY).toFixed(2),
  bracket,
  name: name.d,
  sub: sub.d,
};
fs.mkdirSync('src/assets/logo', { recursive: true });
fs.writeFileSync('src/assets/logo/logo-paths.json', JSON.stringify(out, null, 2));
console.log(`[logo] viewBox ${out.viewBox} (proporção ${(out.width / out.height).toFixed(3)})`);
