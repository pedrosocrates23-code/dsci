import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Silo semântico (decisão da usuária, 31/10): /blog/ é SÓ o hub; categorias e artigos ficam
 * na raiz, sem "/blog/" no caminho nem no breadcrumb.
 *   /blog/                    hub (todas as categorias)
 *   /{categoria}/             página da categoria
 *   /{categoria}/{artigo}/    artigo           breadcrumb: Home > Categoria > Artigo
 * Todo post tem categoria (obrigatória no schema). Trocar a categoria de um post publicado
 * muda a URL: nesse caso, cadastre o 301 da URL antiga em vercel.json.
 */
export const postPath = (p: CollectionEntry<'blog'>) => `/${p.data.topic.id}/${p.id}/`;
export const topicPath = (topicId: string) => `/${topicId}/`;

/** Nomes que já são páginas/rotas na raiz: uma categoria com esses ids colidiria. */
export const RESERVED_TOPIC_IDS = ['blog', 'about', 'contact', 'services', 'how-we-work', 'nams-strategy', 'privacy-policy', 'authors', 'api', '404', '_astro', 'sitemap.xml', 'robots.txt', 'search-index.json'];

/** Posts publicados, do mais novo ao mais antigo. */
export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Categorias com pelo menos 1 post. A página da categoria existe (é o nível do meio do silo),
 * mas só é INDEXÁVEL com texto de abertura próprio e 3 posts (arquitetura, 3.3); antes disso
 * sai em noindex e fora do sitemap.
 */
export async function getTopicsWithPosts() {
  const [topics, posts] = await Promise.all([getCollection('topics'), getPosts()]);
  for (const t of topics) {
    if (RESERVED_TOPIC_IDS.includes(t.id)) throw new Error(`[blog] categoria "${t.id}" colide com uma página do site. Use outro id em topics.json.`);
  }
  return topics
    .map((t) => {
      const own = posts.filter((p) => p.data.topic.id === t.id);
      return { topic: t, posts: own, indexable: Boolean(t.data.intro) && own.length >= 3 };
    })
    .filter((t) => t.posts.length > 0)
    .sort((a, b) => a.topic.data.order - b.topic.data.order);
}

export const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
