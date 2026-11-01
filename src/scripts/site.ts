/**
 * Comportamento global do site, carregado UMA vez no FIM da página (depois do conteúdo e da
 * foto do hero). Scripts no começo do HTML eram buscados antes da imagem principal e atrasavam
 * o LCP no PageSpeed. Aqui: header ao rolar, menu do celular, prefetch no hover e animações.
 */
import './menu';
import { bootMotion } from './motion-boot';

// Header: estado "rolado" (a logo sai e o "Home" entra na barra de vidro)
const header = document.querySelector<HTMLElement>('[data-header]');
const home = header?.querySelector<HTMLAnchorElement>('.glassbar__home');
if (header) {
  const onScroll = () => {
    const scrolled = window.scrollY > 48;
    header.classList.toggle('is-scrolled', scrolled);
    if (home) home.tabIndex = scrolled ? 0 : -1;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Prefetch no hover/foco: busca a página interna antes do clique (substitui o prefetch do Astro,
// que era injetado no <head>). Só links do próprio site, uma vez por URL, e respeita economia de dados.
const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
if (!conn?.saveData) {
  const done = new Set<string>([location.pathname]);
  const prefetch = (e: Event) => {
    const a = (e.target as HTMLElement).closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || a.origin !== location.origin || a.target === '_blank' || a.hasAttribute('download')) return;
    const path = a.pathname;
    if (done.has(path) || /\.(xml|json|txt|pdf)$/.test(path)) return;
    done.add(path);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  };
  document.addEventListener('pointerover', prefetch, { passive: true });
  document.addEventListener('focusin', prefetch);
}

// Imagens de apoio das seções (SectionImage): o <picture> vem dentro de <noscript> e só é
// injetado DEPOIS do evento load, quando a figura chega perto da tela. Assim nenhuma delas
// disputa banda com a foto do hero (LCP). Entrada: fade + zoom leve (sem GSAP).
const simgs = document.querySelectorAll<HTMLElement>('[data-simg]');
if (simgs.length) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inject = (fig: HTMLElement) => {
    const ns = fig.querySelector('noscript');
    if (!ns) return;
    if (!still && fig.getBoundingClientRect().top > innerHeight) fig.classList.add('is-armed');
    fig.classList.add('is-injected');
    fig.insertAdjacentHTML('beforeend', ns.textContent ?? '');
    ns.remove();
    const img = fig.querySelector('img');
    const shown = () => fig.classList.add('is-loaded');
    if (!img || img.complete) requestAnimationFrame(shown);
    else { img.addEventListener('load', shown, { once: true }); img.addEventListener('error', shown, { once: true }); }
  };
  const start = () => {
    if (!('IntersectionObserver' in window)) { simgs.forEach(inject); return; }
    const near = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { inject(e.target as HTMLElement); near.unobserve(e.target); }
    }, { rootMargin: '600px 0px' });
    const seen = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); seen.unobserve(e.target); }
    }, { rootMargin: '0px 0px -12% 0px' });
    simgs.forEach((fig) => { near.observe(fig); seen.observe(fig); });
  };
  // Começa 1,2 s depois do load (o LCP medido costuma sair DEPOIS do load em página leve) ou
  // na 1ª interação, o que vier antes. Quem rola a página nunca vê o quadro vazio por muito tempo.
  let started = false;
  const go = () => {
    if (started) return;
    started = true;
    ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach((t) => removeEventListener(t, go));
    start();
  };
  ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach((t) => addEventListener(t, go, { once: true, passive: true }));
  const afterLoad = () => setTimeout(go, 1200);
  if (document.readyState === 'complete') afterLoad();
  else addEventListener('load', afterLoad, { once: true });
}

bootMotion();
