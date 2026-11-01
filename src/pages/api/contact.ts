/**
 * POST /api/contact/ — função sob demanda na Vercel.
 * Validação no servidor, honeypot, Turnstile opcional, envio pela API do Resend (fetch, sem SDK).
 * Sem RESEND_API_KEY / CONTACT_TO_EMAIL configurados, responde 503 "not_configured".
 */
import type { APIRoute } from 'astro';

export const prerender = false;

// Formulário em 2 etapas: (1) nome e e-mail; (2) área de atuação e mensagem.
const REQUIRED = ['name', 'email', 'sector', 'message'] as const;
const LIMITS: Record<string, number> = { name: 120, email: 160, sector: 80, message: 4000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const POST: APIRoute = async ({ request, redirect, clientAddress }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const reply = (status: number, body: Record<string, unknown>) =>
    wantsJson
      ? new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
      : status === 200
        ? redirect('/contact/sent/', 303)
        : new Response('Your message could not be sent. Please go back and try again.', { status, headers: { 'content-type': 'text/plain; charset=utf-8' } });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(400, { ok: false, error: 'bad_request' });
  }
  const get = (k: string) => String(form.get(k) ?? '').trim();

  // Honeypot: robô preencheu o campo invisível. Fingimos sucesso para não ensinar o robô.
  if (get('website')) return reply(200, { ok: true });

  const data: Record<string, string> = {};
  for (const k of Object.keys(LIMITS)) data[k] = get(k).slice(0, LIMITS[k]);
  const missing = REQUIRED.filter((k) => !data[k]);
  if (missing.length || !EMAIL_RE.test(data.email) || get('consent') !== 'yes') {
    return reply(422, { ok: false, error: 'invalid', fields: missing });
  }

  const env = import.meta.env;
  const turnstileSecret = env.TURNSTILE_SECRET_KEY as string | undefined;
  if (turnstileSecret) {
    const token = get('cf-turnstile-response');
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: turnstileSecret, response: token, remoteip: clientAddress ?? '' }),
    }).then((r) => r.json()).catch(() => ({ success: false }));
    if (!check.success) return reply(403, { ok: false, error: 'challenge_failed' });
  }

  const apiKey = env.RESEND_API_KEY as string | undefined;
  const to = env.CONTACT_TO_EMAIL as string | undefined;
  const from = (env.CONTACT_FROM_EMAIL as string | undefined) || to;
  if (!apiKey || !to || !from) return reply(503, { ok: false, error: 'not_configured' });

  const rows = [['Name', data.name], ['Email', data.email], ['Area of activity', data.sector]];
  const html = `<h2>New contact from the website</h2><table>${rows.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table><h3>Message</h3><p>${esc(data.message).replace(/\n/g, '<br>')}</p><p style="color:#666">Reply to this email to answer the sender directly. Received at ${new Date().toISOString()}</p>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `D-Sci Consulting website <${from}>`,
      to: [to],
      reply_to: data.email,
      subject: `[Website] ${data.sector} · ${data.name}`,
      html,
    }),
  }).catch(() => null);

  if (!res || !res.ok) return reply(502, { ok: false, error: 'send_failed' });
  return reply(200, { ok: true });
};
