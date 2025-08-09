import { useState } from "react";
import { runDebate } from "@/agents/orchestrator";

type Props = { tickers: string[] };

export function DebatePanel({ tickers }: Props) {
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setLogs([]);
    setRunning(true);
    try {
      for await (const msg of runDebate({ tickers })) {
        setLogs((prev) => [...prev, msg]);
      }
    } catch (e) {
      setLogs((prev) => [...prev, String(e)]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="border rounded-md p-4 h-[60vh] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">ディベート</h2>
        <button
          onClick={handleRun}
          disabled={running || tickers.length === 0}
          className="px-3 py-1.5 border rounded-md disabled:opacity-50"
        >
          {running ? "実行中…" : "開始"}
        </button>
      </div>
      <div className="flex-1 overflow-auto text-sm space-y-1">
        {logs.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap">{l}</div>
        ))}
      </div>
    </div>
  );
}


