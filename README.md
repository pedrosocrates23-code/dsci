# Site D-Sci Consulting

Site institucional em **inglês** da D-Sci Consulting. Construído com o Squad Astro:
- **Base:** Astro 7.4, estático, com uma única função sob demanda para o formulário.
- **Hospedagem:** Vercel.
- **Animação:** GSAP 3.15.

Base de planejamento em `outputs/entity-ops/d-sci-consulting/`:
- `PLANO-SEO-TECNICO-E-ENTIDADE-v2-2026-10-31.md`
- `ARQUITETURA-SITEMAP-E-AUTORIDADE-INTERNACIONAL-v2-EN-2026-10-31.md`
- `PROCESSO-DE-CONTRATACAO-E-CONVERSAO-2026-10-31.md`

## Comandos

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # build + trava do sitemap + trava de SEO (reprova se algo sair errado)
npm run og         # regera favicon, logo 512 e imagem de compartilhamento (public/)
```

## Domínio

**dsciconsult.com**, informado pela usuária em 31/10/2026. É o padrão em `astro.config.mjs` e pode ser trocado pela variável `SITE_URL` sem editar código.

O canonical, o `/sitemap.xml`, o `robots.txt` (`Sitemap: https://dsciconsult.com/sitemap.xml`), o Open Graph e o JSON-LD seguem esse valor.

## Sitemap (automático)

- Há um arquivo só, em `/sitemap.xml` (`<urlset>`), sem índice.
- Ele é montado **depois do build** por `scripts/build-sitemap.mjs`, a partir das páginas realmente geradas. **Toda URL nova e indexável entra sozinha**, sem lista manual: página, post, categoria ou autor.
- **O que fica de fora:** páginas em `noindex` (preview, categoria com menos de 3 posts, confirmação do formulário) e o 404.
- **`<loc>`:** é o canonical de cada página.
- **`<lastmod>`:** vem da data da última mudança de conteúdo:
  - **páginas fixas:** campo `updated` em `src/config/pages.ts`;
  - **posts:** `updated` ou `pubDate`;
  - **hub e categorias:** o post mais recente.
- **Trava** (`scripts/check-sitemap.mjs`): reprova o build se o sitemap virar índice, se faltar alguma página indexável ou se ele listar página inexistente ou `noindex`.

## Title e meta description (trava no build)

- **Title:** até **65** caracteres.
- **Meta description:** de **80 a 155** caracteres.
- **Onde é conferido:** em todas as páginas geradas (`scripts/check-seo.mjs`). Fora do limite, o build **reprova** e mostra a rota e o tamanho.
- **Nos posts, a regra vale já no arquivo:** título com até 57 caracteres (o site acrescenta " | D-Sci" ao final) e description de 80 a 155.

## Performance (PageSpeed)

Medição com Lighthouse 13.6 (o motor do PageSpeed) no build de produção, em 31/10/2026:

| Modo | Resultado |
|---|---|
| Celular | 100 / 100 / 100 / 100 em todas as 9 páginas |
| Desktop | 100 / 100 / 100 / 100 nas páginas testadas |

O que sustenta a nota (não desfazer sem medir de novo):
- **CSS embutido no HTML** (`build.inlineStylesheets: 'always'`): nenhum CSS bloqueia a renderização.
- **Foto do hero (LCP) pré-carregada no `<head>`** (prop `heroImage` do layout), em AVIF, com `fetchpriority="high"` e larguras de 480 a 2400 px.
- **Um único script de site, no FIM da página** (`src/scripts/site.ts`): header, menu, prefetch e animações. Script antes da foto atrasa o LCP.
- **Prefetch próprio no hover**, também no fim da página. O prefetch do Astro (`prefetch: false`) entrava no `<head>`.
- **GSAP carregado só depois do evento `load`**, quando o navegador fica ocioso.
- **Fontes:** as duas (Sora e Source Sans 3) são pré-carregadas, o que zera o deslocamento de layout na troca de fonte.
- **Hover sem animar espaçamento ou tamanho:** só `transform`, `opacity` e cores.
- **Tags de medição atrasadas:** GTM, GA4 e Clarity são injetados 3 s depois do evento `load` (`BaseLayout.astro`), só no build de produção. Antes disso já existem `dataLayer`, `gtag` e o Consent Mode negado por padrão; a barra de consentimento libera `analytics_storage` e o Clarity. O envio do formulário dispara `generate_lead` por `gtag` e por `dataLayer.push` (gatilho de evento personalizado no GTM).
- **Imagens de apoio das seções (`SectionImage`) dentro de `<noscript>`:** o `site.ts` só as injeta 1,2 s depois do `load` (ou na 1ª rolagem/toque), quando chegam perto da tela. Com `loading="lazy"` comum, as fotos perto do topo disputavam banda com a foto do hero e About, NAMs Strategy e Services caíam para 99. Sem JS, o `<noscript>` mostra a foto.

