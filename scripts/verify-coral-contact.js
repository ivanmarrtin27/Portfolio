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
  const oldPin = await request('POST', '/api/admin/login', { body: JSON.stringify({ pin: '482915' }) });
  console.log('oldPin', oldPin.status, oldPin.data);

  const login = await request('POST', '/api/admin/login', { body: JSON.stringify({ pin: '78239644' }) });
  console.log('newPin', login.status, login.data);

  const portfolio = await request('GET', '/api/portfolio');
  const parsed = JSON.parse(portfolio.data);
  console.log('email', parsed.profile.email);
  console.log('phone', parsed.profile.phone);
})();
