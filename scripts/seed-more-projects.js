const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const BASE = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:8788';
const baseUrl = new URL(BASE.endsWith('/') ? BASE : `${BASE}/`);

function readAdminPin() {
  if (process.env.ADMIN_PIN) return String(process.env.ADMIN_PIN).trim();
  const raw = fs.readFileSync(path.join(__dirname, '..', '.dev.vars'), 'utf8');
  const match = raw.match(/^ADMIN_PIN=(.+)$/m);
  if (!match) throw new Error('ADMIN_PIN not found in .dev.vars');
  return match[1].trim();
}

function request(method, pathName, { body, cookie, headers } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body == null ? null : Buffer.isBuffer(body) ? body : Buffer.from(body);
    const url = new URL(pathName, baseUrl);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        ...(payload ? { 'Content-Length': payload.length } : {}),
        ...(headers || {}),
        ...(cookie ? { Cookie: cookie } : {})
      }
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve({ status: res.statusCode, headers: res.headers, data: buf.toString('utf8') });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function multipart(fields, fileField) {
  const boundary = `----portfolio${Date.now()}${Math.random().toString(16).slice(2)}`;
  const parts = [];
  for (const [name, value] of Object.entries(fields)) {
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
    );
  }
  parts.push(
    `--${boundary}\r\nContent-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"\r\nContent-Type: ${fileField.contentType}\r\n\r\n`
  );
  return {
    body: Buffer.concat([
      Buffer.from(parts.join(''), 'utf8'),
      fileField.buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
    ]),
    contentType: `multipart/form-data; boundary=${boundary}`
  };
}

