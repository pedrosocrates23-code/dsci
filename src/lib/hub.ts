/**
 * Blog como HUB (decisão da usuária, 2026-10-31): cada post aponta para a página do site
 * que ele apoia (`supports`), e o /blog/ organiza tudo por categoria em cartões expansíveis.
 */
import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { getEntry } from 'astro:content';
import { PAGES } from '../config/pages';
import { fmtDate, postPath } from './blog';

export interface HubCard {
  id: string;
  href: string;
  preview?: boolean; // cartão de prévia (só em dev)
  title: string;
  description: string;
  topicId: string;
  topicName: string;
  date: string;
  dateISO: string;
  byline: string;
  supportsHref: string;
  supportsLabel: string;
  cover?: ImageMetadata;
  coverAlt?: string;
}

/** Capas geradas para os cartões/artigos de prévia (src/assets/images/blog/post-*.png). */
const COVERS = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/blog/*.{png,jpg,jpeg,webp}', { eager: true });
const coverByName = (name: string) => Object.entries(COVERS).find(([p]) => p.split('/').pop()!.replace(/\.[^.]+$/, '') === name)?.[1].default;

/** Nome legível da página que o post apoia (inclui as âncoras de serviço). */
const ANCHORS: Record<string, string> = {
  '/nams-strategy/#fih': 'FIH nonclinical package',
  '/nams-strategy/#waivers': 'Study waiver justifications',
  '/services/#nonclinical-strategy': 'Evidence-driven nonclinical strategy',
  '/services/#study-waivers': 'Study waiver justifications',
  '/services/#nonclinical-writing': 'Nonclinical writing',
  '/services/#toxicological-assessment': 'Toxicological assessment',
  '/services/#ongoing-support': 'Ongoing support',
  '/services/#fractional-toxicologist': 'Fractional toxicologist',
  '/services/#nams-radar': 'NAMs radar',
  '/services/#cosmetics': 'Cosmetics and ingredients',
  '/services/#cosmetic-safety': 'Cosmetic safety',
  '/services/#animal-free-testing': 'Animal-free testing strategies',
  '/services/#hazard-communication': 'Hazard communication',
};
const PAGE_NAMES: Record<string, string> = {
  [PAGES.nams.path]: 'NAMs Strategy',
  [PAGES.services.path]: 'Services',
  [PAGES.howWeWork.path]: 'How we work',
  [PAGES.about.path]: 'About',
  [PAGES.contact.path]: 'Contact',
};
export const supportsLabel = (path: string) => ANCHORS[path] ?? PAGE_NAMES[path.split('#')[0]] ?? path;

export async function toCard(post: CollectionEntry<'blog'>): Promise<HubCard> {
  const d = post.data;
  const topic = await getEntry(d.topic);
  const person = await getEntry(d.person);
  const name = person ? `${person.data.name}${person.data.honorificSuffix ? `, ${person.data.honorificSuffix}` : ''}` : '';
  return {
    id: post.id,
    href: postPath(post),
    title: d.title,
    description: d.description,
    topicId: d.topic.id,
    topicName: topic?.data.name ?? d.topic.id,
    date: fmtDate(d.pubDate),
    dateISO: d.pubDate.toISOString(),
    byline: `${d.byline === 'author' ? 'By' : 'Reviewed by'} ${name}`,
    supportsHref: d.supports,
    supportsLabel: supportsLabel(d.supports),
    cover: d.cover,
    coverAlt: d.coverAlt ?? '',
  };
}

/**
 * Cartões de PRÉVIA, só no `astro dev` e só enquanto não há post publicado: servem para ver
 * o hub e a animação. Nunca entram no build de produção.
 * Slug, title e description = intenções validadas pela entity-ops em 2026-10-31 (SERP em inglês
 * + fonte primária): outputs/entity-ops/d-sci-consulting/INTENCOES-DE-BUSCA-BLOG-2026-10-31.md.
 * O post real reaproveita os mesmos três campos no frontmatter.
 */
export const PREVIEW_CARDS: HubCard[] = [
  ['fih-package', 'nonclinical-pharma', 'Nonclinical pharma', 'nonclinical-package-first-in-human-ich-m3r2',
    'Nonclinical Studies Before First-in-Human: ICH M3(R2)',
    'What ICH M3(R2) requires before a first-in-human trial: safety pharmacology, genotoxicity, repeat-dose toxicity duration, and where studies can be cut.',
    '/nams-strategy/#fih'],
  ['waiver-woe', 'nonclinical-pharma', 'Nonclinical pharma', 'rat-carcinogenicity-study-waiver-weight-of-evidence',
    'How to Justify a 2-Year Rat Study Waiver Under S1B(R1)',
    'Build an ICH S1B(R1) weight of evidence case that a 2-year rat study adds no value: the six factors, the WoE document, and when to consult regulators.',
    '/nams-strategy/#waivers'],
  ['cpsr', 'eu-cosmetics', 'EU cosmetics', 'what-goes-into-a-cpsr-us-brands',
    'What Goes Into a CPSR: A Guide for US Cosmetic Brands',
    'Inside the EU CPSR for US cosmetic brands: Annex I Parts A and B, the data your safety assessor needs, MoS limits and who may sign.',
    '/services/#cosmetic-safety'],
  ['animal-free', 'eu-cosmetics', 'EU cosmetics', 'in-vitro-eye-irritation-testing-strategy',
    'In Vitro Eye Irritation Testing for EU Cosmetics',
    'How to pick an animal-free eye irritation strategy for EU cosmetics: OECD TG 492, 437, 492B and TG 467 defined approaches, and what the CPSR needs.',
    '/services/#animal-free-testing'],
  ['read-across', 'nams-oecd', 'NAMs and OECD', 'read-across-justification',
    'Read-Across Justification: When Regulators Accept It',
    'Why read-across gets rejected under REACH, what RAAF, OECD No. 418 and EFSA 2025 expect, and how NAM data can strengthen a justification.',
    '/nams-strategy/'],
].map(([id, topicId, topicName, slug, title, description, supports]) => ({
  id: `preview-${id}`,
  href: `/${topicId}/${slug}/`,
  preview: true,
  title,
  description,
  topicId,
  topicName,
  date: 'Preview',
  dateISO: '',
  byline: 'By Jordana Andrade Santos, PhD',
  supportsHref: supports,
  supportsLabel: supportsLabel(supports),
  cover: coverByName(`post-${id}`),
  coverAlt: '',
}));
