import { expiredSessionCookie, wantsSecureCookie } from '../../../cloudflare/auth.js';
import { json } from '../../../cloudflare/helpers.js';

export async function onRequestPost({ request }) {
  return json({ ok: true }, {
    'Set-Cookie': expiredSessionCookie({ secure: wantsSecureCookie(request) })
  });
}
