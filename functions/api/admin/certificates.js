import { requireAdmin } from '../../../cloudflare/auth.js';
import {
  json, unauthorized, badRequest, asText, asInt, mapCertificate
} from '../../../cloudflare/helpers.js';

export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) return unauthorized();
  const result = await env.DB.prepare(
    'SELECT * FROM certificates ORDER BY sort_order ASC, id DESC'
  ).all();
  return json({ certificates: (result.results || []).map(mapCertificate) });
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return unauthorized();

  try {
    const body = await request.json();
    const titleEs = asText(body.title_es, 200);
    const fileKey = asText(body.file_key, 300);
    if (!titleEs || !fileKey) return badRequest('title_es and file_key required');

    const result = await env.DB.prepare(`
      INSERT INTO certificates (
        title_es, title_en, issuer, issued_at, file_key, file_type, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      titleEs,
      asText(body.title_en, 200),
      asText(body.issuer, 200),
      asText(body.issued_at, 40),
      fileKey,
      asText(body.file_type, 20) || 'pdf',
      asInt(body.sort_order, 0)
    ).run();

    const row = await env.DB.prepare('SELECT * FROM certificates WHERE id = ?')
      .bind(result.meta.last_row_id).first();
    return json({ certificate: mapCertificate(row) }, 201);
  } catch {
    return badRequest();
  }
}