const PROJECTS = [
  {
    title_es: 'Houdini Analytics v1.1',
    title_en: 'Houdini Analytics v1.1',
    description_es:
      'App de predicciones de fútbol (Houdini Analytics v1.1) con modelo Poisson: tips, probabilidades y cuotas orientativas para ligas top europeas. En desarrollo activo sobre Cloudflare (Worker + D1).',
    description_en:
      'Football predictions app (Houdini Analytics v1.1) with a Poisson model: tips, probabilities and indicative odds for top European leagues. Active development on Cloudflare (Worker + D1).',
    docs_es: [
      'Versión: v1.1 (Houdini Analytics).',
      '',
      'Estado: en desarrollo (MVP usable en pages.dev).',
      '',
      'Nota: la URL actual (.pages.dev / .dev) es temporal mientras desarrollo; más adelante tendrá dominio propio (.es o .com).',
      '',
      'Stack: Cloudflare Workers, D1, UI HTML/CSS/JS (PWA), sync de fixtures/odds.',
      '',
      'Features: Partidos (hoy/live), Top 10 del día, Aciertos / Stats de tips, explorador de Ligas con clasificaciones.',
      '',
      'Modelo: Poisson + mercados 1X2 / O-U / BTTS / extras; value cuando hay book. Tips orientativos; no garantizan acierto ni beneficio.',
      '',
      'Roadmap (cuando el producto esté completo):',
      '1) Registro + login',
      '2) Planes Premium con suscripción / pago',
      '3) Dominio propio (.es o .com) cuando el producto esté completo',
      '',
      'Demo en vivo: https://houdini-analytics.pages.dev',
      'Código: https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
      'Portfolio: https://ivanmartin.pages.dev/'
    ].join('\n'),
    docs_en: [
      'Version: v1.1 (Houdini Analytics).',
      '',
      'Status: in development (usable MVP on pages.dev).',
      '',
      'Note: the current .pages.dev / .dev URL is temporary during development; a proper .es or .com domain will come later.',
      '',
      'Stack: Cloudflare Workers, D1, HTML/CSS/JS UI (PWA), fixture/odds sync.',
      '',
      'Features: Matches (today/live), daily Top 10, Hits / tip Stats, Leagues explorer with standings.',
      '',
      'Model: Poisson + 1X2 / O-U / BTTS / extras; value when book odds exist. Indicative tips; no guaranteed hits or profit.',
      '',
      'Roadmap (once the product is complete):',
      '1) Sign-up + login',
      '2) Premium plans with subscription / payment',
      '3) Custom domain (.es or .com) once the product is complete',
      '',
      'Live demo: https://houdini-analytics.pages.dev',
      'Code: https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
      'Portfolio: https://ivanmartin.pages.dev/'
    ].join('\n'),
    tech: 'Cloudflare Workers, D1, JavaScript, PWA',
    live_url: 'https://houdini-analytics.pages.dev',
    repo_url: 'https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
    sort_order: 10,
    logo: 'public/assets/projects/houdini-bet/logo.png'
  },
  {
    title_es: 'Melodix',
    title_en: 'Melodix',
    description_es: 'En desarrollo. App de música personal (v1) que empecé a mitad de verano para usarla yo: quería algo a mi medida, sin depender de las grandes suscripciones, y con la idea de publicarla en Play Store a medio plazo.',
    description_en: 'In development. Personal music app (v1) I started mid-summer for my own use: I wanted something built my way, without relying on the major subscriptions, and with the goal of publishing it on the Play Store in the medium term.',
    docs_es: [
      'Quería una app de música propia que pudiera usar a diario sin atarme a las suscripciones de las plataformas grandes, y con margen para ir puliéndola a mi ritmo.',
      '',
      'La construí por cuenta propia con React, Vite y PWA en el frontend, y FastAPI en el backend. Lo que hay ahora es la v1: una base funcional, todavía lejos del nivel de optimización de productos maduros del mercado.',
      '',
      'Sigue en desarrollo. Cuando termine el TFG quiero publicar una versión más pulida.',
      'Código: https://github.com/ivanmarrtin2703/Melodix-v1',
      'Demo en este portfolio: /demos/melodix/'
    ].join('\n'),
    docs_en: [
      'I wanted my own music app I could use every day without being tied to the major platforms\' subscriptions, with room to keep refining it at my own pace.',
      '',
      'I built it on my own with React, Vite and a PWA on the frontend, and FastAPI on the backend. What\'s here now is v1: a working base, still far from the optimization level of mature market products.',
      '',
      'It is still in development. When I finish my final-year project (TFG), I want to publish a more polished version.',
      'Code: https://github.com/ivanmarrtin2703/Melodix-v1',
      'Demo on this portfolio: /demos/melodix/'
    ].join('\n'),
    tech: 'React, Vite, PWA, FastAPI',
    live_url: '/demos/melodix/',
    repo_url: 'https://github.com/ivanmarrtin2703/Melodix-v1',
    sort_order: 20,
    logo: 'public/assets/projects/melodix/logo.png'
  },
  {
    title_es: 'Ovisoft · Programa de IA',
    title_en: 'Ovisoft · AI program',
    description_es: 'En desarrollo. Idea propia de vídeo marketing automatizado para clientes de Ovisoft: de un chat con productos y keywords a piezas para Instagram y TikTok. No llegué a cerrarlo por falta de recursos.',
    description_en: 'In development. Own idea for automated video marketing for Ovisoft clients: from a chat with products and keywords to pieces for Instagram and TikTok. I could not finish it due to lack of resources.',
    docs_es: [
      'El objetivo era ayudar a empresas clientes de Ovisoft a generar contenido corto y constante para redes sin montar un equipo de vídeo cada mes.',
      '',
      'La idea del producto: una suscripción mensual con un chat donde meter productos, palabras clave y contexto, y el sistema generaría vídeos para Instagram, TikTok y plataformas similares. Stack: Angular y TypeScript en el frontend; Node y Express en el backend.',
      '',
      'No está terminado: faltaron recursos para completarlo. Queda una demo de la interfaz en este portfolio; sirve para ver el enfoque, no un producto cerrado.',
      'Demo UI: /demos/ovisoft/'
    ].join('\n'),
    docs_en: [
      'The goal was to help Ovisoft client companies generate short, steady social content without standing up a video team every month.',
      '',
      'The product idea: a monthly subscription with a chat where they entered products, keywords and context, and the system would generate videos for Instagram, TikTok and similar platforms. Stack: Angular and TypeScript on the frontend; Node and Express on the backend.',
      '',
      'It is not finished: there were not enough resources to complete it. A UI demo remains on this portfolio; it shows the product direction, not a closed product.',
      'UI demo: /demos/ovisoft/'
    ].join('\n'),
    tech: 'Angular, TypeScript, Node, Express',
    live_url: '/demos/ovisoft/',
    repo_url: '',
    sort_order: 30,
    logo: 'public/assets/projects/ovisoft/logo.png'
  },
  {
    title_es: 'Quedada',
    title_en: 'Quedada',
    description_es: 'En desarrollo. App móvil (Expo / React Native) que junta juegos míticos de fiesta para quedadas con amigos. En testing en Play Console; llegada a Google Play próximamente.',
    description_en: 'In development. Mobile app (Expo / React Native) that gathers classic party games for hangouts with friends. In Play Console testing; coming to Google Play soon.',
    docs_es: [
      'Idea de verano: al jugar con amigos no había muchas apps que reunieran tantos juegos míticos y divertidos, así que construí Quedada para lanzarla en la Play Store.',
      '',
      'Incluye cinco modos: Qué Prefieres, Impostor, Yo Nunca, Verdades o Retos y Más Probable Que…, con contenido por categorías, icono/splash propios y monetización con interstitials (cooldown para no saturar).',
      'Stack: Expo, React Native y TypeScript. Cuenta de desarrollador y licencia listas; ahora mismo necesita testers antes del lanzamiento.',
      '',
      'Política de privacidad (Play Store): https://ivanmarrtin2703.github.io/quedada-privacy/'
    ].join('\n'),
    docs_en: [
      'A summer idea: when playing with friends there were few apps that gathered so many classic, fun party games, so I built Quedada to ship it on the Play Store.',
      '',
      'Five modes: Would You Rather, Impostor, Never Have I Ever, Truth or Dare and Most Likely To…, with category content, custom icon/splash and interstitial ads (cooldown so they do not overwhelm).',
      'Stack: Expo, React Native and TypeScript. Developer account and license ready; it currently needs testers before launch.',
      '',
      'Privacy policy (Play Store): https://ivanmarrtin2703.github.io/quedada-privacy/'
    ].join('\n'),
    tech: 'Expo, React Native, TypeScript',
    live_url: 'https://ivanmarrtin2703.github.io/quedada-privacy/',
    repo_url: 'https://github.com/ivanmarrtin2703/Quedada',
    sort_order: 40,
    logo: 'public/assets/projects/quedada/logo.png'
  }
];

