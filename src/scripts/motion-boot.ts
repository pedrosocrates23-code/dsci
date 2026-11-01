/**
 * Carregador do motion. O GSAP (~49 kB gz com ScrollTrigger e CustomWiggle) NÃO entra no
 * caminho crítico: só é importado depois do evento load, quando o navegador fica ocioso.
 * Sem JS, ou com prefers-reduced-motion, o site funciona igual, só sem movimento.
 */
export function bootMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const start = () => import('./motion').then((m) => m.initMotion()).catch(() => {});
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  const idle = () => (ric ? ric(start, { timeout: 2500 }) : setTimeout(start, 1200));
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}
