export function json(data, statusOrHeaders = 200, maybeHeaders = {}) {
  let status = 200;
  let headers = {};

  if (typeof statusOrHeaders === 'number') {
    status = statusOrHeaders;
    headers = maybeHeaders && typeof maybeHeaders === 'object' ? maybeHeaders : {};
  } else if (statusOrHeaders && typeof statusOrHeaders === 'object') {
    headers = statusOrHeaders;
  }

  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers
    }
  });
}

export function badRequest(message = 'Invalid request') {
  return json({ error: message }, 400);
}

export function unauthorized(message = 'Unauthorized') {
  return json({ error: message }, 401);
}

export function notFound(message = 'Not found') {
  return json({ error: message }, 404);
}

export function serverError(message = 'Server error') {
  return json({ error: message }, 500);
}

export function asText(value, max = 5000) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export function asLongText(value, max = 20000) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export function asInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function fileUrl(key) {
  if (!key) return null;
  if (
    key.startsWith('/') ||
    key.startsWith('http://') ||
    key.startsWith('https://')
  ) {
    return key;
  }
  return `/api/files?key=${encodeURIComponent(key)}`;
}

export function mapAsset(row) {
  return {
    id: row.id,
    project_id: row.project_id,
    kind: row.kind,
    label: row.label || '',
    file_key: row.file_key,
    file_type: row.file_type || 'image',
    file_url: fileUrl(row.file_key),
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at
  };
}

export function mapProject(row, assets = []) {
  return {
    id: row.id,
    title_es: row.title_es,
    title_en: row.title_en || '',
    description_es: row.description_es || '',
    description_en: row.description_en || '',
    docs_es: row.docs_es || '',
    docs_en: row.docs_en || '',
    tech: row.tech || '',
    live_url: row.live_url || '',
    repo_url: row.repo_url || '',
    image_key: row.image_key || null,
    image_url: fileUrl(row.image_key),
    assets: (assets || []).map(mapAsset),
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export async function getProjectAssets(env, projectId) {
  const result = await env.DB.prepare(
    'SELECT * FROM project_assets WHERE project_id = ? ORDER BY sort_order ASC, id ASC'
  ).bind(projectId).all();
  return result.results || [];
}

export async function mapProjectWithAssets(env, row) {
  const assets = await getProjectAssets(env, row.id);
  return mapProject(row, assets);
}

export function mapCertificate(row) {
  return {
    id: row.id,
    title_es: row.title_es,
    title_en: row.title_en || '',
    issuer: row.issuer || '',
    issued_at: row.issued_at || '',
    file_key: row.file_key,
    file_type: row.file_type || 'pdf',
    file_url: fileUrl(row.file_key),
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at
  };
}

export function mapProfile(row) {
  if (!row) return null;
  return {
    name: row.name,
    tagline_es: row.tagline_es || '',
    tagline_en: row.tagline_en || '',
    about_es: row.about_es || '',
    about_en: row.about_en || '',
    youtube_url: row.youtube_url || '',
    email: row.email || '',
    phone: row.phone || '',
    github: row.github || '',
    instagram: row.instagram || '',
    linkedin: row.linkedin || '',
    location_pref_es: row.location_pref_es || '',
    location_pref_en: row.location_pref_en || '',
    cv_key: row.cv_key || null,
    cv_url: fileUrl(row.cv_key),
    updated_at: row.updated_at
  };
}

export async function getProfile(env) {
  return env.DB.prepare('SELECT * FROM profile WHERE id = 1').first();
}

export function youtubeEmbedId(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null;
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const parts = u.pathname.split('/').filter(Boolean);
    const embedIdx = parts.indexOf('embed');
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    const shortsIdx = parts.indexOf('shorts');
    if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
    return null;
  } catch {
    return null;
  }
}

export function safeFileKey(prefix, filename) {
  const base = String(filename || 'file').replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 80);
  const id = crypto.randomUUID().slice(0, 8);
  return `${prefix}/${Date.now()}-${id}-${base}`;
}