## Imagens

- **Arquivos-mestre:** `C:\Users\User\Downloads\d-sci-consulting-imagens\`.
- **Cópia usada no site:** `src/assets/images/`, com o mesmo nome. O build gera AVIF e WebP responsivos.
- **Para melhorar uma imagem:** salve a versão nova em `src/assets/images/` com o mesmo nome (por exemplo, `home-hero.png`) e rode o build de novo.
- **Imagem ausente:** não quebra nada. O hero cai num fundo navy com o padrão da marca.
- **Estilo:** consultoria, sem laboratório (pedido da cliente).

| Arquivo | Onde aparece |
|---|---|
| `home-hero.png` | Home (fundo de tela cheia, atrás do menu) |
| `nams-strategy-hero.png` | NAMs Strategy |
| `services-hero.png` | Services |
| `how-we-work-hero.png` | How we work |
| `about-hero.png` | About |
| `contact-hero.png` | Contact (atrás do formulário em vidro) |
| `blog-hero.png` | Reserva para o blog |

**Imagens de apoio das seções** (`src/assets/images/sections/`, mestres em `C:\Users\User\Downloads\d-sci-consulting-imagens\secoes\`, prompts em `secoes\_prompts\`):

| Arquivo | Onde aparece |
|---|---|
| `sec-desk-analysis.png` | Sem uso no momento (fotos soltas removidas a pedido da usuária, 2026-10-31) |
| `sec-team-meeting.png` | Sem uso no momento (fotos soltas removidas a pedido da usuária, 2026-10-31) |
| `sec-architecture-glass.png` | Fundo da faixa de chamada (CtaBand) em cinza a 16%, em todas as páginas menos Services |
| `sec-annotating-documents.png` | Sem uso no momento (fotos soltas removidas a pedido da usuária, 2026-10-31) |
| `sec-cosmetics-flatlay.png` | NAMs Strategy, fundo da faixa de cosméticos |
| `sec-video-call.png` | Sem uso no momento (fotos soltas removidas a pedido da usuária, 2026-10-31) |
| `sec-dossier-binders.png` | Sem uso no momento (fotos soltas removidas a pedido da usuária, 2026-10-31) |
| `sec-project-plan.png` | Sem uso no momento (fotos soltas removidas a pedido da usuária, 2026-10-31) |
| `sec-meeting-room.png` | Sem uso no momento (fotos soltas removidas a pedido da usuária, 2026-10-31) |
| `sec-office-window.png` | Sem uso no momento (fotos soltas removidas a pedido da usuária, 2026-10-31) |

**Fotos de fundo 4K (`SectionBackdrop`)** (`src/assets/images/backdrops/`, em 3840px; mestres 4K gerados na Magnific com Nano Banana 2.1 em `C:\Users\User\Downloads\d-sci-consulting-imagens\fundos-4k\`). Cobrem a seção inteira, com véu navy por cima para o texto branco; mesmo carregamento do `SectionImage` (`<noscript>` + `site.ts`). Em teste só na página de Serviços:

| Arquivo | Onde aparece |
|---|---|
| `bd-ongoing.jpg` (de `ongoing-b.png`) | Services, seção navy "A toxicologist alongside your program." (cartões em vidro fosco) |
| `bd-cta.jpg` (de `cta-b.png`) | Services, faixa de chamada final (`<CtaBand backdrop="bd-cta">`) |

## Variáveis de ambiente (`.env.example`)

| Variável | Para quê | Sem ela |
|---|---|---|
| `SITE_URL` | Domínio | Site em noindex |
| `PUBLIC_CONTACT_EMAIL`, `PUBLIC_LINKEDIN_URL`, `PUBLIC_CNPJ` | Rodapé, Contact e schema | A linha some, sem placeholder publicado |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Envio do formulário | O formulário responde "not active yet" |
| `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Anti-spam | Só o honeypot protege |
| `PUBLIC_GTM_ID` | Google Tag Manager (padrão `GTM-WPRVL288`; vazio desliga) | Usa o contêiner padrão |
| `PUBLIC_GA4_ID` | GA4 direto pelo gtag.js (padrão `G-2YVE958NV1`; vazio desliga) | Usa o ID padrão |
| `PUBLIC_CLARITY_ID` | Microsoft Clarity | Sem Clarity |

