#!/usr/bin/env node
/**
 * Gera os arquivos de marca em public/ (rodar só quando a marca mudar: npm run og).
 * favicon-32.png, apple-touch-icon.png, logo-d-sci-consulting.png (512, para o schema) e
 * og-default.png (1200x630). Texto em fonte do sistema: gerado uma vez e versionado.
 */
import sharp from 'sharp';
import fs from 'node:fs';

const fav = fs.readFileSync('public/favicon.svg');
await sharp(fav).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(fav).resize(180, 180).png().toFile('public/apple-touch-icon.png');

// Logo vetorial (mesmos contornos do site: scripts/make-logo.mjs)
const L = JSON.parse(fs.readFileSync('src/assets/logo/logo-paths.json', 'utf8'));
const [, vy] = L.viewBox.split(' ').map(Number);
const logoAt = (x, y, h, textColor) => {
  const s = h / L.height;
  return `<g transform="translate(${x} ${y}) scale(${s}) translate(0 ${-vy})"><path d="${L.bracket}" fill="#00c896"/><path d="${L.name}" fill="${textColor}"/><path d="${L.sub}" fill="${textColor}"/></g>`;
};
const font = "font-family:'Segoe UI Variable Display','Segoe UI',Arial,sans-serif";

const lw = (h) => (h * L.width) / L.height;
const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0a2f5b"/>
  ${logoAt((512 - lw(200)) / 2, 156, 200, '#fff')}
</svg>`;
await sharp(Buffer.from(logo)).png().toFile('public/logo-d-sci-consulting.png');

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a2f5b"/>
  <rect x="0" y="560" width="1200" height="70" fill="#061b36"/>
  ${logoAt(96, 70, 140, '#fff')}
  <text x="96" y="380" style="${font};font-weight:600;font-size:76px;letter-spacing:-2px" fill="#fff">Fewer studies.</text>
  <text x="96" y="466" style="${font};font-weight:600;font-size:76px;letter-spacing:-2px" fill="#00c896">The right studies.</text>
  <text x="96" y="604" style="${font};font-weight:400;font-size:26px" fill="#e6eef4">Regulatory toxicology · Nonclinical strategy · NAMs</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile('public/og-default.png');
console.log('[og] public/: favicon-32.png, apple-touch-icon.png, logo-d-sci-consulting.png, og-default.png');
