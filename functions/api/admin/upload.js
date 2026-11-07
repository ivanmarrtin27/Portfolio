import { requireAdmin } from '../../../cloudflare/auth.js';
import {
  json, unauthorized, badRequest, safeFileKey, getProfile, mapProfile, fileUrl, mapAsset, asText, asInt
} from '../../../cloudflare/helpers.js';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return unauthorized();
  if (!env.FILES) {
    return json({
      error: 'Use static paths under /assets/ (R2 disabled). Copy the file to public/assets/ and save the path in admin.'
    }, 503);
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    const purpose = String(form.get('purpose') || 'misc');
    const projectId = form.get('project_id');
    const certificateId = form.get('certificate_id');
    const label = asText(String(form.get('label') || ''), 200);
    const kindInput = String(form.get('kind') || '');

    if (!(file instanceof File)) return badRequest('file required');
    if (file.size > MAX_BYTES) return badRequest('File too large (max 8MB)');

    const type = file.type || 'application/octet-stream';
    if (!ALLOWED.has(type)) return badRequest('Only PDF or images allowed');

    const fileType = type === 'application/pdf' ? 'pdf' : 'image';

    if (purpose === 'project_asset') {
      const id = Number.parseInt(String(projectId), 10);
      if (!Number.isFinite(id)) return badRequest('project_id required');

      const project = await env.DB.prepare('SELECT id FROM projects WHERE id = ?').bind(id).first();
      if (!project) return badRequest('Project not found');

      let kind = kindInput === 'file' || kindInput === 'screenshot' ? kindInput : null;
      if (!kind) {
        kind = fileType === 'image' ? 'screenshot' : 'file';
      }
      if (kind === 'screenshot' && fileType !== 'image') {
        return badRequest('Screenshots must be images');
      }

      const key = safeFileKey(`projects/${id}`, file.name);
      const bytes = await file.arrayBuffer();
      await env.FILES.put(key, bytes, { httpMetadata: { contentType: type } });

      const sortOrder = asInt(form.get('sort_order'), 0);
      const result = await env.DB.prepare(`
        INSERT INTO project_assets (project_id, kind, label, file_key, file_type, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(id, kind, label || file.name, key, fileType, sortOrder).run();

      const asset = await env.DB.prepare('SELECT * FROM project_assets WHERE id = ?')
        .bind(result.meta.last_row_id).first();
      return json({ key, url: fileUrl(key), file_type: fileType, asset: mapAsset(asset) }, 201);
    }

    const prefix = purpose === 'cv' ? 'cv'
      : purpose === 'certificate' ? 'certificates'
        : purpose === 'project' ? 'projects'
          : 'misc';

    const key = safeFileKey(prefix, file.name);
    const bytes = await file.arrayBuffer();
    await env.FILES.put(key, bytes, {
      httpMetadata: { contentType: type }
    });

    if (purpose === 'cv') {
      const profile = await getProfile(env);
      if (profile?.cv_key) {
        try { await env.FILES.delete(profile.cv_key); } catch { /* ignore */ }
      }
      await env.DB.prepare(
        `UPDATE profile SET cv_key = ?, updated_at = datetime('now') WHERE id = 1`
      ).bind(key).run();
      const updated = await getProfile(env);
      return json({ key, url: fileUrl(key), file_type: fileType, profile: mapProfile(updated) });
    }

    if (purpose === 'project' && projectId) {
      const id = Number.parseInt(String(projectId), 10);
      if (Number.isFinite(id)) {
        const existing = await env.DB.prepare('SELECT image_key FROM projects WHERE id = ?').bind(id).first();
        if (existing?.image_key) {
          try { await env.FILES.delete(existing.image_key); } catch { /* ignore */ }
        }
        await env.DB.prepare(
          `UPDATE projects SET image_key = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(key, id).run();
      }
    }

    if (purpose === 'certificate' && certificateId) {
      const id = Number.parseInt(String(certificateId), 10);
      if (Number.isFinite(id)) {
        const existing = await env.DB.prepare('SELECT file_key FROM certificates WHERE id = ?').bind(id).first();
        if (existing?.file_key) {
          try { await env.FILES.delete(existing.file_key); } catch { /* ignore */ }
        }
        await env.DB.prepare(
          `UPDATE certificates SET file_key = ?, file_type = ? WHERE id = ?`
        ).bind(key, fileType, id).run();
      }
    }

    return json({ key, url: fileUrl(key), file_type: fileType });
  } catch {
    return badRequest('Upload failed');
  }
}
