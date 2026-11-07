import { requireAdmin } from '../../../cloudflare/auth.js';
import {
  json, unauthorized, badRequest, asText, mapProfile, getProfile
} from '../../../cloudflare/helpers.js';

export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) return unauthorized();
  const row = await getProfile(env);
  return json({ profile: mapProfile(row) });
}

export async function onRequestPut({ request, env }) {
  if (!(await requireAdmin(request, env))) return unauthorized();

  try {
    const body = await request.json();
    await env.DB.prepare(`
      UPDATE profile SET
        name = ?,
        tagline_es = ?,
        tagline_en = ?,
        about_es = ?,
        about_en = ?,
        youtube_url = ?,
        email = ?,
        phone = ?,
        github = ?,
        instagram = ?,
        linkedin = ?,
        location_pref_es = ?,
        location_pref_en = ?,
        cv_key = CASE WHEN ? = 1 THEN ? ELSE cv_key END,
        updated_at = datetime('now')
      WHERE id = 1
    `).bind(
      asText(body.name, 120) || 'Iván Martín Molina',
      asText(body.tagline_es, 200),
      asText(body.tagline_en, 200),
      asText(body.about_es, 5000),
      asText(body.about_en, 5000),
      asText(body.youtube_url, 500),
      asText(body.email, 200),
      asText(body.phone, 40),
      asText(body.github, 300),
      asText(body.instagram, 300),
      asText(body.linkedin, 300),
      asText(body.location_pref_es, 300),
      asText(body.location_pref_en, 300),
      body.cv_key !== undefined ? 1 : 0,
      body.cv_key === null || body.cv_key === ''
        ? null
        : asText(body.cv_key, 300)
    ).run();

    const row = await getProfile(env);
    return json({ profile: mapProfile(row) });
  } catch {
    return badRequest();
  }
}
