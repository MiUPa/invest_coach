import { useSettingsStore } from "@/store/settings";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// 簡易モックLLM: 入力メッセージからランダムに要素を抽出し、教育目的の模擬応答を返す
async function* mockGenerate(messages: ChatMessage[]): AsyncGenerator<string> {
  const last = messages[messages.length - 1]?.content ?? "";
  const words = last.split(/\s+/).filter(Boolean);
  const out =
    words.length > 0
      ? `考慮点: ${words.slice(0, 10).join(" ")}\n結論は時期・リスク許容度に依存します。`
      : "仮定に基づく一般的観点を提示します。";
  for (const ch of out) {
    await new Promise((r) => setTimeout(r, 5));
    yield ch;
  }
}

export async function* generateStreaming(messages: ChatMessage[]): AsyncGenerator<string> {
  yield* geminiGenerate(messages);
}

// 以下は将来の拡張用（未使用）。残骸を保持
// ダミー関数（ビルドのため残置）
async function getTinyLlama() { throw new Error("unused"); }

async function* tinyLlamaGenerate(messages: ChatMessage[]): AsyncGenerator<string> {
  const s = useSettingsStore.getState();
  yield "[モデル読み込み中（初回は数十MB・数分かかる場合があります）]\n";
  let generator: any;
  try {
    generator = await getTinyLlama();
  } catch (e) {
    yield `\n[エラー] モデルの読み込みに失敗しました: ${String(e)}\n`;
    for (const h of hintFromEnvError(e)) {
      yield h + "\n";
    }
    yield "[Mockにフォールバックします]\n";
    yield* mockGenerate(messages);
    return;
  }
  yield "[モデル準備完了]\n";
  let prompt = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");
  if (prompt.length > 2000) {
    prompt = prompt.slice(-2000);
  }
  const options = {
    max_new_tokens: Math.min(Math.max(16, s.maxTokens), 48),
    temperature: s.temperature,
    top_k: 50,
    top_p: 0.9,
    do_sample: s.temperature > 0,
    repetition_penalty: 1.1,
  } as any;
  try {
    // 非同期イテレータではなく、最終テキストを擬似ストリーミング表示
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await generator(prompt, options);
    const text: string = Array.isArray(result)
      ? (result[0]?.generated_text ?? "")
      : typeof result === "string"
      ? result
      : JSON.stringify(result);
    for (const ch of text) {
      await new Promise((r) => setTimeout(r, 2));
      yield ch;
    }
  } catch (e) {
    yield `\n[エラー] 推論に失敗しました: ${String(e)}\n`;
    for (const h of hintFromEnvError(e)) {
      yield h + "\n";
    }
    const sNow = useSettingsStore.getState();
    if (sNow.apiEndpoint && sNow.apiKey && sNow.apiModel) {
      yield "[APIに自動フォールバックします]\n";
      yield* apiGenerate(messages);
      return;
    }
    yield "[Mockにフォールバックします]\n";
    yield* mockGenerate(messages);
  }
}

async function getQwen05() { throw new Error("unused"); }

async function* qwen05Generate(messages: ChatMessage[]): AsyncGenerator<string> {
  const s = useSettingsStore.getState();
  yield "[Qwen2 0.5B を読み込み中…]\n";
  let generator: any;
  try {
    generator = await getQwen05();
  } catch (e) {
    yield `\n[エラー] モデルの読み込みに失敗しました: ${String(e)}\n`;
    for (const h of hintFromEnvError(e)) {
      yield h + "\n";
    }
    yield "[Mockにフォールバックします]\n";
    yield* mockGenerate(messages);
    return;
  }
  yield "[モデル準備完了]\n";
  let prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  if (prompt.length > 2000) {
    prompt = prompt.slice(-2000);
  }
  const options = {
    max_new_tokens: Math.min(Math.max(16, s.maxTokens), 48),
    temperature: s.temperature,
    top_k: 50,
    top_p: 0.9,
    do_sample: s.temperature > 0,
    repetition_penalty: 1.1,
  } as any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await (generator as any)(prompt, options);
    const text: string = Array.isArray(result)
      ? (result[0]?.generated_text ?? "")
      : typeof result === "string"
      ? result
      : JSON.stringify(result);
    for (const ch of text) {
      await new Promise((r) => setTimeout(r, 2));
      yield ch;
    }
  } catch (e) {
    yield `\n[エラー] 推論に失敗しました: ${String(e)}\n`;
    for (const h of hintFromEnvError(e)) {
      yield h + "\n";
    }
    const sNow = useSettingsStore.getState();
    if (sNow.apiEndpoint && sNow.apiKey && sNow.apiModel) {
      yield "[APIに自動フォールバックします]\n";
      yield* apiGenerate(messages);
      return;
    }
    yield "[Mockにフォールバックします]\n";
    yield* mockGenerate(messages);
  }
}

