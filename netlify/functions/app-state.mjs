import { getStore } from '@netlify/blobs';

const store = getStore('cleaning-robot-dashboard');
const key = 'shared-state';

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 204,
      headers: {
        ...jsonHeaders,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (req.method === 'GET') {
    const data = await store.get(key, { type: 'json' });
    return new Response(JSON.stringify({ ok: true, state: data || null }), { headers: jsonHeaders });
  }

  if (req.method === 'PUT') {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object' || !body.state || typeof body.state !== 'object') {
      return new Response(JSON.stringify({ ok: false, error: 'invalid_payload' }), {
        status: 400,
        headers: jsonHeaders
      });
    }
    await store.setJSON(key, {
      ...body.state,
      _sharedUpdatedAt: new Date().toISOString()
    });
    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
  }

  return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
    status: 405,
    headers: jsonHeaders
  });
};
