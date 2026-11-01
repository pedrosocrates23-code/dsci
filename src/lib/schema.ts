/**
 * Grafo JSON-LD (plano v2, seções 5 e 6; arquitetura v2-EN, seção 6).
 *  - Organization: nó completo SÓ em /about/ (entity home). Nas outras páginas, só @id.
 *  - Person: @id = ORCID, nó enxuto SÓ na página de autora. Sem founder/worksFor (fase 1).
 *  - Campos sem valor real (CNPJ, LinkedIn, e-mail) ficam fora, nunca como placeholder.
 */
import { BRAND, CONTACT, SITE_URL, ORCID_ID, FOUNDER_PHASE } from '../config/site';

export const abs = (path: string) => new URL(path, SITE_URL + '/').href;
export const ORG_ID = abs('/about/#organization');
export const WEBSITE_ID = abs('/#website');
export const orgRef = { '@id': ORG_ID };

type Node = Record<string, unknown>;

export function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: abs('/'),
    name: BRAND.name,
    alternateName: BRAND.short,
    inLanguage: 'en',
    publisher: orgRef,
  };
}

export function organizationNode(): Node {
  const sameAs = [CONTACT.linkedin].filter(Boolean);
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: BRAND.name,
    alternateName: BRAND.short,
    url: abs('/'),
    logo: { '@type': 'ImageObject', '@id': abs('/#logo'), url: abs('/logo-d-sci-consulting.png'), width: 512, height: 512 },
    description: BRAND.description,
    slogan: BRAND.slogan,
    ...(CONTACT.email ? { email: CONTACT.email } : {}),
    address: { '@type': 'PostalAddress', addressLocality: 'Goiânia', addressRegion: 'GO', addressCountry: 'BR' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: abs('/contact/'),
      ...(CONTACT.email ? { email: CONTACT.email } : {}),
      availableLanguage: ['en', 'pt'],
    },
    knowsAbout: [
      { '@type': 'Thing', name: 'Toxicology', sameAs: 'https://www.wikidata.org/wiki/Q7218' },
      { '@type': 'Thing', name: 'New approach methodologies (NAMs)', sameAs: 'https://www.wikidata.org/wiki/Q140419703' },
      { '@type': 'Thing', name: 'Alternatives to animal testing', sameAs: 'https://www.wikidata.org/wiki/Q63385' },
      { '@type': 'Thing', name: 'Computational toxicology', sameAs: 'https://www.wikidata.org/wiki/Q97303295' },
      { '@type': 'Thing', name: 'Common Technical Document (CTD)', sameAs: 'https://www.wikidata.org/wiki/Q1116233' },
    ],
    ...(FOUNDER_PHASE ? { founder: { '@id': ORCID_ID } } : {}),
    ...(CONTACT.cnpj ? { taxID: CONTACT.cnpj } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export interface Crumb { name: string; path: string; }

export function breadcrumbNode(path: string, crumbs: Crumb[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': abs(path) + '#breadcrumb',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

export function webPageNode(opts: {
  path: string; name: string; description: string; type?: string; crumbs?: Crumb[];
  about?: Node; mainEntity?: Node; extra?: Node;
}): Node {
  const url = abs(opts.path);
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': url + '#webpage',
    url,
    name: opts.name,
    description: opts.description,
    inLanguage: 'en',
    isPartOf: { '@id': WEBSITE_ID },
    ...(opts.crumbs ? { breadcrumb: { '@id': url + '#breadcrumb' } } : {}),
    ...(opts.about ? { about: opts.about } : {}),
    ...(opts.mainEntity ? { mainEntity: opts.mainEntity } : {}),
    ...(opts.extra ?? {}),
  };
}

export function serviceNode(opts: { path: string; anchor: string; name: string; description: string; serviceType?: string; audience?: string; sameAsRef?: string; }): Node {
  if (opts.sameAsRef) return { '@id': abs(opts.sameAsRef) };
  return {
    '@type': 'Service',
    '@id': abs(opts.path) + '#' + opts.anchor,
    name: opts.name,
    description: opts.description,
    ...(opts.serviceType ? { serviceType: opts.serviceType } : {}),
    provider: orgRef, // areaServed fica de fora até a decisão N4
    url: abs(opts.path) + '#' + opts.anchor,
    ...(opts.audience ? { audience: { '@type': 'BusinessAudience', name: opts.audience } } : {}),
  };
}

export function faqNode(path: string, items: { q: string; a: string }[]): Node {
  return {
    '@type': 'FAQPage',
    '@id': abs(path) + '#faq',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
}

export function personNode(author: { name: string; honorificSuffix?: string; bio: string; orcid: string; openalex?: string; alumniOf: { name: string; wikidata: string } }, path: string): Node {
  return {
    '@type': 'Person',
    '@id': author.orcid,
    name: author.name,
    ...(author.honorificSuffix ? { honorificSuffix: author.honorificSuffix } : {}),
    url: abs(path),
    description: author.bio,
    alumniOf: { '@type': 'CollegeOrUniversity', name: author.alumniOf.name, sameAs: author.alumniOf.wikidata },
    sameAs: [author.orcid, author.openalex].filter(Boolean),
  };
}

export function graph(...nodes: (Node | null | undefined | false)[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });
}
