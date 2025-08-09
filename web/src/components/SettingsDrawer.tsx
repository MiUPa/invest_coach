import { useSettingsStore } from "@/store/settings";

export function SettingsDrawer() {
  const s = useSettingsStore();
  return (
    <div className="fixed bottom-4 right-4">
      <details className="border rounded-md bg-white/5">
        <summary className="px-3 py-1.5 cursor-pointer select-none">設定</summary>
        <div className="p-3 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <label className="w-36 text-neutral-600">ラウンド数</label>
            <input
              type="number"
              min={1}
              max={5}
              value={s.rounds}
              onChange={(e) => s.setRounds(Number(e.target.value))}
              className="w-24 border rounded px-2 py-1 bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-36 text-neutral-600">温度</label>
            <input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={s.temperature}
              onChange={(e) => s.setTemperature(Number(e.target.value))}
              className="w-24 border rounded px-2 py-1 bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-36 text-neutral-600">最大トークン</label>
            <input
              type="number"
              min={64}
              max={4096}
              step={64}
              value={s.maxTokens}
              onChange={(e) => s.setMaxTokens(Number(e.target.value))}
              className="w-24 border rounded px-2 py-1 bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-36 text-neutral-600">モデル</label>
            <select
              value={s.model}
              onChange={(e) => s.setModel(e.target.value)}
              className="border rounded px-2 py-1 bg-transparent"
            >
              <option value="mock">Mock</option>
              <option value="tfjs-tinyllama">Transformers.js TinyLlama 1.1B（安定）</option>
              <option value="tfjs-qwen05">Transformers.js Qwen2 0.5B Instruct（実験的）</option>
              <option value="tfjs-gpt2">Transformers.js GPT-2（互換性重視・軽量）</option>
              <option value="api">外部API（無料枠/キー入力）</option>
              <option value="gemini">Gemini（無料）</option>
              <option value="webllm-qwen15" disabled>WebLLM Qwen 1.5B（後日）</option>
            </select>
          </div>
          {s.model === "api" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="w-36 text-neutral-600">APIエンドポイント</label>
                <input
                  value={s.apiEndpoint}
                  onChange={(e) => s.setApiEndpoint(e.target.value)}
                  placeholder="https://api.openrouter.ai/v1/chat/completions など"
                  className="border rounded px-2 py-1 bg-transparent w-[28rem]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-36 text-neutral-600">APIキー</label>
                <input
                  value={s.apiKey}
                  onChange={(e) => s.setApiKey(e.target.value)}
                  placeholder="ブラウザにのみ保存"
                  className="border rounded px-2 py-1 bg-transparent w-[28rem]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-36 text-neutral-600">モデル名</label>
                <input
                  value={s.apiModel}
                  onChange={(e) => s.setApiModel(e.target.value)}
                  placeholder="例: meta-llama/Meta-Llama-3.1-8B-Instruct"
                  className="border rounded px-2 py-1 bg-transparent w-[28rem]"
                />
              </div>
            </div>
          )}
          {s.model === "gemini" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="w-36 text-neutral-600">Gemini APIキー</label>
                <input
                  value={s.geminiKey}
                  onChange={(e) => s.setGeminiKey(e.target.value)}
                  placeholder="ブラウザにのみ保存"
                  className="border rounded px-2 py-1 bg-transparent w-[28rem]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-36 text-neutral-600">モデル名</label>
                <input
                  value={s.geminiModel}
                  onChange={(e) => s.setGeminiModel(e.target.value)}
                  placeholder="gemini-1.5-flash など"
                  className="border rounded px-2 py-1 bg-transparent w-[28rem]"
                />
              </div>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}


