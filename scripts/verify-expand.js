const http = require('http');

function request(method, path, { body, cookie } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8788,
      path,
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
  const portfolio = await request('GET', '/api/portfolio');
  const parsed = JSON.parse(portfolio.data);
  console.log('name', parsed.profile.name);
  console.log('project0 docs', Object.prototype.hasOwnProperty.call(parsed.projects[0] || {}, 'docs_es'));
  console.log('project0 assets', Array.isArray(parsed.projects[0]?.assets));

  const login = await request('POST', '/api/admin/login', { body: JSON.stringify({ pin: '78239644' }) });
  const cookie = (login.headers['set-cookie'] || [])[0]?.split(';')[0];
  const updated = await request('PUT', `/api/admin/projects/${parsed.projects[0].id}`, {
    cookie,
    body: JSON.stringify({
      title_es: parsed.projects[0].title_es,
      title_en: parsed.projects[0].title_en,
      description_es: parsed.projects[0].description_es,
      description_en: parsed.projects[0].description_en,
      docs_es: 'Documentación de prueba: arquitectura, panel y QR.',
      docs_en: 'Test docs: architecture, panel and QR.',
      tech: parsed.projects[0].tech,
      live_url: parsed.projects[0].live_url,
      repo_url: parsed.projects[0].repo_url,
      sort_order: parsed.projects[0].sort_order
    })
  });
  console.log('update', updated.status, JSON.parse(updated.data).project?.docs_es?.slice(0, 40));
})();
