# Gemini プロキシ（Cloudflare Workers）手順

## 1. セットアップ
- Cloudflare アカウント作成 → Workers & Pages を有効化
- ローカルに wrangler を導入
  - `npm i -g wrangler`

## 2. プロジェクト作成
```
wrangler init gemini-proxy --yes
cd gemini-proxy
```

## 3. コード（src/worker.ts）
```ts
export interface Env { GEMINI_API_KEY: string }
const ALLOW_ORIGIN = "https://miupa.github.io"; // フロントの本番URL

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOW_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const origin = req.headers.get("Origin") ?? "";
    if (origin !== ALLOW_ORIGIN) return new Response("Forbidden", { status: 403 });

    const payload = await req.json();
    const model = payload?.model || "gemini-1.5-flash";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: payload.contents,
        generationConfig: payload.generationConfig,
      }),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOW_ORIGIN,
        Vary: "Origin",
      },
    });
  },
};
```

## 4. 環境変数
```
wrangler secret put GEMINI_API_KEY
```

## 5. デプロイ
```
wrangler deploy
```

## 6. フロント設定
- `VITE_GEMINI_PROXY_URL` に Workers のURLを設定
- 右下「設定」でAPIキー欄は空のままでOK（プロキシ経由で動作）

## 7. 注意
- CORSの許可オリジンを本番URLに固定
- レート制限が必要ならCloudflare側で追加
- 入力サイズ・最大出力をWorker側で制限
