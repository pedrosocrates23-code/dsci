/**
 * Motion D-Sci (GSAP 3.15; todos os plugins são gratuitos desde a 3.13).
 *
 *  [data-magnetic]      botão "puxado" pelo cursor dentro da zona (.magnet-zone) e solto com
 *                       elastic.out; com overwrite:'auto' o wiggle continua (padrão da referência).
 *  [data-wiggle-once]   um wiggle discreto quando o elemento entra na tela (chama atenção uma vez).
 *  [data-reveal]        entrada por scroll, em lote; só para o que ainda está abaixo da dobra.
 *  [data-draw]          linha que se desenha (scaleX) conforme o scroll.
 *  [data-count-steps]   passos que acendem em sequência.
 *
 * Só transform e opacity (compositor). Respeita prefers-reduced-motion (o boot nem carrega).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { CustomWiggle } from 'gsap/CustomWiggle';

gsap.registerPlugin(ScrollTrigger, CustomEase, CustomWiggle);

export function wiggle(el: Element, strength = 3) {
  gsap.fromTo(el, { rotation: 0 }, { rotation: strength, duration: 0.9, ease: 'wiggle({wiggles:6, type:easeOut})', overwrite: 'auto' });
}

export function shake(el: Element) {
  gsap.fromTo(el, { x: 0 }, { x: 8, duration: 0.6, ease: 'wiggle({wiggles:5, type:easeOut})', overwrite: 'auto' });
}

function magnetic() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
    const zone = (btn.closest('.magnet-zone') as HTMLElement) ?? btn;
    const strength = Number(btn.dataset.magnetic) || 0.32;
    zone.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    });
    zone.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    });
  });
}

function wiggleOnce() {
  document.querySelectorAll<HTMLElement>('[data-wiggle-once]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.delayedCall(1.2, () => wiggle(el, 2.5)) });
  });
}

function reveals() {
  const vh = window.innerHeight;
  const pending = [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter((el) => el.getBoundingClientRect().top > vh * 0.92);
  if (!pending.length) return;
  gsap.set(pending, { opacity: 0, y: 28 });
  ScrollTrigger.batch(pending, {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', overwrite: 'auto' }),
  });
}

function drawLines() {
  document.querySelectorAll<HTMLElement>('[data-draw]').forEach((line) => {
    gsap.fromTo(line, { scaleX: 0 }, {
      scaleX: 1, ease: 'none', transformOrigin: 'left center',
      scrollTrigger: { trigger: line.parentElement ?? line, start: 'top 80%', end: 'bottom 55%', scrub: 0.6 },
    });
  });
}

function steps() {
  document.querySelectorAll<HTMLElement>('[data-count-steps]').forEach((list) => {
    const items = list.querySelectorAll<HTMLElement>('[data-step]');
    ScrollTrigger.create({
      trigger: list, start: 'top 75%', once: true,
      onEnter: () => gsap.fromTo(items, { opacity: 0.25 }, { opacity: 1, duration: 0.5, stagger: 0.14, ease: 'power1.out' }),
    });
  });
}

export function initMotion() {
  document.documentElement.classList.add('js-motion');
  magnetic();
  wiggleOnce();
  reveals();
  drawLines();
  steps();
  (window as unknown as { __dsciMotion?: unknown }).__dsciMotion = { gsap, wiggle, shake };
  window.dispatchEvent(new CustomEvent('dsci:motion-ready'));
}
