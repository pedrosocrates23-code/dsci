import fs from 'node:fs';
/** Onde o HTML estático fica depois do build (com o adaptador Vercel ou sem). */
export function findDist() {
  for (const d of ['.vercel/output/static', 'dist/client', 'dist']) {
    if (fs.existsSync(`${d}/index.html`)) return d;
  }
  throw new Error('[check] build não encontrado (.vercel/output/static, dist/client ou dist)');
}
