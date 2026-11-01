// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

/**
 * Domínio do site: dsciconsult.com (informado pela usuária em 31/10/2026). Pode ser trocado
 * pela variável de ambiente SITE_URL sem editar código. Canonical, sitemap, robots, Open
 * Graph e JSON-LD seguem este valor.
 */
const SITE_URL = (process.env.SITE_URL || 'https://dsciconsult.com').replace(/\/+$/, '');

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  // Astro 7 colapsa espaço entre elementos irmãos por padrão ('jsx'); o texto do site
  // tem muitos <strong>/<a> no meio de frases, então mantemos o comportamento clássico.
  compressHTML: true,
  // CSS embutido no HTML: nenhuma requisição de CSS bloqueando a renderização (PageSpeed).
  build: { format: 'directory', inlineStylesheets: 'always' },
  adapter: vercel({ imageService: false }),
  // Prefetch próprio no fim da página (src/scripts/site.ts): o do Astro entrava no <head>.
  prefetch: false,
  image: {
    // AVIF e WebP gerados no build a partir dos PNG de src/assets/images
    responsiveStyles: true,
  },
});
