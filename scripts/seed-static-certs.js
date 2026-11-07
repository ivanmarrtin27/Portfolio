const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const BASE = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:8788';
const baseUrl = new URL(BASE.endsWith('/') ? BASE : `${BASE}/`);

const CERTS = [
  {
    title_es: 'Curso de Iniciación al Desarrollo con IA',
    title_en: 'Introduction to AI Development Course',
    issuer: 'Big School',
    issued_at: '4 h',
    file_key: '/assets/certificates/big-school-desarrollo-ia.pdf',
    file_type: 'pdf',
    sort_order: 90
  },
  {
    title_es: 'Desarrollo de aplicaciones móviles con Ionic y Angular',
    title_en: 'Mobile application development with Ionic and Angular',
    issuer: 'Acciogest Digital, S.L.',
    issued_at: '40 h',
    file_key: '/assets/certificates/ionic-angular-curso-40h.pdf',
    file_type: 'pdf',
    sort_order: 10
  },
  {
    title_es: 'Configuración y administración de Odoo',
    title_en: 'Odoo configuration and administration',
    issuer: 'Ovisoft Telecom Center',
    issued_at: '40 h',
    file_key: '/assets/certificates/odoo-curso-40h.pdf',
    file_type: 'pdf',
    sort_order: 20
  },
  {
    title_es: 'Desarrollo multiplataforma con React Native',
    title_en: 'Cross-platform development with React Native',
    issuer: 'I.E.S. La Puebla',
    issued_at: '40 h',
    file_key: '/assets/certificates/react-native-curso-40h.pdf',
    file_type: 'pdf',
    sort_order: 30
  },
  {
    title_es: 'Desarrollo multiplataforma con Unity3D',
    title_en: 'Cross-platform development with Unity3D',
    issuer: 'I.E.S. La Puebla',
    issued_at: '40 h',
    file_key: '/assets/certificates/unity-curso-40h.pdf',
    file_type: 'pdf',
    sort_order: 40
  },
  {
    title_es: 'Curso de MongoDB: Creación y gestión de bases de datos NoSQL',
    title_en: 'MongoDB Course: Creating and managing NoSQL databases',
    issuer: 'OpenWebinars',
    issued_at: '8 h',
    file_key: '/assets/certificates/mongodb-nosql.pdf',
    file_type: 'pdf',
    sort_order: 50
  },
  {
    title_es: 'Curso de Java y MySQL JDBC: Elaboración de un CRUD',
    title_en: 'Java and MySQL JDBC Course: Building a CRUD',
    issuer: 'OpenWebinars',
    issued_at: '5 h',
    file_key: '/assets/certificates/java-mysql-jdbc-crud.pdf',
    file_type: 'pdf',
    sort_order: 60
  },
  {
    title_es: 'Curso de Java y MySQL JDBC: Operaciones básicas',
    title_en: 'Java and MySQL JDBC Course: Basic operations',
    issuer: 'OpenWebinars',
    issued_at: '4 h',
    file_key: '/assets/certificates/java-mysql-jdbc-operaciones.pdf',
    file_type: 'pdf',
    sort_order: 70
  },
  {
    title_es: 'Curso de Java y MySQL JDBC: Procedimientos almacenados y transacciones ACID',
    title_en: 'Java and MySQL JDBC Course: Stored procedures and ACID transactions',
    issuer: 'OpenWebinars',
    issued_at: '4 h',
    file_key: '/assets/certificates/java-mysql-jdbc-transacciones.pdf',
    file_type: 'pdf',
    sort_order: 80
  }
];

function readAdminPin() {
  if (process.env.ADMIN_PIN) return String(process.env.ADMIN_PIN).trim();
  const raw = fs.readFileSync(path.join(__dirname, '..', '.dev.vars'), 'utf8');
  const match = raw.match(/^ADMIN_PIN=(.+)$/m);
  if (!match) throw new Error('ADMIN_PIN not found');
  return match[1].trim();
}

function request(method, pathName, { body, cookie, headers } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body == null ? null : Buffer.from(body);
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
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: Buffer.concat(chunks).toString('utf8')
        });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  for (const cert of CERTS) {
    const abs = path.join(__dirname, '..', 'public', cert.file_key.replace(/^\//, '').replace(/\//g, path.sep));
    if (!fs.existsSync(abs)) throw new Error(`missing file ${abs}`);
  }

  const pin = readAdminPin();
  const login = await request('POST', '/api/admin/login', {
    body: JSON.stringify({ pin }),
    headers: { 'Content-Type': 'application/json' }
  });
  if (login.status !== 200) throw new Error(`login ${login.status} ${login.data}`);
  const cookie = ((login.headers['set-cookie'] || [])[0] || '').split(';')[0];
  if (!cookie) throw new Error('no cookie');

  const list = await request('GET', '/api/admin/certificates', { cookie });
  if (list.status !== 200) throw new Error(`list ${list.data}`);
  const existing = JSON.parse(list.data).certificates || [];

  for (const cert of CERTS) {
    const found = existing.find((c) => c.title_es === cert.title_es || c.file_key === cert.file_key);
    if (found) {
      const updated = await request('PUT', `/api/admin/certificates/${found.id}`, {
        cookie,
        body: JSON.stringify(cert),
        headers: { 'Content-Type': 'application/json' }
      });
      if (updated.status !== 200) throw new Error(`update ${cert.title_es}: ${updated.data}`);
      console.log('updated', found.id, cert.file_key);
    } else {
      const created = await request('POST', '/api/admin/certificates', {
        cookie,
        body: JSON.stringify(cert),
        headers: { 'Content-Type': 'application/json' }
      });
      if (created.status !== 201 && created.status !== 200) {
        throw new Error(`create ${cert.title_es}: ${created.data}`);
      }
      console.log('created', cert.file_key);
    }
  }

  const portfolio = await request('GET', '/api/portfolio');
  const parsed = JSON.parse(portfolio.data);
  console.log('certs', (parsed.certificates || []).length);
  console.log('seed-static-certs OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
