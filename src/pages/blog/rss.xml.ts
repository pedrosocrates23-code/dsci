import type { APIRoute } from 'astro';
import { getPosts, postPath } from '../../lib/blog';
import { abs } from '../../lib/schema';
import { BRAND } from '../../config/site';

const x = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const items = posts.map((p) => `<item><title>${x(p.data.title)}</title><link>${abs(postPath(p))}</link><guid>${abs(postPath(p))}</guid><pubDate>${p.data.pubDate.toUTCString()}</pubDate><description>${x(p.data.description)}</description></item>`).join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${x(BRAND.name)} blog</title><link>${abs('/blog/')}</link><description>${x(BRAND.tagline)}</description><language>en</language>${items}</channel></rss>`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
