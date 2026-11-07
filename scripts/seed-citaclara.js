const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const BASE = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:8788';
const baseUrl = new URL(BASE.endsWith('/') ? BASE : `${BASE}/`);
const TITLE_ES = 'Klaro-Chat Bot';

const LIVE_URL = process.env.CITACLARA_LIVE || 'https://klaroapp.pages.dev';
const REPO_URL = process.env.CITACLARA_REPO || 'https://github.com/ivanmarrtin2703/Klaro-Chat-Bot';
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
    const req = lib.request(
      {
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
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            buffer: buf,
            data: buf.toString('utf8')
          });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function multipart(fields, fileField) {
  const boundary = `----portfolio${Date.now()}`;
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

async function main() {
  const pin = readAdminPin();
  const login = await request('POST', '/api/admin/login', {
    body: JSON.stringify({ pin }),
    headers: { 'Content-Type': 'application/json' }
  });
  if (login.status !== 200) throw new Error(`login failed: ${login.status} ${login.data}`);
  const cookie = ((login.headers['set-cookie'] || [])[0] || '').split(';')[0];
  if (!cookie) throw new Error('no session cookie');

  const list = await request('GET', '/api/admin/projects', { cookie });
  if (list.status !== 200) throw new Error(`list projects failed: ${list.data}`);
  const projects = JSON.parse(list.data).projects || [];
  let project =
    projects.find((p) => p.title_es === TITLE_ES) ||
    projects.find((p) => p.title_es === 'CitaClara') ||
    projects.find((p) => p.title_es === 'SalónResponde' || p.title_es === 'SalonResponde');

  const payload = {
    title_es: TITLE_ES,
    title_en: 'Klaro-Chat Bot',
    description_es:
      'En desarrollo. Producto propio: recepcionista con IA por WhatsApp para negocios con cita. Responde, agenda y recuerda; ahora en piloto.',
    description_en:
      'In development. Own product: AI WhatsApp receptionist for appointment businesses. Replies, books and reminds; currently in pilot.',
    docs_es: [
      'Lo empecé porque muchos locales pierden mensajes fuera de horario o mientras atienden. Quería un recepcionista que viviera donde ya escriben los clientes — WhatsApp — sin obligar al local a montar otra app ni a configurarlo todo solo.',
      'Klaro responde precios y horarios, agenda citas y recuerda al cliente. Incluye landing de captación, bot multi-local con menús interactivos (servicio → día → hora → confirmar), panel agency y panel Hoy para ver la agenda del día. La IA tiene fallback por reglas si el proveedor falla.',
      [
        'Stack: Cloudflare Pages, Functions, D1, JavaScript y WhatsApp Cloud API. Modelo agency managed: yo configuro cada negocio. Ahora mismo en piloto.',
        LIVE_URL ? `Landing en vivo: ${LIVE_URL}` : '',
        LIVE_URL ? `Probar chat: ${LIVE_URL.replace(/\/$/, '')}/demo/` : '',
        REPO_URL ? `Código: ${REPO_URL}` : ''
      ]
        .filter(Boolean)
        .join('\n')
    ].join('\n\n'),
    docs_en: [
      'I started it because many shops miss messages after hours or while serving clients. I wanted a receptionist that lives where clients already write — WhatsApp — without forcing the shop to install another app or configure everything alone.',
      'Klaro handles prices and hours, books appointments and sends reminders. It includes a lead landing, a multi-location bot with interactive menus (service → day → time → confirm), an agency panel and a Hoy panel for the day\'s agenda. The AI has a rule-based fallback if the provider fails.',
      [
        'Stack: Cloudflare Pages, Functions, D1, JavaScript and WhatsApp Cloud API. Agency-managed model: I configure each business. Currently in pilot.',
        LIVE_URL ? `Live landing: ${LIVE_URL}` : '',
        LIVE_URL ? `Try chat: ${LIVE_URL.replace(/\/$/, '')}/demo/` : '',
        REPO_URL ? `Code: ${REPO_URL}` : ''
      ]
        .filter(Boolean)
        .join('\n')
    ].join('\n\n'),
    tech: 'Cloudflare Pages, Functions, D1, JavaScript, WhatsApp Cloud API',
    live_url: LIVE_URL || 'https://klaroapp.pages.dev',
    repo_url: REPO_URL,
    sort_order: 1
  };

  if (project) {
    const updated = await request('PUT', `/api/admin/projects/${project.id}`, {
      cookie,
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    if (updated.status !== 200) throw new Error(`update failed: ${updated.data}`);
    project = JSON.parse(updated.data).project;
    console.log('updated project', project.id);
  } else {
    const created = await request('POST', '/api/admin/projects', {
      cookie,
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    if (created.status !== 201 && created.status !== 200) {
      throw new Error(`create failed: ${created.data}`);
    }
    project = JSON.parse(created.data).project;
    console.log('created project', project.id);
  }

  // Thumb del proyecto: PNG de marca Klaro (image_key en projects)
  const logoPng = path.join(
    __dirname,
    '..',
    'public',
    'assets',
    'projects',
    'citaclara',
    'klaro-logo.png'
  );
  const staticKey = '/assets/projects/citaclara/klaro-logo.png';
  if (fs.existsSync(logoPng)) {
    const put = await request('PUT', `/api/admin/projects/${project.id}`, {
      cookie,
      body: JSON.stringify({ ...payload, image_key: staticKey }),
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('static logo image_key', put.status, staticKey);
  }

  console.log('seed-citaclara OK', { live_url: payload.live_url, repo_url: payload.repo_url });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
