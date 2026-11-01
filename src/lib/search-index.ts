/**
 * Índice da busca do site (gerado no build em /search-index.json).
 * Fontes: páginas fixas, âncoras de serviço, etapas do processo, FAQ, posts e categorias do
 * blog, autora e contato. Página ou post novo entra sozinho. Nada inventado: telefone só
 * aparece se existir em CONTACT.
 */
import { getCollection } from 'astro:content';
import { PAGES } from '../config/pages';
import { FAQ } from '../config/faq';
import { BRAND, CONTACT } from '../config/site';
import { getPosts, getTopicsWithPosts, postPath, topicPath } from './blog';

export type SearchGroup = 'Pages' | 'Services' | 'Process' | 'FAQ' | 'Articles' | 'Contact';
export interface SearchItem {
  g: SearchGroup;
  t: string;          // título
  d: string;          // descrição curta
  u: string;          // URL (relativa) ou mailto:/https:
  k?: string;         // palavras-chave extras (sinônimos)
  p?: string;         // "onde fica" (ex.: Services › Cosmetics)
}

const SERVICES: SearchItem[] = [
  { g: 'Services', t: 'First-in-human (FIH) nonclinical package', d: 'Minimum set of nonclinical evidence to start studies in humans, aligned with ICH M3(R2).', u: '/nams-strategy/#fih', p: 'NAMs Strategy', k: 'fih first in human ind pre-ind minimum package clinic ich m3' },
  { g: 'Services', t: 'Study waiver justifications', d: 'Scientific rationales showing why a specific study is not needed.', u: '/nams-strategy/#waivers', p: 'NAMs Strategy', k: 'waiver waive dispensa weight of evidence agency questions' },
  { g: 'Services', t: 'Evidence-driven nonclinical strategy', d: 'From existing data to the assays that are truly needed.', u: '/services/#nonclinical-strategy', p: 'Services', k: 'nonclinical strategy gap analysis data gap roadmap nams in silico read-across' },
  { g: 'Services', t: 'Nonclinical writing (CTD)', d: 'CTD Modules 2.4 and 2.6 and nonclinical study reports.', u: '/services/#nonclinical-writing', p: 'Services', k: 'ctd module 2.4 2.6 nonclinical overview regulatory writing report' },
  { g: 'Services', t: 'Toxicological assessment of products', d: 'Safety assessment of medicines, finished products, ingredients and molecules.', u: '/services/#toxicological-assessment', p: 'Services', k: 'toxicological assessment safety profile anvisa ingredient' },
  { g: 'Services', t: 'Fractional toxicologist (on demand)', d: 'A monthly package of hours for teams without a toxicologist.', u: '/services/#fractional-toxicologist', p: 'Services › Ongoing support', k: 'fractional toxicologist on demand monthly hours retainer ongoing' },
  { g: 'Services', t: 'NAMs radar applied to the portfolio', d: 'Quarterly report crossing regulatory news on NAMs with your projects.', u: '/services/#nams-radar', p: 'Services › Ongoing support', k: 'nams radar quarterly report oecd fda ema anvisa news' },
  { g: 'Services', t: 'Cosmetic safety (CPSR, PIF)', d: 'CPSR, PIF and documentation for ANVISA.', u: '/services/#cosmetic-safety', p: 'Services › Cosmetics', k: 'cpsr cosmetic product safety report pif cosmetics eu 1223/2009 sccs' },
  { g: 'Services', t: 'Animal-free testing strategies', d: 'Eye and skin irritation and sensitization, based on OECD guidelines.', u: '/services/#animal-free-testing', p: 'Services › Cosmetics', k: 'animal free testing in vitro irritation sensitization oecd cro' },
  { g: 'Services', t: 'Hazard communication (GHS, SDS)', d: 'GHS classification and Safety Data Sheets.', u: '/services/#hazard-communication', p: 'Services › Cosmetics', k: 'ghs sds safety data sheet fds hazard classification' },
];

const PROCESS: SearchItem[] = [
  { g: 'Process', t: 'What happens after you contact us', d: 'Message, scheduling, NDA if needed, diagnostic meeting, written proposal.', u: '/how-we-work/#after-contact', p: 'How we work', k: 'process steps next meeting schedule diagnostic nda proposal timeline' },
  { g: 'Process', t: 'How pricing works', d: 'Every project is scoped individually. What drives the fee.', u: '/how-we-work/#pricing', p: 'How we work', k: 'price pricing cost fee budget quote how much' },
  { g: 'Process', t: 'Engagement models', d: 'Fixed-scope project, ongoing support or technical review.', u: '/how-we-work/#process', p: 'How we work', k: 'engagement model contract retainer project review' },
];

export async function buildSearchIndex(): Promise<SearchItem[]> {
  const items: SearchItem[] = [];
  const page = (t: string, m: { path: string; description: string }, k = '') => items.push({ g: 'Pages', t, d: m.description, u: m.path, k });
  page('Home', PAGES.home, 'home start toxicology consulting fewer studies');
  page('NAMs Strategy', PAGES.nams, 'nams new approach methodologies non-animal methods 3rs alternatives');
  page('Services', PAGES.services, 'services all pharma biotech cosmetics ingredients');
  page('How we work', PAGES.howWeWork, 'process confidentiality nda english portuguese');
  page('About', PAGES.about, 'about who we are mission company goiania brazil');
  page('Contact', PAGES.contact, 'contact talk email message form proposal quote');
  page('Blog', PAGES.blog, 'blog articles insights');
  page('Privacy policy', PAGES.privacy, 'privacy lgpd data cookies');

  items.push(...SERVICES, ...PROCESS);
  for (const f of FAQ) items.push({ g: 'FAQ', t: f.q, d: f.a, u: '/how-we-work/#faq', p: 'How we work › FAQ' });

  const authors = await getCollection('authors');
  for (const a of authors) items.push({ g: 'Pages', t: `${a.data.name}, ${a.data.honorificSuffix ?? ''}`.replace(/, $/, ''), d: 'Author of the technical content.', u: `/authors/${a.id}/`, k: 'author jordana toxicologist orcid' });

  const [posts, topics] = await Promise.all([getPosts(), getTopicsWithPosts()]);
  for (const t of topics) items.push({ g: 'Articles', t: t.topic.data.name, d: `Articles in ${t.topic.data.name}.`, u: topicPath(t.topic.id), p: 'Blog', k: 'category' });
  for (const p of posts) items.push({ g: 'Articles', t: p.data.title, d: p.data.description, u: postPath(p), p: 'Blog' });

  // Contato estruturado: só o que existe
  items.push({ g: 'Contact', t: 'Request a proposal', d: 'Tell us about your challenge. No-cost diagnostic meeting.', u: '/contact/', k: 'contact proposal quote form talk phone telephone call email message' });
  if (CONTACT.email) items.push({ g: 'Contact', t: CONTACT.email, d: 'Email', u: `mailto:${CONTACT.email}`, k: 'email mail contact address' });
  if (CONTACT.linkedin) items.push({ g: 'Contact', t: 'LinkedIn', d: `${BRAND.name} on LinkedIn`, u: CONTACT.linkedin, k: 'linkedin social contact' });
  items.push({ g: 'Contact', t: `${BRAND.location} · remote service`, d: 'Meetings and documents in English or Portuguese.', u: '/about/', k: 'location address where based office brazil goiania remote language' });
  return items;
}