async function upsertProject(cookie, existing, payload) {
  if (existing) {
    const updated = await request('PUT', `/api/admin/projects/${existing.id}`, {
      cookie,
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    if (updated.status !== 200) throw new Error(`update ${payload.title_es}: ${updated.data}`);
    return JSON.parse(updated.data).project;
  }
  const created = await request('POST', '/api/admin/projects', {
    cookie,
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  });
  if (created.status !== 201 && created.status !== 200) {
    throw new Error(`create ${payload.title_es}: ${created.data}`);
  }
  return JSON.parse(created.data).project;
}

function publicAssetPath(logoPath) {
  return `/${String(logoPath).replace(/^public[\\/]/, '').replace(/\\/g, '/')}`;
}

async function setStaticCover(cookie, project, payload, logoPath) {
  const imageKey = publicAssetPath(logoPath);
  const updated = await request('PUT', `/api/admin/projects/${project.id}`, {
    cookie,
    body: JSON.stringify({ ...payload, image_key: imageKey }),
    headers: { 'Content-Type': 'application/json' }
  });
  if (updated.status !== 200) {
    throw new Error(`static cover ${project.id}: ${updated.status} ${updated.data}`);
  }
}

async function uploadCover(cookie, projectId, logoPath) {
  const abs = path.join(__dirname, '..', logoPath);
  if (!fs.existsSync(abs)) throw new Error(`logo missing: ${logoPath}`);
  const buffer = fs.readFileSync(abs);
  const contentType = path.extname(logoPath).toLowerCase() === '.svg' ? 'image/svg+xml' : 'image/png';
  const form = multipart(
    { purpose: 'project', project_id: String(projectId) },
    { name: 'file', filename: path.basename(logoPath), contentType, buffer }
  );
  const up = await request('POST', '/api/admin/upload', {
    cookie,
    body: form.body,
    headers: { 'Content-Type': form.contentType }
  });
  if (up.status !== 201 && up.status !== 200) {
    throw new Error(`cover upload ${projectId}: ${up.status} ${up.data}`);
  }
  // also as screenshot for accordion
  const shot = multipart(
    {
      purpose: 'project_asset',
      project_id: String(projectId),
      kind: 'screenshot',
      label: 'Logo',
      sort_order: '0'
    },
    { name: 'file', filename: path.basename(logoPath), contentType, buffer }
  );
  const up2 = await request('POST', '/api/admin/upload', {
    cookie,
    body: shot.body,
    headers: { 'Content-Type': shot.contentType }
  });
  if (up2.status !== 201 && up2.status !== 200) {
    throw new Error(`shot upload ${projectId}: ${up2.status} ${up2.data}`);
  }
}

async function main() {
  const pin = readAdminPin();
  const preferStatic = process.env.STATIC_ASSETS === '1';
  const login = await request('POST', '/api/admin/login', {
    body: JSON.stringify({ pin }),
    headers: { 'Content-Type': 'application/json' }
  });
  if (login.status !== 200) throw new Error(`login failed: ${login.data}`);
  const cookie = ((login.headers['set-cookie'] || [])[0] || '').split(';')[0];
  if (!cookie) throw new Error('no session cookie');

  const list = await request('GET', '/api/admin/projects', { cookie });
  if (list.status !== 200) throw new Error(`list failed: ${list.data}`);
  const projects = JSON.parse(list.data).projects || [];

  for (const item of PROJECTS) {
    const existing = projects.find((p) => p.title_es === item.title_es);
    const { logo, ...payload } = item;
    const project = await upsertProject(cookie, existing, payload);
    console.log(existing ? 'updated' : 'created', project.id, project.title_es);

    // remove old Logo screenshots then re-upload
    for (const asset of project.assets || []) {
      if ((asset.label || '') === 'Logo') {
        await request('DELETE', `/api/admin/projects/${project.id}/assets/${asset.id}`, { cookie });
      }
    }
    if (preferStatic) {
      await setStaticCover(cookie, project, payload, logo);
      console.log('cover static', item.title_es, publicAssetPath(logo));
    } else {
      try {
        await uploadCover(cookie, project.id, logo);
        console.log('cover ok', item.title_es);
      } catch (err) {
        console.warn('upload failed, using static logo:', err.message);
        await setStaticCover(cookie, project, payload, logo);
        console.log('cover static', item.title_es, publicAssetPath(logo));
      }
    }
  }

  const portfolio = await request('GET', '/api/portfolio');
  const parsed = JSON.parse(portfolio.data);
  const titles = (parsed.projects || []).map((p) => p.title_es);
  console.log('portfolio titles:', titles.join(' | '));
  console.log('count', titles.length);
  const needed = PROJECTS.map((p) => p.title_es);
  for (const t of needed) {
    if (!titles.includes(t)) throw new Error(`missing in portfolio: ${t}`);
  }
  console.log('seed-more-projects OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
