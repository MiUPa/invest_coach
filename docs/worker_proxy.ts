// Cloudflare Workers (Module Worker)
export default {
    async fetch(req, env) {
      const origin = req.headers.get('Origin') || '';
      let host = '';
      try { host = new URL(origin).host; } catch {}
      const ALLOWED = new Set(['invest-coach.miupa.jp', 'localhost:5173']);
  
      // CORS preflight
      if (req.method === 'OPTIONS') {
        if (!ALLOWED.has(host)) return new Response(null, { status: 403 });
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
          },
        });
      }
  
      if (!ALLOWED.has(host)) return new Response('Forbidden', { status: 403 });
      if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  
      // 受け取ったペイロードをGeminiへ転送（出力トークンは128に抑制、429時に簡易バックオフ）
      let payload = {};
      try { payload = await req.json(); } catch {}
      const model = payload?.model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;

      async function callGemini(body) {
        let wait = 1000; // 1s
        for (let i = 0; i < 3; i++) {
          const r = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body });
          if (r.status !== 429) return r;
          await new Promise(res => setTimeout(res, wait));
          wait *= 2; // 1 → 2 → 4s
        }
        return fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body });
      }

      const body = JSON.stringify({
        contents: payload?.contents,
        generationConfig: {
          ...payload?.generationConfig,
          maxOutputTokens: Math.min(128, Number(payload?.generationConfig?.maxOutputTokens ?? 128)),
          temperature: Math.min(0.7, Number(payload?.generationConfig?.temperature ?? 0.7)),
        },
      });

      const upstream = await callGemini(body);

      const text = await upstream.text();
      return new Response(text, {
        status: upstream.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin, // 受け取ったOriginをそのまま返す
          Vary: 'Origin',
        },
      });
    },
  };