import { requireAdmin } from '../../../../cloudflare/auth.js';
import {
  json, unauthorized, badRequest, notFound, asText, asLongText, asInt, mapProjectWithAssets, getProjectAssets
} from '../../../../cloudflare/helpers.js';

export async function onRequestPut({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return unauthorized();
  const id = asInt(params.id, 0);
  if (!id) return badRequest('Invalid id');

  try {
    const body = await request.json();
    const titleEs = asText(body.title_es, 200);
    if (!titleEs) return badRequest('title_es required');

    const existing = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
    if (!existing) return notFound();

    await env.DB.prepare(`
      UPDATE projects SET
        title_es = ?, title_en = ?, description_es = ?, description_en = ?,
        docs_es = ?, docs_en = ?,
        tech = ?, live_url = ?, repo_url = ?, image_key = ?, sort_order = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      titleEs,
      asText(body.title_en, 200),
      asText(body.description_es, 5000),
      asText(body.description_en, 5000),
      asLongText(body.docs_es),
      asLongText(body.docs_en),
      asText(body.tech, 500),
      asText(body.live_url, 500),
      asText(body.repo_url, 500),
      body.image_key === null ? null : (asText(body.image_key, 300) || existing.image_key),
      asInt(body.sort_order, existing.sort_order || 0),
      id
    ).run();

    const row = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
    return json({ project: await mapProjectWithAssets(env, row) });
  } catch {
    return badRequest();
  }
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return unauthorized();
  const id = asInt(params.id, 0);
  if (!id) return badRequest('Invalid id');

  const existing = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
  if (!existing) return notFound();

  const assets = await getProjectAssets(env, id);
  if (env.FILES) {
    for (const asset of assets) {
      try { await env.FILES.delete(asset.file_key); } catch { /* ignore */ }
    }
    if (existing.image_key) {
      try { await env.FILES.delete(existing.image_key); } catch { /* ignore */ }
    }
  }

  await env.DB.prepare('DELETE FROM project_assets WHERE project_id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
