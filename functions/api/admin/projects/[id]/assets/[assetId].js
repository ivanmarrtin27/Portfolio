import { requireAdmin } from '../../../../../../cloudflare/auth.js';
import {
  json, unauthorized, badRequest, notFound, asInt, mapAsset
} from '../../../../../../cloudflare/helpers.js';

export async function onRequestDelete({ request, env, params }) {
  if (!(await requireAdmin(request, env))) return unauthorized();
  const projectId = asInt(params.id, 0);
  const assetId = asInt(params.assetId, 0);
  if (!projectId || !assetId) return badRequest('Invalid id');

  const asset = await env.DB.prepare(
    'SELECT * FROM project_assets WHERE id = ? AND project_id = ?'
  ).bind(assetId, projectId).first();
  if (!asset) return notFound();

  if (env.FILES && asset.file_key) {
    try { await env.FILES.delete(asset.file_key); } catch { /* ignore */ }
  }

  await env.DB.prepare('DELETE FROM project_assets WHERE id = ?').bind(assetId).run();
  return json({ ok: true, asset: mapAsset(asset) });
}
