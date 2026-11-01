/**
 * robots.txt: libera tudo (inclusive os robôs de busca de IA, decisão D7 do plano) e aponta
 * o /sitemap.xml no domínio do site. Se um host .invalid for usado, bloqueia tudo.
 */
import type { APIRoute } from 'astro';
import { DOMAIN_PENDING, SITE_URL } from '../config/site';

export const GET: APIRoute = () => {
  const body = DOMAIN_PENDING
    ? 'User-agent: *\nDisallow: /\n'
    : [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        '',
        '# Robôs de busca das IAs: liberados de propósito (plano v2, D7)',
        'User-agent: OAI-SearchBot',
        'Allow: /',
        'User-agent: ChatGPT-User',
        'Allow: /',
        'User-agent: PerplexityBot',
        'Allow: /',
        'User-agent: Claude-SearchBot',
        'Allow: /',
        '',
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        '',
      ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
