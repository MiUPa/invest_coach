// Cloudflare Workers - Gemini 代理エンドポイント（ドキュメント用）
// - 環境変数: GEMINI_API_KEY (Secret)
// - 許可元: invest-coach.miupa.jp, localhost:5173

export interface Env { GEMINI_API_KEY: string }

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const originHeader = req.headers.get('Origin') || '';
    let host = '';
    try { host = new URL(originHeader).host } catch {}
    const ALLOWED_HOSTS = new Set(['invest-coach.miupa.jp', 'localhost:5173']);

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': originHeader,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (!ALLOWED_HOSTS.has(host)) return new Response('Forbidden', { status: 403 });
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const payload = await req.json();
    const model = payload?.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;

    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: payload.contents,
        generationConfig: payload.generationConfig,
      }),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': originHeader,
        Vary: 'Origin',
      },
    });
  },
};