## Blog

Copie `src/content/blog/_TEMPLATE-post.md` para um arquivo sem o `_` inicial.

**O build exige o bloco `approval`.** É a regra de integridade da assinatura do plano: sem aprovação registrada da autora, o post não sai.

**O blog funciona como hub de um silo semântico.** `/blog/` é **só** o hub; categorias e artigos ficam na raiz, sem `/blog/` no caminho nem no breadcrumb:
- `/blog/`: hub, com todas as categorias e cartões com capa (`src/components/BlogHub.astro`).
- `/{categoria}/`: página da categoria (por exemplo, `/nonclinical-pharma/`). Ela existe sempre que a categoria tem post, mas só é indexável com o `intro` preenchido e 3 posts.
- `/{categoria}/{artigo}/`: o artigo, com o breadcrumb Home > Categoria > Artigo.
- A categoria (`topic`) é **obrigatória**. O id dela não pode repetir o nome de uma página do site (`services`, `about`, `blog`...); o build reprova se repetir.
- Capa do post: campo `cover`, apontando para a imagem (por exemplo, `../../assets/images/blog/minha-capa.png`), mais o `coverAlt`.
- O cartão é um link real para o artigo. Ao clicar, ele se expande em navy até cobrir a tela e o artigo abre com o hero navy.
- O artigo tem sumário (montado a partir dos H2), quadro da autora e o cartão da **página do site que ele apoia** (campo `supports`).
- Trocou a categoria de um post já publicado? A URL muda. Cadastre o 301 da URL antiga.

**Enquanto não houver post publicado:**
- `/blog/` fica em `noindex`, fora do sitemap, e mostra os artigos da autora na imprensa especializada.
- No `npm run dev` (e só nele), o hub mostra 5 cartões de prévia para testar o layout e a animação. Eles nunca vão para o build.

O RSS só aparece com o 1º post publicado.

Um tema só ganha página quando atende às duas condições:
- tem o `intro` preenchido em `src/content/topics/topics.json`;
- tem 3 posts publicados.

## Decisões em aberto que mexem no site

| Decisão | Onde se muda |
|---|---|
| D11 / R1: quadros de autoria ou só link do blog | `AUTHORSHIP_MODE` em `src/config/site.ts` |
| Credenciais detalhadas na página da autora | `SHOW_AUTHOR_CREDENTIALS` em `src/config/site.ts` |
| Fase 2: fundadora | `FOUNDER_PHASE` em `src/config/site.ts` (põe `founder` no schema) e o checklist da arquitetura, seção 10 |
| P7: campos novos do formulário | `src/pages/contact/index.astro` |
| N7: GDPR na política de privacidade | `src/pages/privacy-policy.astro` (revisão jurídica) |
| Frases da tabela 9.1 do plano | Reescritas sem atribuir à empresa a experiência da autora (Home, About) |
