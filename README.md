# Portfolio DAM — guía rápida

Portfolio público bilingüe (ES + toggle EN) de Iván Martín Molina (estudiante DAM).

## URL pública (producción)

**https://ivanmarrtin27.github.io/Portfolio/**

Hosting: GitHub Pages (carpeta `public/`). Datos desde `public/data/portfolio.json` (sin API).

> El hosting gratis de GitHub es **`.github.io`**, no un dominio `.io` genérico.

**Limitación:** GitHub Pages solo sirve estáticos. El panel `/admin/`, el PIN y las APIs no están online. Para editar contenido: actualiza `public/data/portfolio.json` (y assets) y haz push a `main`.

## Stack
- Frontend: HTML/CSS/JS vanilla (`public/`)
- Datos públicos: `public/data/portfolio.json`
- Deploy: GitHub Actions → GitHub Pages (`.github/workflows/github-pages.yml`)
- Opcional local: Cloudflare Wrangler + D1 + `/admin/` para editar offline (`npm run dev`) — **no hay deploy Cloudflare**

## Arranque local (opcional, con admin)

```bash
npm install
copy .dev.vars.example .dev.vars
# Edita ADMIN_PIN y SESSION_SECRET en .dev.vars

npx wrangler d1 migrations apply portfolio-dam-db --local
npm run dev
```

- Web: `http://127.0.0.1:8788/`
- Admin: `http://127.0.0.1:8788/admin`

Tras editar en admin local, exporta o copia el contenido a `public/data/portfolio.json` antes del push.

## Deploy (GitHub Pages)

Al hacer push a `main`, el workflow publica `public/` en:

**https://ivanmarrtin27.github.io/Portfolio/**

## Contenido
- Perfil / sobre mí / YouTube **unlisted**
- Proyectos, certificados y CV en `public/data/portfolio.json` + `public/assets/`
- CV / certificados: archivos en `public/assets/cv/` y `public/assets/certificates/` (rutas tipo `/assets/...`)

## Emails
Plantillas en `emails/` (cold EN/ES + follow-up). Solo enlaza la web pública:

`https://ivanmarrtin27.github.io/Portfolio/`

## QR
Actualiza URLs en `PDF/config.js` y genera:
- `PDF/qr-portfolio.html` (público — compartible)
- `PDF/qr-admin.html` (solo local / personal; no hay admin online)

---

Este es mi portfolio personal. Lo uso para enviarlo a empresas y que puedan conocer mejor mi perfil, proyectos y formación (DAM).

**Web:** https://ivanmarrtin27.github.io/Portfolio/
