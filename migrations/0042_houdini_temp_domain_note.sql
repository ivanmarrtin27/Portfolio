-- Houdini Analytics: nota dominio temporal (.pages.dev/.dev → .es/.com)
UPDATE projects SET
  docs_es = 'Versión: v1.1 (Houdini Analytics).

Estado: en desarrollo (MVP usable en pages.dev).

Nota: la URL actual (.pages.dev / .dev) es temporal mientras desarrollo; más adelante tendrá dominio propio (.es o .com).

Stack: Cloudflare Workers, D1, UI HTML/CSS/JS (PWA), sync de fixtures/odds.

Features: Partidos (hoy/live), Top 10 del día, Aciertos / Stats de tips, explorador de Ligas con clasificaciones.

Modelo: Poisson + mercados 1X2 / O-U / BTTS / extras; value cuando hay book. Los tips son orientativos; no garantizan acierto ni beneficio.

Roadmap (cuando el producto esté completo):
1) Registro + login
2) Planes Premium con suscripción / pago
3) Dominio propio (.es o .com) cuando el producto esté completo

Demo: https://houdini-analytics.pages.dev
Código: https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
  docs_en = 'Version: v1.1 (Houdini Analytics).

Status: in development (usable MVP on pages.dev).

Note: the current .pages.dev / .dev URL is temporary during development; a proper .es or .com domain will come later.

Stack: Cloudflare Workers, D1, HTML/CSS/JS UI (PWA), fixture/odds sync.

Features: Matches (today/live), daily Top 10, Hits / tip Stats, Leagues explorer with standings.

Model: Poisson + 1X2 / O-U / BTTS / extras; value when book odds exist. Tips are indicative; they do not guarantee hits or profit.

Roadmap (once the product is complete):
1) Sign-up + login
2) Premium plans with subscription / payment
3) Custom domain (.es or .com) once the product is complete

Demo: https://houdini-analytics.pages.dev
Code: https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
  updated_at = datetime('now')
WHERE id = 3
   OR title_es = 'Houdini Bet'
   OR title_en = 'Houdini Bet'
   OR title_es LIKE 'Houdini Analytics%'
   OR title_en LIKE 'Houdini Analytics%';
