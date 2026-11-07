-- Houdini Analytics v1.1: branding, repo, demo Pages
UPDATE projects SET
  title_es = 'Houdini Analytics v1.1',
  title_en = 'Houdini Analytics v1.1',
  description_es = 'App de predicciones de fútbol (Houdini Analytics v1.1) con modelo Poisson: tips, probabilidades y cuotas orientativas para ligas top europeas. En desarrollo activo sobre Cloudflare (Worker + D1).',
  description_en = 'Football predictions app (Houdini Analytics v1.1) with a Poisson model: tips, probabilities and indicative odds for top European leagues. Active development on Cloudflare (Worker + D1).',
  docs_es = 'Versión: v1.1 (Houdini Analytics).

Estado: en desarrollo (MVP usable en pages.dev).

Stack: Cloudflare Workers, D1, UI HTML/CSS/JS (PWA), sync de fixtures/odds.

Features: Partidos (hoy/live), Top 10 del día, Aciertos / Stats de tips, explorador de Ligas con clasificaciones.

Modelo: Poisson + mercados 1X2 / O-U / BTTS / extras; value cuando hay book. Los tips son orientativos; no garantizan acierto ni beneficio.

Roadmap (cuando el producto esté completo):
1) Registro + login
2) Planes Premium con suscripción / pago
3) Dominio propio (p. ej. houdini-bet.dev) cuando el producto esté completo

Demo: https://houdini-analytics.pages.dev
Código: https://github.com/ivanmarrtin27/houdini-analytics',
  docs_en = 'Version: v1.1 (Houdini Analytics).

Status: in development (usable MVP on pages.dev).

Stack: Cloudflare Workers, D1, HTML/CSS/JS UI (PWA), fixture/odds sync.

Features: Matches (today/live), daily Top 10, Hits / tip Stats, Leagues explorer with standings.

Model: Poisson + 1X2 / O-U / BTTS / extras; value when book odds exist. Tips are indicative; they do not guarantee hits or profit.

Roadmap (once the product is complete):
1) Sign-up + login
2) Premium plans with subscription / payment
3) Custom domain (e.g. houdini-bet.dev) once the product is complete

Demo: https://houdini-analytics.pages.dev
Code: https://github.com/ivanmarrtin27/houdini-analytics',
  live_url = 'https://houdini-analytics.pages.dev',
  repo_url = 'https://github.com/ivanmarrtin27/houdini-analytics',
  image_key = '/assets/projects/houdini-bet/logo.png',
  updated_at = datetime('now')
WHERE id = 3
   OR title_es = 'Houdini Bet'
   OR title_en = 'Houdini Bet'
   OR title_es LIKE 'Houdini Analytics%'
   OR title_en LIKE 'Houdini Analytics%';
