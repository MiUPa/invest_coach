import { useEffect, useRef, useState } from "react";
import { runDebate } from "@/agents/orchestrator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = { tickers: string[]; profile?: { amount: number; currency: "JPY"|"USD"; horizon: string; risk: string; universe?: string } };

export function DebatePanel({ tickers, profile }: Props) {
  const [text, setText] = useState<string>("");
  const [running, setRunning] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const handleRun = async () => {
    setText("");
    setRunning(true);
    try {
      for await (const msg of runDebate({ tickers, profile })) {
        setText((prev) => prev + msg);
      }
    } catch (e) {
      setText((prev) => prev + "\n" + String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="border rounded-xl p-4 h-[60vh] flex flex-col bg-[color:var(--claude-surface,_#FFFFFF)] shadow">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium text-[color:var(--claude-text,_#111827)]">ディベート</h2>
        <button
          onClick={handleRun}
          disabled={running}
          className="px-3 py-1.5 rounded-md disabled:opacity-50 bg-[color:var(--claude-text,_#111827)] text-white hover:opacity-90"
        >
          {running ? "実行中…" : "開始"}
        </button>
      </div>
      <div ref={viewportRef} className="flex-1 overflow-auto text-sm prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    </div>
  );
}


