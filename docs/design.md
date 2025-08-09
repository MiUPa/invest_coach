## プロジェクト設計書: 投資家ディベート型 銘柄選定ブラウザアプリ

### 1. 概要
本アプリは、ユーザーが複数の株式銘柄を入力・選択すると、3名の著名投資家を模したエージェントがブラウザ内で議論（LLMによる生成）を行い、最終的に1つの銘柄に投資する結論を提示する、完全クライアントサイドのWebアプリ。外部の有料APIやサーバーを使わず、GitHub Pages もしくは XサーバーVPS上で無料提供可能な構成とする。

- **対象プラットフォーム**: PC・スマホ対応（レスポンシブ）
- **コスト要件**: モデル推論/データ取得ともに無料（OSS/無料ティア/パブリックデータ）。
- **ホスティング**: GitHub Pages（静的配信）推奨。XサーバーVPSでも静的配信可。
- **用途**: 教育・リサーチ支援。投資助言ではない（免責必須）。

### 2. 要件定義
#### 2.1 機能要件（MVP）
- ユーザーが複数の銘柄を入力（ティッカー/コード）
- 3エージェント（著名投資家の思想を模したプロンプト）によるディベートを実行
- 2〜3ラウンドの往復議論後、最終結論として1銘柄を選定
- 議論ログの表示、最終結論の可視化（理由・リスク・前提）
- モデル・推論設定（モデル種類、温度、最大トークン等）の切替
- デバイス内キャッシュでモデルの再ダウンロードを最小化
- 免責表示（教育目的・投資判断は自己責任）

#### 2.2 非機能要件
- 完全クライアントサイド（サーバーレス）
- 主要ブラウザ対応（Chrome/Edge/Safari/Firefox）。WebGPU推奨、WASMフォールバック。
- モバイルでの最低限の推論速度を確保（小型モデル選択/設定で調整）。
- オフラインでもUIは表示可能（PWAは任意）。

#### 2.3 制約
- 外部の有料API禁止。無料ティア利用時は「ユーザー自身のAPIキー入力」方式を採用（サーバーに保存しない）。
- GitHub Pagesは静的のみ（サーバーサイド処理なし）。
- モデルはブラウザ内推論（例: WebLLM/transformers.js）。

#### 2.4 法的/コンプライアンス
- 著名投資家の「思想風」を模すが、人格の断定的な使用・なりすましは避ける（名称使用は要注意）。
- 免責・利用規約・プライバシー方針を明示。

### 3. ペルソナ・ユースケース
- **個人投資家**: 候補銘柄の比較検討を素早く行い、観点の異なる理由を確認したい。
- **学習者**: 投資スタイル別の思考プロセスを擬似体験したい。

ユーザーフロー（MVP）:
1) 銘柄入力（複数）→ 2) モデル/設定選択 → 3) ディベート開始 → 4) ラウンド進行（可視化） → 5) 最終結論（JSON構造化）→ 6) 保存/共有（任意）

### 4. アーキテクチャ
#### 4.1 全体構成（クライアントのみ）

```mermaid
graph TD
  UI[UI: React + TypeScript + Tailwind] --> Orchestrator[Debate Orchestrator]
  Orchestrator -->|system prompts| AgentA[Agent A (Value)]
  Orchestrator -->|system prompts| AgentB[Agent B (Growth)]
  Orchestrator -->|system prompts| AgentC[Agent C (Macro/Risk)]
  AgentA --> LLM[LLM Engine (WebGPU/WASM)]
  AgentB --> LLM
  AgentC --> LLM
  Orchestrator --> Data[Optional Data Adapter]
  Data -->|free endpoints| Source[Stooq CSV / User API key]
  LLM --> Cache[(IndexedDB Cache)]
```

#### 4.2 技術選定
- フロントエンド: React + TypeScript + Vite
- UI: Tailwind CSS（軽量/レスポンシブ）
- 状態管理: Zustand（簡潔）
- LLM推論: いずれか
  - transformers.js（Xenova）: TinyLlama 1.1B など OSS モデルをブラウザ内で推論（無料）
  - WebLLM（mlc-ai/web-llm）: 将来的に検討（モデル配布・サイズ管理）
- チャート/可視化: Chart.js（任意）
- データ取得（任意）: Stooq CSV（無料・CORS状況に依存）、Alpha Vantage（ユーザーAPIキー・無料枠）
- キャッシュ: IndexedDB（モデル/トークナイザ）

### 5. LLM/エージェント設計
#### 5.1 モデル候補（ブラウザ内・無料）
- 小型モデル（例）
  - Qwen2-0.5B Instruct（軽量・推奨）
  - TinyLlama 1.1B Chat
  - Phi-2 / Phi-3-mini

推奨: PCは1.1B〜3B、モバイルは0.5B〜1.5B。まずは TinyLlama 等の軽量モデルから。

#### 5.2 役割（例）
- Agent A: バリュー投資（財務健全性・割安度・配当）
- Agent B: 成長投資（売上/市場成長・製品優位・経営）
- Agent C: マクロ/リスク管理（景気/金利/地政学・ボラティリティ・下方リスク）

名称は「著名投資家に着想を得たスタイル」で表現し、実名の断定的使用を避ける。

#### 5.3 ディベート制御（ラウンド制）
- 入力: 銘柄リスト、補助データ（任意）、グローバル方針（投資目的・期間・リスク許容度）
- ラウンド数: 2〜3（設定可能）
- ターン: A→B→C の順で各ラウンド発言。直前までの発言を参照し反論/補強。
- 最終判定: 別ロールの「ジャッジ」プロンプトで1銘柄をJSONで出力。

