/**
 * Registro das páginas fixas: title (até 65 caracteres), meta description (80 a 155) e a
 * data da última mudança de CONTEÚDO, que vira o <lastmod> no /sitemap.xml.
 * Regra: mudou o texto da página, atualize `updated`. Nunca use a data do build.
 * O sitemap NÃO depende desta lista: ele é montado do build (scripts/build-sitemap.mjs) e
 * qualquer página indexável nova entra sozinha; a trava de SEO reprova title/description fora do limite.
 */
export interface PageMeta {
  path: string;
  title: string;
  description: string;
  updated: string; // AAAA-MM-DD
}

export const PAGES = {
  home: {
    path: '/',
    title: 'Regulatory toxicology and nonclinical strategy | D-Sci',
    description:
      'Fewer studies, the right studies: nonclinical strategies built from existing data, NAMs and in silico approaches, documented for FDA, ANVISA and the EU.',
    updated: '2026-10-31',
  },
  nams: {
    path: '/nams-strategy/',
    title: 'NAMs integration: FIH package and study waivers | D-Sci',
    description:
      'New approach methodologies, read-across, in silico toxicology and weight of evidence, from the FIH nonclinical package to study waiver justification.',
    updated: '2026-10-31',
  },
  services: {
    path: '/services/',
    title: 'Nonclinical regulatory writing and toxicology | D-Sci',
    description:
      'Nonclinical strategy, data gap analysis, study waiver justification, CTD Modules 2.4 and 2.6, toxicological assessment, CPSR and a fractional toxicologist.',
    updated: '2026-10-31',
  },
  howWeWork: {
    path: '/how-we-work/',
    title: 'How we work: diagnosis, NDA and proposal | D-Sci Consulting',
    description:
      'A no-cost, confidential diagnostic meeting, a proposal with defined scope, timeline and deliverables, and documents in English or Portuguese.',
    updated: '2026-10-31',
  },
  about: {
    path: '/about/',
    title: 'About D-Sci Consulting: regulatory toxicology',
    description:
      'Regulatory toxicology and nonclinical strategy consulting for pharma, biotech, cosmetics and ingredients. Based in Goiânia, Brazil, working remotely.',
    updated: '2026-10-31',
  },
  contact: {
    path: '/contact/',
    title: 'Contact and proposal request | D-Sci Consulting',
    description:
      'Describe your nonclinical challenge and get a tailored proposal. Based in Goiânia, Brazil, working remotely, with an NDA before technical details.',
    updated: '2026-10-31',
  },
  privacy: {
    path: '/privacy-policy/',
    title: 'Privacy policy (LGPD) | D-Sci Consulting',
    description:
      "How D-Sci Consulting handles the data sent through its contact form, under Brazil's General Data Protection Law (LGPD).",
    updated: '2026-10-31',
  },
  blog: {
    path: '/blog/',
    title: 'Blog: NAMs, regulatory toxicology and nonclinical strategy',
    description:
      'Technical articles on new approach methodologies, weight of evidence, study waivers and regulatory documentation for the FDA, ANVISA and the EU.',
    updated: '2026-10-31',
  },
  author: {
    path: '/authors/jordana-andrade-santos/',
    title: 'Jordana Andrade Santos, PhD: author | D-Sci Consulting',
    description:
      "Toxicologist with a PhD in Pharmaceutical Sciences (UFG), author of D-Sci Consulting's technical content on NAMs and nonclinical strategy.",
    updated: '2026-10-31',
  },
} satisfies Record<string, PageMeta>;

