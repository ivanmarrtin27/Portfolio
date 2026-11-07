import {
  json, mapProfile, mapCertificate, getProfile, youtubeEmbedId, mapProjectWithAssets
} from '../../cloudflare/helpers.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: 'Database not configured' }, 503);

  const profileRow = await getProfile(env);
  const projects = await env.DB.prepare(
    'SELECT * FROM projects ORDER BY sort_order ASC, id DESC'
  ).all();
  const certificates = await env.DB.prepare(
    'SELECT * FROM certificates ORDER BY sort_order ASC, id DESC'
  ).all();

  const profile = mapProfile(profileRow);
  if (profile) {
    profile.youtube_embed_id = youtubeEmbedId(profile.youtube_url);
  }

  const mappedProjects = await Promise.all(
    (projects.results || []).map((row) => mapProjectWithAssets(env, row))
  );

  return json({
    profile,
    projects: mappedProjects,
    certificates: (certificates.results || []).map(mapCertificate)
  });
}
