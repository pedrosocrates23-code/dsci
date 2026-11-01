import type { ImageMetadata } from 'astro';

/**
 * Imagens do site. Os arquivos-mestre ficam em C:\Users\User\Downloads\d-sci-consulting-imagens\
 * e são copiados para src/assets/images/ com o MESMO nome. Para trocar uma imagem por uma
 * versão melhor, substitua o arquivo aqui com o mesmo nome: o build gera AVIF/WebP sozinho.
 *
 * Imagem ausente não quebra o build: o componente cai num fundo navy com o padrão da marca.
 */
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/*.{png,jpg,jpeg,webp}', {
  eager: true,
});

export type ImageKey =
  | 'home-hero'
  | 'nams-strategy-hero'
  | 'services-hero'
  | 'how-we-work-hero'
  | 'about-hero'
  | 'contact-hero'
  | 'blog-hero';

export const IMAGE_ALT: Record<ImageKey, string> = {
  'home-hero': 'Modern consulting office at dusk with a city view, in deep navy tones',
  'nams-strategy-hero': 'Organized regulatory documents and a structured evidence map on a consultant\u2019s desk',
  'services-hero': 'Consultants reviewing a nonclinical strategy document in a meeting room',
  'how-we-work-hero': 'Video call with a client in a bright office, with a notebook of project steps',
  'about-hero': 'Quiet, modern office interior with glass partitions in navy and steel blue tones',
  'contact-hero': 'Confidential proposal document and pen on a consulting desk',
  'blog-hero': 'Annotated technical documents and a laptop on a calm workspace',
};

/** Mesmos parâmetros no <Picture> do hero e no preload do <head> (precisam gerar as mesmas URLs). */
export const HERO_WIDTHS = [480, 768, 1024, 1366, 1600, 1920, 2400];
export const HERO_QUALITY = 50; // 68 -> 50 (2026-10-31): -43% no arquivo, sem diferença visível nas fotos escuras (alerta de entrega de imagem do PageSpeed)

export function getImage(key: ImageKey): ImageMetadata | null {
  const hit = Object.entries(files).find(([path]) => path.split('/').pop()!.replace(/\.[^.]+$/, '') === key);
  return hit ? hit[1].default : null;
}

/**
 * Imagens de APOIO das seções (pedido da usuária, 2026-10-31: menos "só texto"). Mestres em
 * C:\Users\User\Downloads\d-sci-consulting-imagens\secoes\, copiados para src/assets/images/sections/.
 * Sempre abaixo da dobra: lazy, nunca entram no caminho do LCP.
 */
const sectionFiles = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/sections/*.{png,jpg,jpeg,webp}', { eager: true });

export type SectionImageKey =
  | 'sec-dossier-binders'
  | 'sec-annotating-documents'
  | 'sec-team-meeting'
  | 'sec-video-call'
  | 'sec-desk-analysis'
  | 'sec-cosmetics-flatlay'
  | 'sec-architecture-glass'
  | 'sec-office-window'
  | 'sec-project-plan'
  | 'sec-meeting-room';

export const SECTION_ALT: Record<SectionImageKey, string> = {
  'sec-dossier-binders': 'Document binders with index tabs arranged on a desk, like a regulatory dossier being assembled',
  'sec-annotating-documents': 'A consultant annotating printed report pages with a pen',
  'sec-team-meeting': 'Consultants reviewing documents together at a meeting table',
  'sec-video-call': 'A laptop on a desk during a video call, next to an open notebook',
  'sec-desk-analysis': 'A desk with a laptop showing charts and a notebook with a flow diagram',
  'sec-cosmetics-flatlay': 'Unbranded skincare products next to printed safety report pages',
  'sec-architecture-glass': '',
  'sec-office-window': 'A quiet workspace by a large window with a city view',
  'sec-project-plan': 'A notebook with a hand-drawn project timeline and milestones',
  'sec-meeting-room': 'An empty meeting room with a round table, ready for a client meeting',
};

export function getSectionImage(key: SectionImageKey): ImageMetadata | null {
  const hit = Object.entries(sectionFiles).find(([path]) => path.split('/').pop()!.replace(/\.[^.]+$/, '') === key);
  return hit ? hit[1].default : null;
}

/**
 * Fotos de FUNDO de seção inteira (SectionBackdrop), decorativas. Mestres 4K (Magnific, Nano
 * Banana 2.1) em C:\Users\User\Downloads\d-sci-consulting-imagens\fundos-4k\; aqui ficam em
 * 3840px (JPEG q92) e o build gera AVIF/WebP até 3840.
 */
const backdropFiles = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/backdrops/*.{png,jpg,jpeg,webp}', { eager: true });

export type BackdropKey = 'bd-ongoing' | 'bd-cta';

export function getBackdrop(key: BackdropKey): ImageMetadata | null {
  const hit = Object.entries(backdropFiles).find(([path]) => path.split('/').pop()!.replace(/\.[^.]+$/, '') === key);
  return hit ? hit[1].default : null;
}
