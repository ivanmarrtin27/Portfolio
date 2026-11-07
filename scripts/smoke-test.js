const http = require('http');
const fs = require('fs');
const path = require('path');

function readAdminPin() {
  if (process.env.ADMIN_PIN) return String(process.env.ADMIN_PIN).trim();
  const varsPath = path.join(__dirname, '..', '.dev.vars');
  const raw = fs.readFileSync(varsPath, 'utf8');
  const match = raw.match(/^ADMIN_PIN=(.+)$/m);
  if (!match) throw new Error('ADMIN_PIN not found in .dev.vars');
  return match[1].trim();
}

function request(method, pathName, { body, cookie } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8788,
      path: pathName,
      method,
      headers: {
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': payload.length } : {}),
        ...(cookie ? { Cookie: cookie } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  const pin = readAdminPin();
  const login = await request('POST', '/api/admin/login', { body: JSON.stringify({ pin }) });
  console.log('login', login.status, login.data);
  if (login.status !== 200) process.exit(1);

  const rawCookie = (login.headers['set-cookie'] || [])[0] || '';
  const cookie = rawCookie.split(';')[0];
  console.log('hasCookie', Boolean(cookie));
  if (!cookie) process.exit(1);

  const session = await request('GET', '/api/admin/session', { cookie });
  console.log('session', session.status, session.data);
  if (session.status !== 200) process.exit(1);

  const stamp = Date.now();
  const project = await request('POST', '/api/admin/projects', {
    cookie,
    body: JSON.stringify({
      title_es: `Smoke ${stamp}`,
      title_en: `Smoke ${stamp}`,
      description_es: 'Creado en test',
      tech: 'JS',
      sort_order: 99
    })
  });
  console.log('project', project.status, project.data);
  if (project.status !== 200 && project.status !== 201) process.exit(1);

  let projectId = null;
  try {
    projectId = JSON.parse(project.data).project?.id || JSON.parse(project.data).id;
  } catch { /* ignore */ }

  const portfolio = await request('GET', '/api/portfolio');
  const parsed = JSON.parse(portfolio.data);
  const found = (parsed.projects || []).some((p) => p.title_es === `Smoke ${stamp}`);
  console.log('portfolioHasSmoke', found, 'count', parsed.projects.length, 'name', parsed.profile?.name);
  if (!found) process.exit(1);

  if (projectId) {
    const del = await request('DELETE', `/api/admin/projects/${projectId}`, { cookie });
    console.log('projectDelete', del.status);
  }

  const logout = await request('POST', '/api/admin/logout', { cookie });
  console.log('logout', logout.status);

  const admin = await request('GET', '/admin/');
  console.log('adminPage', admin.status);

  console.log('smoke OK');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
