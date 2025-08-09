import { useSettingsStore } from "@/store/settings";
import { useDebateStore } from "@/store/debate";
import { generateStreaming, type ChatMessage } from "@/llm/engine";
import { commonSystem, agentValue, agentGrowth, agentMacro, judgePrompt } from "./prompts";

type DebateInput = { tickers: string[]; profile?: { amount: number; currency: string; horizon: string; risk: string; universe?: string } };

export async function* runDebate(input: DebateInput): AsyncGenerator<string> {
  const s = useSettingsStore.getState();
  const debate = useDebateStore.getState();
  debate.clear();

  const systemBase: ChatMessage = { role: "system", content: commonSystem };
  const pf = input.profile;
  const universe = pf?.universe ?? "sp500";
  const list = input.tickers.length ? input.tickers.join(", ") : (universe === "sp500" ? "S&P500構成銘柄" : universe === "nasdaq100" ? "NASDAQ100構成銘柄" : universe === "nikkei225" ? "日経225構成銘柄" : "世界の主要上場企業");
  const context = `候補集合: ${list}\n投資金額: ${pf?.amount ?? "—"} ${pf?.currency ?? ""}\n投資期間: ${pf?.horizon ?? "mid"}\nリスク許容度: ${pf?.risk ?? "medium"}`;
  const history: ChatMessage[] = [{ role: "user", content: context }];

  const agents: { name: string; sys: string }[] = [
    { name: "Value", sys: agentValue },
    { name: "Growth", sys: agentGrowth },
    { name: "Macro", sys: agentMacro },
  ];

  for (let r = 1; r <= s.rounds; r++) {
    for (const a of agents) {
      yield `\n【R${r} ${a.name}】\n`;
      const messages: ChatMessage[] = [systemBase, { role: "system", content: a.sys }, ...history];
      let text = "";
      for await (const chunk of generateStreaming(messages)) {
        text += chunk;
        // 受け取り側で積み上げるため、そのまま結合
        yield chunk;
      }
      history.push({ role: "assistant", content: `[${a.name}] ${text}` });
      yield "\n";
    }
  }

  // 最終判定
  yield `\n【最終判定】\n`;
  let judgeText = "";
  const judgeMsgs: ChatMessage[] = [systemBase, { role: "system", content: judgePrompt }, ...history];
  for await (const ch of generateStreaming(judgeMsgs)) {
    judgeText += ch;
    yield ch;
  }
  yield "\n";

  // JSON抽出（コードブロックや文中に含まれる場合を考慮）
  const jsonMatch = judgeText.match(/\{[\s\S]*\}/);
  let parsed: any = null;
  if (jsonMatch) {
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (_) {
      // 末尾のカンマなどを緩和（失敗時はフォールバック）
      try {
        const relaxed = jsonMatch[0]
          .replace(/,\s*\}/g, "}")
          .replace(/,\s*\]/g, "]");
        parsed = JSON.parse(relaxed);
      } catch {}
    }
  }

  const selected = (parsed?.selected as string) || input.tickers[0] || "UNKNOWN";
  const final = {
    selected,
    rationale: (parsed?.rationale as string) || judgeText.slice(0, 500) || "—",
    risks: Array.isArray(parsed?.risks) ? parsed.risks : ["—"],
    assumptions: Array.isArray(parsed?.assumptions) ? parsed.assumptions : ["—"],
    time_horizon: (parsed?.time_horizon as string) || "12-24m",
  };
  useDebateStore.getState().setFinal(final);
}


