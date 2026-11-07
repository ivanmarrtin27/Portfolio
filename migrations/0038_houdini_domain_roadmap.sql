-- Houdini Bet: roadmap paso 3 = dominio propio
UPDATE projects SET
  docs_es = 'Estado: en desarrollo (MVP usable en pages.dev).

Stack: Cloudflare Workers, D1, UI HTML/CSS/JS (PWA), sync de fixtures/odds.

Features: Partidos (hoy/live), Top 10 del día, Stats de tips, Semanal (combinada ~cuota 10 + Conservadora ~cuota 5), explorador de Ligas con clasificaciones.

Modelo: Poisson + mercados 1X2 / O-U / BTTS / extras; value cuando hay book. Los tips son orientativos; no garantizan acierto ni beneficio.

Roadmap (cuando el producto esté completo):
1) Registro + login
2) Planes Premium con suscripción / pago
3) Dominio propio (p. ej. houdini-bet.dev) cuando el producto esté completo

Demo: https://houdini-bet.pages.dev
Código: https://github.com/ivanmarrtin2703/HoudiniBet-v1.0',
  docs_en = 'Status: in development (usable MVP on pages.dev).

Stack: Cloudflare Workers, D1, HTML/CSS/JS UI (PWA), fixture/odds sync.

Features: Matches (today/live), daily Top 10, tip Stats, Weekly combo (~odds 10 + Conservative ~odds 5), Leagues explorer with standings.

Model: Poisson + 1X2 / O-U / BTTS / extras; value when book odds exist. Tips are indicative; they do not guarantee hits or profit.

Roadmap (once the product is complete):
1) Sign-up + login
2) Premium plans with subscription / payment
3) Custom domain (e.g. houdini-bet.dev) once the product is complete

Demo: https://houdini-bet.pages.dev
Code: https://github.com/ivanmarrtin2703/HoudiniBet-v1.0',
  image_key = '/assets/projects/houdini-bet/logo.png',
  updated_at = datetime('now')
WHERE title_es = 'Houdini Bet' OR title_en = 'Houdini Bet';
