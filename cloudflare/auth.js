const COOKIE_NAME = 'portfolio_admin_session';
const SESSION_SECONDS = 8 * 60 * 60;

function encodeBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function getSigningKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createSessionCookie(secret, { secure = true } = {}) {
  const payload = encodeBase64Url(new TextEncoder().encode(JSON.stringify({
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
    role: 'admin'
  })));
  const signature = new Uint8Array(await crypto.subtle.sign(
    'HMAC',
    await getSigningKey(secret),
    new TextEncoder().encode(payload)
  ));
  const token = `${payload}.${encodeBase64Url(signature)}`;
  const secureFlag = secure ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly${secureFlag}; SameSite=Lax`;
}

export async function getAdminSession(request, env) {
  if (!env.SESSION_SECRET) return null;
  const cookie = request.headers.get('Cookie') || '';
  const token = cookie.split(';').map((p) => p.trim())
    .find((p) => p.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return null;

  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await getSigningKey(env.SESSION_SECRET),
      decodeBase64Url(signature),
      new TextEncoder().encode(payload)
    );
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    if (!Number.isInteger(session.expiresAt) || session.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export async function requireAdmin(request, env) {
  const session = await getAdminSession(request, env);
  return Boolean(session);
}

export function expiredSessionCookie({ secure = true } = {}) {
  const secureFlag = secure ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly${secureFlag}; SameSite=Lax`;
}

export function clientIp(request) {
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || 'unknown';
}

export function wantsSecureCookie(request) {
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return true;
  }
}
