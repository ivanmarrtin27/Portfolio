import { createSessionCookie, clientIp, wantsSecureCookie } from '../../../cloudflare/auth.js';
import { json, unauthorized, badRequest } from '../../../cloudflare/helpers.js';

const MAX_FAILS = 8;
const LOCK_MINUTES = 15;

async function isLocked(env, ip) {
  try {
    const row = await env.DB.prepare('SELECT fails, locked_until FROM login_attempts WHERE ip = ?').bind(ip).first();
    if (!row) return false;
    if (row.locked_until) {
      const until = Date.parse(String(row.locked_until).replace(' ', 'T') + 'Z');
      if (Number.isFinite(until) && until > Date.now()) return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function registerFail(env, ip) {
  try {
    const row = await env.DB.prepare('SELECT fails FROM login_attempts WHERE ip = ?').bind(ip).first();
    const fails = (row?.fails || 0) + 1;
    const lockedUntil = fails >= MAX_FAILS
      ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
      : null;
    await env.DB.prepare(
      `INSERT INTO login_attempts (ip, fails, locked_until) VALUES (?, ?, ?)
       ON CONFLICT(ip) DO UPDATE SET fails = excluded.fails, locked_until = excluded.locked_until`
    ).bind(ip, fails, lockedUntil).run();
  } catch {
    /* ignore */
  }
}

async function clearFails(env, ip) {
  try {
    await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run();
  } catch {
    /* ignore */
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.SESSION_SECRET || !env.ADMIN_PIN || !env.DB) {
    return json({ error: 'Admin authentication is not configured' }, 503);
  }

  const ip = clientIp(request);
  if (await isLocked(env, ip)) {
    return unauthorized('Too many attempts. Try again later.');
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const pin = typeof body?.pin === 'string' ? body.pin : '';
  if (!pin || pin.length > 32) {
    await registerFail(env, ip);
    return unauthorized('Invalid PIN');
  }

  if (pin !== env.ADMIN_PIN) {
    await registerFail(env, ip);
    return unauthorized('Invalid PIN');
  }

  await clearFails(env, ip);
  const cookie = await createSessionCookie(env.SESSION_SECRET, {
    secure: wantsSecureCookie(request)
  });
  return json({ ok: true }, { 'Set-Cookie': cookie });
}