function* hintFromEnvError(e: unknown): Generator<string> {
  const msg = String(e ?? "").toLowerCase();
  if (msg.includes("no available backend") || msg.includes("wasm")) {
    yield "[ヒント] ブラウザが WebGPU/ONNX WASM を実行できない構成の可能性があります。";
    yield "[ヒント] 別ブラウザ（Chrome/Edge）での再実行、またはPCでの実行をお試しください。";
  }
}

async function* apiGenerate(messages: ChatMessage[]): AsyncGenerator<string> {
  const s = useSettingsStore.getState();
  const endpoint = s.apiEndpoint.trim();
  const apiKey = s.apiKey.trim();
  const model = s.apiModel.trim();
  if (!endpoint || !apiKey || !model) {
    yield "[API] エンドポイント/キー/モデル名を設定してください\n";
    return;
  }
  const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "あなたは投資教育目的のアシスタントです。" },
          { role: "user", content: prompt },
        ],
        stream: false,
        max_tokens: 256,
        temperature: s.temperature,
      }),
    });
    if (!res.ok) {
      yield `[API] 呼び出し失敗: ${res.status} ${res.statusText}\n`;
      return;
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? JSON.stringify(data);
    for (const ch of String(text)) {
      await new Promise((r) => setTimeout(r, 2));
      yield ch;
    }
  } catch (e) {
    yield `[API] エラー: ${String(e)}\n`;
  }
}

async function* geminiGenerate(messages: ChatMessage[]): AsyncGenerator<string> {
  const s = useSettingsStore.getState();
  const model = s.geminiModel.trim() || "gemini-1.5-flash";
  // プロキシURLが設定されている場合は鍵不要
  const proxy = (import.meta as any).env?.VITE_GEMINI_PROXY_URL as string | undefined;
  const useProxy = !!proxy && proxy.length > 0;
  const apiKey = s.geminiKey.trim();
  if (!useProxy && !apiKey) {
    yield "[Gemini] APIキーを設定するか、プロキシURLを設定してください\n";
    return;
  }
  const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  const endpoint = useProxy
    ? `${proxy.replace(/\/$/, "")}/api/gemini`
    : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "あなたは投資教育目的のアシスタントです。" },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: s.temperature,
          maxOutputTokens: Math.min(512, Math.max(64, s.maxTokens)),
        },
        ...(useProxy ? { model } : {}),
      })
    });
    if (!res.ok) {
      yield `[Gemini] 呼び出し失敗: ${res.status} ${res.statusText}\n`;
      const errText = await res.text();
      yield errText + "\n";
      return;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "";
    for (const ch of String(text)) {
      await new Promise((r) => setTimeout(r, 2));
      yield ch;
    }
  } catch (e) {
    yield `[Gemini] エラー: ${String(e)}\n`;
  }
}

