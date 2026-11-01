/**
 * Configuração central do site D-Sci Consulting.
 *
 * Tudo que ainda depende de decisão da cliente mora aqui, com o nome da decisão do plano
 * (outputs/entity-ops/d-sci-consulting/). Campo vazio = linha escondida no site, nunca
 * placeholder publicado.
 */

const env = import.meta.env;

/** Domínio vem do astro.config (SITE_URL). Host .invalid = domínio ainda não definido (D1). */
export const SITE_URL: string = (env.SITE ?? 'https://dsciconsult.com').replace(/\/+$/, '');
export const DOMAIN_PENDING = SITE_URL.endsWith('.invalid');

export const BRAND = {
  name: 'D-Sci Consulting',
  short: 'D-Sci',
  slogan: 'Fewer studies. The right studies.',
  tagline: 'Evidence-driven regulatory toxicology and nonclinical strategy.',
  location: 'Goiânia, Brazil',
  service: 'Remote service',
  /** Descrição canônica (ficha da entidade, versão em inglês). */
  description:
    'D-Sci Consulting is a regulatory toxicology and nonclinical strategy consultancy for pharmaceutical and biotechnology companies, cosmetic brands and ingredient suppliers, based in Goiânia, Brazil, and serving clients remotely in Brazil and abroad. It builds nonclinical strategies from existing data, using new approach methodologies (NAMs) and in silico approaches where applicable, and turns the results into documentation for the FDA, ANVISA and the European Union.',
};

/** D2, D3 e perfis: preenchidos por variável de ambiente quando existirem. */
export const CONTACT = {
  email: (env.PUBLIC_CONTACT_EMAIL as string | undefined) || null,
  linkedin: (env.PUBLIC_LINKEDIN_URL as string | undefined) || null,
  cnpj: (env.PUBLIC_CNPJ as string | undefined) || null,
};

export const INTEGRATIONS = {
  ga4: (env.PUBLIC_GA4_ID as string | undefined) || null,
  /** Google Tag Manager: contêiner informado pela usuária em 2026-10-31. PUBLIC_GTM_ID troca;
   *  PUBLIC_GTM_ID vazio desliga. */
  gtm: ((env.PUBLIC_GTM_ID as string | undefined) ?? 'GTM-WPRVL288') || null,
  /** Microsoft Clarity: ID do projeto (ainda não informado). */
  clarity: (env.PUBLIC_CLARITY_ID as string | undefined) || null,
  turnstileSiteKey: (env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined) || null,
};

/** Há alguma ferramenta de medição ligada (barra de consentimento e textos de cookies dependem disto). */
export const HAS_ANALYTICS = Boolean(INTEGRATIONS.ga4 || INTEGRATIONS.gtm || INTEGRATIONS.clarity);

/**
 * Autoria (decisão de 2026-10-31 + R1/D11 do plano v2).
 *  - 'authorship': quadros "Technical authorship" em /about/ e /nams-strategy/ com a mini
 *    bio e link para a página de autora (opção escolhida pela usuária).
 *  - 'blog-link':  se a D11 decidir que ela assina só os posts, os quadros viram
 *    "Technical articles on the blog", sem bio.
 */
export const AUTHORSHIP_MODE: 'authorship' | 'blog-link' = 'authorship';

/** Credenciais detalhadas (antiga 8.4 do prompt) na página de autora: decisão dela. */
export const SHOW_AUTHOR_CREDENTIALS = false;

/** Fase 2 (fundadora). Enquanto false, nada no site declara vínculo pessoa e empresa. */
export const FOUNDER_PHASE = false;

export const ORCID_ID = 'https://orcid.org/0000-0001-6492-1771';

export const NAV = [
  { href: '/nams-strategy/', label: 'NAMs Strategy' },
  { href: '/services/', label: 'Services' },
  { href: '/how-we-work/', label: 'How we work' },
  { href: '/about/', label: 'About' },
  { href: '/blog/', label: 'Blog' },
];
