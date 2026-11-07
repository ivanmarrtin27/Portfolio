import { requireAdmin } from '../../../cloudflare/auth.js';
import {
  json, unauthorized, badRequest, asText, asLongText, asInt, mapProjectWithAssets
} from '../../../cloudflare/helpers.js';

export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) return unauthorized();
  const result = await env.DB.prepare(
    'SELECT * FROM projects ORDER BY sort_order ASC, id DESC'
  ).all();
  const projects = await Promise.all(
    (result.results || []).map((row) => mapProjectWithAssets(env, row))
  );
  return json({ projects });
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return unauthorized();

  try {
    const body = await request.json();
    const titleEs = asText(body.title_es, 200);
    if (!titleEs) return badRequest('title_es required');

    const sortOrder = asInt(body.sort_order, 0);
    const result = await env.DB.prepare(`
      INSERT INTO projects (
        title_es, title_en, description_es, description_en,
        docs_es, docs_en, tech, live_url, repo_url, image_key, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      asText(body.image_key, 300) || null,
      sortOrder
    ).run();

    const row = await env.DB.prepare('SELECT * FROM projects WHERE id = ?')
      .bind(result.meta.last_row_id).first();
    return json({ project: await mapProjectWithAssets(env, row) }, 201);
  } catch {
    return badRequest();
  }
}