let gpt2Loader: Promise<any> | null = null;
async function getGpt2() {
  if (!gpt2Loader) {
    gpt2Loader = (async () => {
      const { pipeline, env } = await import("@xenova/transformers");
      // WebAssembly バックエンド（互換性重視）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (env as any).backends = (env as any).backends || {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (env as any).backends.onnx = (env as any).backends.onnx || {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (env as any).backends.onnx.wasm = (env as any).backends.onnx.wasm || {};
      // 互換性優先
      (env as any).backends.onnx.wasm.wasmPaths = "https://unpkg.com/onnxruntime-web@1.14.0/dist/";
      (env as any).backends.onnx.wasm.numThreads = 1;
      (env as any).backends.onnx.wasm.proxy = false;
      (env as any).backends.onnx.wasm.simd = false;
      const progress_callback = (data: unknown) => console.log("[transformers.js]", data);
      const generator = await pipeline(
        "text-generation",
        // より軽量な distilgpt2 を利用
        "Xenova/distilgpt2",
        ({ progress_callback } as any)
      );
      return generator;
    })();
  }
  return gpt2Loader;
}

async function* gpt2Generate(messages: ChatMessage[]): AsyncGenerator<string> {
  const s = useSettingsStore.getState();
  yield "[GPT-2 を読み込み中…]\n";
  let generator: any;
  try {
    generator = await getGpt2();
  } catch (e) {
    yield `\n[エラー] モデルの読み込みに失敗しました: ${String(e)}\n`;
    for (const h of hintFromEnvError(e)) yield h + "\n";
    yield "[Mockにフォールバックします]\n";
    yield* mockGenerate(messages);
    return;
  }
  yield "[モデル準備完了]\n";
  let prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  if (prompt.length > 1600) prompt = prompt.slice(-1600);
  const options = {
    max_new_tokens: Math.min(Math.max(16, s.maxTokens), 32),
    temperature: s.temperature,
    top_k: 40,
    top_p: 0.9,
    do_sample: s.temperature > 0,
    repetition_penalty: 1.05,
  } as any;
  try {
    // GPT-2 はコンテキスト長 1024 のため、トークン長を基に new_tokens を動的調整
    try {
      const tokenizer: any = (generator as any).tokenizer;
      if (tokenizer?.encode) {
        const encoded = await tokenizer.encode(prompt);
        const tokenLen = Array.isArray(encoded) ? encoded.length : encoded?.input_ids?.length ?? 0;
        const maxContext = 1024; // distilgpt2/gpt2 の既定
        const headroom = Math.max(0, maxContext - 1 - tokenLen);
        options.max_new_tokens = Math.min(options.max_new_tokens, headroom);
        // それでも余裕がないときはプロンプトをさらに短縮
        if (options.max_new_tokens < 8) {
          const target = Math.max(0, Math.floor((maxContext - 16) * 0.9));
          // ざっくり短縮（厳密トークン化は重いので段階的に）
          while (prompt.length > 0 && (await tokenizer.encode(prompt)).length > target) {
            prompt = prompt.slice(Math.floor(prompt.length * 0.2));
          }
          const enc2 = await tokenizer.encode(prompt);
          const tokenLen2 = Array.isArray(enc2) ? enc2.length : enc2?.input_ids?.length ?? 0;
          const headroom2 = Math.max(0, maxContext - 1 - tokenLen2);
          options.max_new_tokens = Math.max(8, Math.min(options.max_new_tokens, headroom2));
        }
      }
    } catch {
      // トークナイザが無い/失敗時はそのまま実行
    }
    const result: any = await (generator as any)(prompt, options);
    const text: string = Array.isArray(result)
      ? (result[0]?.generated_text ?? "")
      : typeof result === "string"
      ? result
      : JSON.stringify(result);
    for (const ch of text) {
      await new Promise((r) => setTimeout(r, 2));
      yield ch;
    }
  } catch (e) {
    yield `\n[エラー] 推論に失敗しました: ${String(e)}\n`;
    for (const h of hintFromEnvError(e)) yield h + "\n";
    const sNow = useSettingsStore.getState();
    if (sNow.apiEndpoint && sNow.apiKey && sNow.apiModel) {
      yield "[APIに自動フォールバックします]\n";
      yield* apiGenerate(messages);
      return;
    }
    yield "[Mockにフォールバックします]\n";
    yield* mockGenerate(messages);
  }
}


