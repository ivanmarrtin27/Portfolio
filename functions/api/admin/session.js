import { requireAdmin } from '../../../cloudflare/auth.js';
import { json, unauthorized } from '../../../cloudflare/helpers.js';

export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) return unauthorized();
  return json({ ok: true });
}