擬似コード:
```ts
type DebateConfig = { rounds: number; maxTokens: number; temperature: number };
type DebateState = { messages: Message[] };

for (let r = 1; r <= config.rounds; r++) {
  for (const agent of [agentA, agentB, agentC]) {
    const reply = await llm.generate({
      system: agent.systemPrompt,
      messages: state.messages,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
    });
    state.messages.push({ role: agent.name, content: reply });
    ui.appendStreaming(reply);
  }
}
const final = await llm.generate({ system: judgePrompt, messages: state.messages });
const result = JSON.parse(extractJson(final));
```

#### 5.4 プロンプト雛形（要約）
- 共通システム: 「あなたは投資助言ではなく教育目的で…曖昧な事実は仮定を明記…」
- Agent A: 「バリュー投資家。財務/評価指標を重視。過度に将来予測に依存しない。」
- Agent B: 「成長投資家。TAM/成長率/競争優位/イノベーションを重視。」
- Agent C: 「マクロ/リスク管理。金利/景気/流動性/規制/ボラを重視。」
- ジャッジ: 「全発言を踏まえ、1銘柄のみを選定。JSONで出力。」

最終JSON例:
```json
{
  "selected": "AAPL",
  "rationale": "…",
  "risks": ["…"],
  "assumptions": ["…"],
  "time_horizon": "12-24m"
}
```

### 6. データソース設計（無料）
- オプションA（データなし）: LLMは一般的指標・仮定ベースで議論。MVPではこれを既定。
- オプションB（Stooq CSV）: 例 `https://stooq.com/q/l/?s=aapl.us&i=d`（CORS可否はブラウザで要確認）。
- オプションC（Alpha Vantage 無料枠）: ユーザー入力APIキーをクライアントにのみ保存（localStorage）。

注: ライブデータが取得できない場合は「最終更新日不明」「仮定で議論」の明示を行う。

### 7. UI/UX
- トップ: 銘柄入力（タグ入力・CSV貼付）、投資方針（期間・リスク）選択、モデル選択。
- ディベート画面: 3カラム（PC）/タブ（モバイル）、ストリーミング表示、ラウンド制御。
- 結論パネル: 選定銘柄、要約、リスク、JSONコピー、ダウンロード。
- アクセシビリティ: コントラスト/キーボード操作/スクリーンリーダー対応。

### 8. パフォーマンス指針
- WebGPU優先、なければWASMフォールバック（速度注意）。
- 小型モデルを既定、必要時のみ大きいモデル選択。
- モデル/トークナイザをIndexedDBへ永続化。
- ストリーミング出力とインクリメンタルレンダリング。

### 9. セキュリティ/プライバシー
- 完全クライアントで個人データを外送しない（APIキーはローカル保存）。
- CSP/サードパーティCDNの最小化。ライセンス確認（モデル/重み）。
- 免責・利用規約の常時表示（フッター）。

### 10. テスト戦略
- 単体: ディベートオーケストレータの状態遷移、JSON抽出/検証（zod）。
- 体験: モバイル/PCでの推論時間計測、UI応答性。
- E2E: Playwrightで主要フロー（入力→議論→結論）。

### 11. ディレクトリ構成（予定）
```
invest_coach/
  docs/
    design.md
  web/
    index.html
    src/
      main.tsx
      app.tsx
      components/
        TickerInput.tsx
        DebatePanel.tsx
        ResultPanel.tsx
        SettingsDrawer.tsx
      agents/
        prompts.ts
        orchestrator.ts
      llm/
        engine.ts   // WebLLM/transformers.js ラッパ
      data/
        stooq.ts
        alphaVantage.ts
      store/
        settings.ts
        debate.ts
    vite.config.ts
    package.json
    tailwind.config.ts
```

### 12. 開発・ビルド・デプロイ
- 開発: Vite + React + TypeScript。`pnpm` or `npm`。
- ビルド: `vite build` → `web/dist`
- GitHub Pages: `web/dist` をルートに公開（`gh-pages`ブランチ or Pages設定）。
- XサーバーVPS: Nginxで静的配信（HTTP/2推奨）。

### 13. ロードマップ
- M0: 雛形作成（UI枠、設定、免責、擬似レスポンス）
- M1: ブラウザ内推論（小型モデル）+ 3エージェント議論 + 最終JSON
- M2: ストリーミング/キャッシュ/設定保存
- M3: 任意データ連携（Stooq/Alpha Vantage）
- M4: 共有（URL/JSON）、簡易可視化

### 14. リスクと対応
- ブラウザ推論速度: 小型モデル/温度/トークン上限調整、WebGPU推奨表示。
- CORS/データ取得不可: データ連携はオプション、失敗時の明示。
- ライセンス: モデル/重み/ライブラリのライセンス確認を事前実施。
- モバイル熱/バッテリー: 長時間処理の注意喚起。

### 15. 成功指標（例）
- 初回モデル読み込み時間（p95）
- 1ラウンドあたりの生成完了時間（p95）
- ユーザー完了率（入力→結論の到達）
- エラー率（JSON抽出失敗・タイムアウト）

---

付録A: ジャッジ出力のJSONスキーマ（zod 例）
```ts
import { z } from "zod";

export const FinalDecisionSchema = z.object({
  selected: z.string().min(1),
  rationale: z.string().min(1),
  risks: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  time_horizon: z.string().default("12-24m")
});
```

付録B: 免責文（ドラフト）
> 本アプリは教育・リサーチ目的の情報提供を意図しており、投資助言を行うものではありません。投資判断はご自身の責任で行ってください。市場データやモデル出力の正確性・完全性は保証されません。


