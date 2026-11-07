import { requireAdmin } from '../../../../cloudflare/auth.js';
import {
  json, unauthorized, badRequest, notFound, asText, asInt, mapCertificate
} from '../../../../cloudflare/helpers.js';

export async function onRequestPut({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return unauthorized();
  const id = asInt(params.id, 0);
  if (!id) return badRequest('Invalid id');

  try {
    const body = await request.json();
    const titleEs = asText(body.title_es, 200);
    if (!titleEs) return badRequest('title_es required');

    const existing = await env.DB.prepare('SELECT * FROM certificates WHERE id = ?').bind(id).first();
    if (!existing) return notFound();

    const newKey = body.file_key === undefined
      ? existing.file_key
      : (asText(body.file_key, 300) || existing.file_key);

    if (body.file_key && existing.file_key && body.file_key !== existing.file_key && env.FILES) {
      try { await env.FILES.delete(existing.file_key); } catch { /* ignore */ }
    }

    await env.DB.prepare(`
      UPDATE certificates SET
        title_es = ?, title_en = ?, issuer = ?, issued_at = ?,
        file_key = ?, file_type = ?, sort_order = ?
      WHERE id = ?
    `).bind(
      titleEs,
      asText(body.title_en, 200),
      asText(body.issuer, 200),
      asText(body.issued_at, 40),
      newKey,
      asText(body.file_type, 20) || existing.file_type || 'pdf',
      asInt(body.sort_order, existing.sort_order || 0),
      id
    ).run();

    const row = await env.DB.prepare('SELECT * FROM certificates WHERE id = ?').bind(id).first();
    return json({ certificate: mapCertificate(row) });
  } catch {
    return badRequest();
  }
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return unauthorized();
  const id = asInt(params.id, 0);
  if (!id) return badRequest('Invalid id');

  const existing = await env.DB.prepare('SELECT * FROM certificates WHERE id = ?').bind(id).first();
  if (!existing) return notFound();

  if (existing.file_key && env.FILES) {
    try { await env.FILES.delete(existing.file_key); } catch { /* ignore */ }
  }

  await env.DB.prepare('DELETE FROM certificates WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
