# Portfolio DAM — guía rápida

Portfolio público (ES + toggle EN) + panel privado `/admin` con PIN, mismo patrón mental que QR Bares.

## Stack
- Cloudflare Pages (`public/`)
- Pages Functions (`functions/`)
- D1 (metadatos) + R2 (PDF/imágenes)
- Auth: PIN + cookie HMAC

## Arranque local

```bash
npm install
copy .dev.vars.example .dev.vars
# Edita ADMIN_PIN y SESSION_SECRET en .dev.vars

npx wrangler d1 migrations apply portfolio-dam-db --local
npm run dev
```

- Web: `http://127.0.0.1:8788/`
- Admin: `http://127.0.0.1:8788/admin`

## Deploy (Cloudflare)

1. Crea D1 y R2 (o deja que Wrangler los aprovisione al ajustar IDs):

```bash
npx wrangler d1 create portfolio-dam-db
npx wrangler r2 bucket create portfolio-dam-files
```

2. Pega el `database_id` real en `wrangler.jsonc`.
3. Configura secrets en el proyecto Pages:

```bash
npx wrangler pages secret put ADMIN_PIN --project-name ivanmartin
npx wrangler pages secret put SESSION_SECRET --project-name ivanmartin
```

4. Migra remoto y despliega:

```bash
npm run db:migrate:remote
npx wrangler pages deploy public --project-name ivanmartin
```

URL: `https://ivanmartin.pages.dev/` · Admin: `https://ivanmartin.pages.dev/admin/`

5. Actualiza URLs en `PDF/config.js` y genera los QR abriendo:
   - `PDF/qr-portfolio.html` (público — compartible)
   - `PDF/qr-admin.html` (privado — solo tuyo)

## Qué gestionar en el admin
- Perfil / sobre mí / YouTube **unlisted**
- Proyectos (CRUD + imagen)
- Certificados y CV: **archivos estáticos** en `public/assets/certificates/` y `public/assets/cv/` (sin R2 ni tarjeta). Pega la ruta `/assets/...` en el admin y despliega.

## Archivos (sin R2)
1. Copia el PDF/imagen a `public/assets/cv/` o `public/assets/certificates/`
2. En `/admin/` guarda la ruta (ej. `/assets/cv/cv.pdf`)
3. `npm run deploy`

## Emails
Plantillas en `emails/` (cold EN/ES + follow-up). Solo enlaza la web pública.

## Proyecto destacado: CitaClara

Producto propio (recepcionista WhatsApp + IA para peluquerías). Código en carpeta hermana `../IA WhatsApp`.

- Demo portfolio: `/demos/citaclara/`
- Logo: `/assets/projects/citaclara/logo.svg`
- Seed en D1 (con portfolio en `npm run dev`):

```bash
npm run seed:citaclara
# Opcional:
# set CITACLARA_LIVE=https://citaclara.pages.dev
# set CITACLARA_REPO=https://github.com/USER/citaclara
```

---

Este es mi portfolio personal. Lo uso para enviarlo a empresas y que puedan conocer mejor mi perfil, proyectos y formación (DAM).

Web pública: https://ivanmartin.pages.dev/
