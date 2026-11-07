export async function onRequestGet({ request, env }) {
  if (!env.FILES) {
    return new Response('Storage not configured', { status: 503 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get('key') || '';
  if (!key || key.includes('..')) {
    return new Response('Not found', { status: 404 });
  }

  const object = await env.FILES.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=3600');
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/octet-stream');
  }

  return new Response(object.body, { headers });
}
