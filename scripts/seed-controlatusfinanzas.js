/**
 * Seed / upsert ControlaTusFinanzas en el portfolio (D1 vía API admin).
 * Uso producción:
 *   set PORTFOLIO_BASE_URL=https://ivanmartin.pages.dev
 *   node scripts/seed-controlatusfinanzas.js
 * Lee ADMIN_PIN de .dev.vars (no lo imprime).
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const BASE = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:8788';
const baseUrl = new URL(BASE.endsWith('/') ? BASE : `${BASE}/`);
const TITLE_ES = 'ControlaTusFinanzas';
const LIVE_URL = process.env.CTF_LIVE || 'https://controlatusfinanzas.vercel.app';
const REPO_URL = process.env.CTF_REPO || 'https://github.com/ivanmarrtin27/ControlaTusFinanzas';

function readAdminPin() {
  if (process.env.ADMIN_PIN) return String(process.env.ADMIN_PIN).trim();
  const raw = fs.readFileSync(path.join(__dirname, '..', '.dev.vars'), 'utf8');
  const match = raw.match(/^ADMIN_PIN=(.+)$/m);
  if (!match) throw new Error('ADMIN_PIN not found in .dev.vars');
  return match[1].trim();
}

function request(method, pathName, { body, cookie, headers } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body == null ? null : Buffer.from(body);
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
    title_en: 'ControlaTusFinanzas',
    description_es:
      'App web de finanzas personales: cuentas, movimientos, presupuestos, objetivos, informes Excel/PDF y copia de seguridad JSON. Vite + React + Supabase.',
    description_en:
      'Personal finance web app: accounts, transactions, budgets, goals, Excel/PDF reports and JSON backup. Vite + React + Supabase.',
    docs_es: [
      'ControlaTusFinanzas es mi app de finanzas personales en español: sin paywalls ni hogares compartidos.',
      'Incluye cuentas y saldos derivados, ingresos/gastos, transferencias, presupuestos, recurrentes, objetivos, deudas, etiquetas, plantillas, tickets en Storage, calendario/recordatorios e informes exportables.',
      [
        'Stack: Vite, React, TypeScript, Supabase (Auth + Postgres RLS + Storage) y Vercel.',
        `Demo en vivo: ${LIVE_URL}`,
        `Código: ${REPO_URL}`
      ].join('\n')
    ].join('\n\n'),
    docs_en: [
      'ControlaTusFinanzas is my personal finance app in Spanish: no paywalls and no shared households.',
      'It covers accounts with derived balances, income/expense, transfers, budgets, recurring rules, goals, debts, tags, templates, receipt Storage, calendar/reminders and exportable reports.',
      [
        'Stack: Vite, React, TypeScript, Supabase (Auth + Postgres RLS + Storage) and Vercel.',
        `Live demo: ${LIVE_URL}`,
        `Code: ${REPO_URL}`
      ].join('\n')
    ].join('\n\n'),
    tech: 'Vite, React, TypeScript, Supabase, Vercel',
    live_url: LIVE_URL,
    repo_url: REPO_URL,
    sort_order: 5
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

  console.log('seed-controlatusfinanzas OK', {
    id: project.id,
    live_url: payload.live_url,
    repo_url: payload.repo_url
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
