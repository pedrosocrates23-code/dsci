import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Autores. A pessoa tem @id = ORCID (plano v2, seção 5): o nó não depende do domínio.
 */
const authors = defineCollection({
  loader: file('src/content/authors/authors.json'),
  schema: z.object({
    name: z.string(),
    honorificSuffix: z.string().optional(),
    orcid: z.url(),
    openalex: z.url().optional(),
    /** Perfil pessoal no LinkedIn (informado pela usuária em 2026-11-01). Entra no sameAs da Person. */
    linkedin: z.url().optional(),
    /** Mini bio canônica em inglês (ficha da entidade). */
    bio: z.string().min(80),
    alumniOf: z.object({ name: z.string(), wikidata: z.url() }),
    /** Credenciais da antiga 8.4 do prompt. Só aparecem se SHOW_AUTHOR_CREDENTIALS = true. */
    credentials: z
      .array(z.object({ group: z.string(), items: z.array(z.string()) }))
      .default([]),
    /** Artigos assinados em veículos de terceiros (HTML apenas; fora do schema nesta fase). */
    externalArticles: z
      .array(z.object({ outlet: z.string(), year: z.number(), title: z.string(), url: z.url() }))
      .default([]),
  }),
});

/**
 * Temas do blog (plano de arquitetura, 3.3). A página do tema só é gerada quando tem
 * `intro` próprio E pelo menos 3 posts publicados.
 */
const topics = defineCollection({
  loader: file('src/content/topics/topics.json'),
  schema: z.object({
    name: z.string(),
    market: z.string(),
    /** Parágrafo de abertura próprio. Vazio = a página do tema não existe. */
    intro: z.string().nullable().default(null),
    order: z.number(),
  }),
});

/**
 * Posts. Regra de integridade da assinatura (plano v2, 4.2):
 *  - byline 'author'   → "By Jordana..." (`author` = pessoa). Só se ela escreveu ou
 *                         reescreveu e aprovou a versão final.
 *  - byline 'reviewer' → "Reviewed by Jordana..." (`author` = organização, `reviewedBy` = pessoa).
 *  - Sem `approval` registrada, o build falha: o post não sai.
 */
const blog = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*'], base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    /** Title tag = título + " | D-Sci" (8 car.): até 57 aqui mantém o total em 65. */
    title: z.string().max(57),
    /** Meta description: 80 a 155 caracteres (trava do site). */
    description: z.string().min(80).max(155),
    pubDate: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /** Capa do card e do topo do artigo (arquivo ao lado do .md ou em src/assets/images/blog/). */
    cover: image().optional(),
    coverAlt: z.string().optional(),
    /** Categoria do silo: define a URL /{categoria}/{artigo}/. Obrigatória. */
    topic: reference('topics'),
    /** Página dona da intenção comercial que o post apoia (ex.: /nams-strategy/#fih). */
    supports: z.string().startsWith('/'),
    byline: z.enum(['author', 'reviewer']),
    person: reference('authors'),
    approval: z.object({
      approvedBy: z.string(),
      approvedOn: z.coerce.date(),
      note: z.string().optional(),
    }),
    draft: z.boolean().default(false),
  }),
});

/**
 * Páginas dos silos de serviço (src/config/silos.ts). Um arquivo por nó: 1.md, 1-3.md, 1-3-1.md.
 * Toda página fecha com referências (instrução da usuária, 2026-11-02): sem fonte, o build falha.
 */
const silos = defineCollection({
  loader: glob({ pattern: ['*.md', '!_*'], base: './src/content/silos' }),
  schema: z.object({
    node: z.string().regex(/^\d(\.\d){0,2}$/),
    title: z.string().max(65),
    description: z.string().min(80).max(155),
    h1: z.string(),
    lead: z.string(),
    updated: z.coerce.date(),
    deliverables: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    /** Entidades do texto com item no Wikidata conferido (entity-ops). Vão no `mentions` do WebPage. */
    mentions: z.array(z.object({ name: z.string(), sameAs: z.url() })).default([]),
    references: z
      .array(z.object({ title: z.string(), publisher: z.string(), year: z.string().optional(), url: z.url() }))
      .min(1),
  }),
});

export const collections = { authors, topics, blog, silos };
