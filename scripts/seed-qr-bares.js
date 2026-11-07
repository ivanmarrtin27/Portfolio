const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const BASE = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:8788';
const baseUrl = new URL(BASE.endsWith('/') ? BASE : `${BASE}/`);
const TITLE_ES = 'Carta digital QR para bares';

const MENU_URL = 'https://mi-carta.pages.dev/?bar=lo-gueno';
const ADMIN_URL = 'https://mi-carta.pages.dev/admin.html?bar=lo-gueno';

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
        resolve({
          status: res.statusCode,
          headers: res.headers,
          buffer: buf,
          data: buf.toString('utf8')
        });
      });
    });
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
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
      `${value}\r\n`
    );
  }

  parts.push(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"\r\n` +
    `Content-Type: ${fileField.contentType}\r\n\r\n`
  );

  const head = Buffer.from(parts.join(''), 'utf8');
  const mid = fileField.buffer;
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  return {
    body: Buffer.concat([head, mid, tail]),
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
  let project = projects.find((p) => p.title_es === TITLE_ES);

  const payload = {
    title_es: TITLE_ES,
    title_en: 'QR digital menu for bars',
    description_es: 'Carta pública + panel del encargado con pegatinas QR. Ejemplo real: Bar Lo Güeno.',
    description_en: 'Public menu + staff panel with QR stickers. Real example: Bar Lo Güeno.',
    docs_es: [
      'Producto propio para locales: el cliente escanea el QR de mesa y ve la carta; el encargado gestiona platos y disponibilidad desde su panel.',
      '',
      `Carta del cliente: ${MENU_URL}`,
      `Panel del encargado: ${ADMIN_URL}`,
      'PIN de prueba del panel del encargado: 9999',
      '',
      'Demos de pegatinas QR en este portfolio:',
      'QR mesa: /demos/qr-bares/mesa',
      'QR encargado: /demos/qr-bares/encargado'
    ].join('\n'),
    docs_en: [
      'Own product for venues: guests scan the table QR to open the menu; staff manage dishes and availability from their panel.',
      '',
      `Customer menu: ${MENU_URL}`,
      `Staff panel: ${ADMIN_URL}`,
      'Staff panel demo PIN: 9999',
      '',
      'QR sticker demos on this portfolio:',
      'Table QR: /demos/qr-bares/mesa',
      'Staff QR: /demos/qr-bares/encargado'
    ].join('\n'),
    tech: 'Cloudflare Pages, Functions, D1, HTML, CSS, JavaScript',
    live_url: MENU_URL,
    repo_url: '',
    image_key: '/assets/projects/qr-bares/logo.png',
    sort_order: 0
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

  // Clear previous QR screenshot assets with our labels, then re-upload
  const assets = project.assets || [];
  for (const asset of assets) {
    if (/^QR (mesa|encargado)$/i.test(asset.label || '')) {
      const del = await request('DELETE', `/api/admin/projects/${project.id}/assets/${asset.id}`, { cookie });
      console.log('deleted asset', asset.id, del.status);
    }
  }

  const files = [
    { file: 'qr-mesa.png', label: 'QR mesa', sort: 0 },
    { file: 'qr-encargado.png', label: 'QR encargado', sort: 1 }
  ];

  const { execFileSync } = require('child_process');
  const preferStatic = process.env.STATIC_ASSETS === '1';
  const remote = /^https:/i.test(BASE);

  for (const item of files) {
    const staticKey = `/assets/demos/qr-bares/${item.file}`;
    const filePath = path.join(__dirname, '..', 'public', 'assets', 'demos', 'qr-bares', item.file);
    if (preferStatic) {
      const sql = `INSERT INTO project_assets (project_id, kind, label, file_key, file_type, sort_order) VALUES (${project.id}, 'screenshot', '${item.label}', '${staticKey}', 'image', ${item.sort});`;
      execFileSync('npx', ['wrangler', 'd1', 'execute', 'portfolio-dam-db', remote ? '--remote' : '--local', '--command', sql], {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
        shell: true
      });
      console.log('static asset', item.label, staticKey);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const form = multipart(
      {
        purpose: 'project_asset',
        project_id: String(project.id),
        kind: 'screenshot',
        label: item.label,
        sort_order: String(item.sort)
      },
      { name: 'file', filename: item.file, contentType: 'image/png', buffer }
    );
    const up = await request('POST', '/api/admin/upload', {
      cookie,
      body: form.body,
      headers: { 'Content-Type': form.contentType }
    });
    if (up.status !== 201 && up.status !== 200) {
      console.warn('upload failed, using static', item.label, up.status, up.data);
      const sql = `INSERT INTO project_assets (project_id, kind, label, file_key, file_type, sort_order) VALUES (${project.id}, 'screenshot', '${item.label}', '${staticKey}', 'image', ${item.sort});`;
      execFileSync('npx', ['wrangler', 'd1', 'execute', 'portfolio-dam-db', remote ? '--remote' : '--local', '--command', sql], {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
        shell: true
      });
      console.log('static asset', item.label, staticKey);
      continue;
    }
    console.log('uploaded', item.label, up.status);
  }

  const portfolio = await request('GET', '/api/portfolio');
  const parsed = JSON.parse(portfolio.data);
  const found = (parsed.projects || []).find((p) => p.title_es === TITLE_ES);
  console.log('portfolio project assets', found?.assets?.length || 0);
  if (!found || (found.assets || []).length < 2) {
    throw new Error('project not visible with 2 assets in /api/portfolio');
  }
  console.log('seed-qr-bares OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
