-- Reposition profile for international internship 2027 + fix project logos/live URLs + shorten Klaro docs

UPDATE profile SET
  tagline_es = 'Estudiante de DAM. Busco prácticas internacionales ~3 meses en 2027.',
  tagline_en = 'DAM student seeking an international internship (~3 months) in 2027.',
  about_es = 'Tengo 20 años, soy de Almería y estudio el Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM). Combino lo del aula con proyectos propios: webs, apps móviles y herramientas en la nube.

Aprendo rápido aplicando lo que estudio a productos reales —carta digital por QR, bots, apps Android y demos web—. Me interesa el desarrollo de software en equipos internacionales.

Busco unas prácticas presenciales de unos tres meses en 2027. Las fechas exactas aún están por confirmar.',
  about_en = 'I''m 20, from Almería (Spain), and I study Higher Vocational Training in Multiplatform Application Development (DAM). I combine coursework with my own projects: websites, mobile apps and cloud tools.

I learn by shipping real products —QR digital menus, bots, Android apps and web demos. I want to grow as a software developer in an international team.

I am looking for an on-site internship of about three months in 2027. Exact dates are still to be confirmed.',
  location_pref_es = 'Prácticas presenciales ~3 meses en 2027 (fechas por confirmar). Abierto a Europa.',
  location_pref_en = 'On-site internship ~3 months in 2027 (dates TBC). Open to relocating in Europe.',
  updated_at = datetime('now')
WHERE id = 1;

-- Logos: use SVG files that exist in the repo
UPDATE projects SET image_key = '/assets/projects/qr-bares/logo.svg', updated_at = datetime('now')
WHERE id = 2 OR title_es LIKE '%Carta digital QR%' OR title_en LIKE '%QR digital menu%';

UPDATE projects SET image_key = '/assets/projects/citaclara/klaro-logo.svg', updated_at = datetime('now')
WHERE id = 7 OR title_es = 'Klaro-Chat Bot' OR title_en = 'Klaro-Chat Bot';

UPDATE projects SET image_key = '/assets/projects/houdini-bet/logo.svg', updated_at = datetime('now')
WHERE id = 3 OR title_es = 'Houdini Bet';

UPDATE projects SET
  image_key = '/assets/projects/melodix/logo.svg',
  live_url = '/demos/melodix/',
  updated_at = datetime('now')
WHERE id = 4 OR title_es = 'Melodix';

UPDATE projects SET image_key = '/assets/projects/ovisoft/logo.svg', updated_at = datetime('now')
WHERE id = 5 OR title_es LIKE 'Ovisoft%';

UPDATE projects SET
  image_key = '/assets/projects/quedada/logo.svg',
  live_url = '',
  docs_es = 'Idea de verano: al jugar con amigos no había muchas apps que reunieran tantos juegos míticos y divertidos, así que construí Quedada para lanzarla en la Play Store.

Incluye cinco modos: Qué Prefieres, Impostor, Yo Nunca, Verdades o Retos y Más Probable Que…, con contenido por categorías, icono/splash propios y monetización con interstitials (cooldown para no saturar).
Stack: Expo, React Native y TypeScript. Cuenta de desarrollador y licencia listas; ahora mismo necesita testers antes del lanzamiento.

Política de privacidad (Play Store): https://ivanmarrtin2703.github.io/quedada-privacy/
Código: https://github.com/ivanmarrtin2703/Quedada',
  docs_en = 'A summer idea: when playing with friends there were few apps that gathered so many classic, fun party games, so I built Quedada to ship it on the Play Store.

Five modes: Would You Rather, Impostor, Never Have I Ever, Truth or Dare and Most Likely To…, with category content, custom icon/splash and interstitial ads (cooldown so they do not overwhelm).
Stack: Expo, React Native and TypeScript. Developer account and license ready; it currently needs testers before launch.

Privacy policy (Play Store): https://ivanmarrtin2703.github.io/quedada-privacy/
Code: https://github.com/ivanmarrtin2703/Quedada',
  updated_at = datetime('now')
WHERE id = 6 OR title_es = 'Quedada';

-- Klaro: remove pricing from public docs (internship audience)
UPDATE projects SET
  docs_es = 'Lo empecé porque muchos locales pierden mensajes fuera de horario o mientras atienden. Quería un recepcionista que viviera donde ya escriben los clientes — WhatsApp — sin obligar al local a montar otra app ni a configurarlo todo solo.

Klaro responde precios y horarios, agenda citas y recuerda al cliente. Incluye landing de captación, bot multi-local con menús interactivos (servicio → día → hora → confirmar), panel agency y panel Hoy para ver la agenda del día. La IA tiene fallback por reglas si el proveedor falla.

Stack: Cloudflare Pages, Functions, D1, JavaScript y WhatsApp Cloud API. Modelo agency managed: yo configuro cada negocio. Ahora mismo en piloto.
Landing en vivo: https://klaroapp.pages.dev
Probar chat: https://klaroapp.pages.dev/demo/
Código: https://github.com/ivanmarrtin2703/Klaro-Chat-Bot',
  docs_en = 'I started it because many shops miss messages after hours or while serving clients. I wanted a receptionist that lives where clients already write — WhatsApp — without forcing the shop to install another app or configure everything alone.

Klaro handles prices and hours, books appointments and sends reminders. It includes a lead landing, a multi-location bot with interactive menus (service → day → time → confirm), an agency panel and a Hoy panel for the day''s agenda. The AI has a rule-based fallback if the provider fails.

Stack: Cloudflare Pages, Functions, D1, JavaScript and WhatsApp Cloud API. Agency-managed model: I configure each business. Currently in pilot.
Live landing: https://klaroapp.pages.dev
Try chat: https://klaroapp.pages.dev/demo/
Code: https://github.com/ivanmarrtin2703/Klaro-Chat-Bot',
  updated_at = datetime('now')
WHERE id = 7
   OR title_es = 'Klaro-Chat Bot'
   OR title_en = 'Klaro-Chat Bot';
