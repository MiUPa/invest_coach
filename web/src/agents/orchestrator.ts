import { useSettingsStore } from "@/store/settings";
import { useDebateStore } from "@/store/debate";
import { generateStreaming, type ChatMessage } from "@/llm/engine";
import { commonSystem, agentValue, agentGrowth, agentMacro, judgePrompt } from "./prompts";

type DebateInput = { tickers: string[] };

export async function* runDebate(input: DebateInput): AsyncGenerator<string> {
  const s = useSettingsStore.getState();
  const debate = useDebateStore.getState();
  debate.clear();

  const systemBase: ChatMessage = { role: "system", content: commonSystem };
  const context = `候補銘柄: ${input.tickers.join(", ")}\n期間: ${"12-24m"}`;
  const history: ChatMessage[] = [{ role: "user", content: context }];

  const agents: { name: string; sys: string }[] = [
    { name: "Value", sys: agentValue },
    { name: "Growth", sys: agentGrowth },
    { name: "Macro", sys: agentMacro },
  ];

  for (let r = 1; r <= s.rounds; r++) {
    for (const a of agents) {
      yield `【R${r} ${a.name}】`;
      const messages: ChatMessage[] = [systemBase, { role: "system", content: a.sys }, ...history];
      let text = "";
      for await (const chunk of generateStreaming(messages)) {
        text += chunk;
        yield chunk;
      }
      history.push({ role: "assistant", content: `[${a.name}] ${text}` });
      yield "\n";
    }
  }

  // 最終判定
  yield `【最終判定】`;
  let judgeText = "";
  const judgeMsgs: ChatMessage[] = [systemBase, { role: "system", content: judgePrompt }, ...history];
  for await (const ch of generateStreaming(judgeMsgs)) {
    judgeText += ch;
    yield ch;
  }
  yield "\n";

  // 簡易抽出（モック段階）
  const selected = input.tickers[0] ?? "UNKNOWN";
  const final = {
    selected,
    rationale: judgeText.slice(0, 300) || "モック判定",
    risks: ["情報不足", "仮定依存"],
    assumptions: ["教育目的"],
    time_horizon: "12-24m",
  };
  useDebateStore.getState().setFinal(final);
}


