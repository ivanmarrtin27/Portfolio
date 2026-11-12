-- Houdini Analytics v1.1: copy actual (Pages+Worker+D1, auth/Premium vivos)
UPDATE projects SET
  title_es = 'Houdini Analytics v1.1',
  title_en = 'Houdini Analytics v1.1',
  description_es = 'Predicciones de fútbol con modelo Poisson: partidos, tips/Top 10, Aciertos y Premium. Cloudflare Pages + Worker + D1.',
  description_en = 'Football predictions with a Poisson model: matches, tips/Top 10, hit tracking and Premium. Cloudflare Pages + Worker + D1.',
  docs_es = 'Versión: v1.1 (Houdini Analytics).

Estado: producto usable en pages.dev (auth + Premium activos).

Nota: la URL actual (.pages.dev) es temporal; más adelante dominio propio (.es o .com).

Stack: Cloudflare Pages, Worker, D1; UI HTML/CSS/JS (PWA); sync de fixtures/odds.

Features: Partidos (hoy/live), Top 10 del día, Aciertos / Stats, explorador de Ligas, auth (registro/login/Google) y Premium (Stripe).

Modelo: Poisson + mercados tip (O/U, BTTS, DC, extras). Tips orientativos; no garantizan acierto ni beneficio.

Roadmap:
1) Dominio propio (.es o .com)

Demo: https://houdini-analytics.pages.dev
Código: https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
  docs_en = 'Version: v1.1 (Houdini Analytics).

Status: usable product on pages.dev (auth + Premium live).

Note: the current .pages.dev URL is temporary; a proper .es or .com domain will come later.

Stack: Cloudflare Pages, Worker, D1; HTML/CSS/JS UI (PWA); fixture/odds sync.

Features: Matches (today/live), daily Top 10, Hits / tip Stats, Leagues explorer, auth (sign-up/login/Google) and Premium (Stripe).

Model: Poisson + tip markets (O/U, BTTS, DC, extras). Tips are indicative; they do not guarantee hits or profit.

Roadmap:
1) Custom domain (.es or .com)

Demo: https://houdini-analytics.pages.dev
Code: https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
  tech = 'Cloudflare Pages, Workers, D1, JavaScript, PWA',
  live_url = 'https://houdini-analytics.pages.dev',
  repo_url = 'https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
  updated_at = datetime('now')
WHERE id = 3
   OR title_es = 'Houdini Bet'
   OR title_en = 'Houdini Bet'
   OR title_es LIKE 'Houdini Analytics%'
   OR title_en LIKE 'Houdini Analytics%';
