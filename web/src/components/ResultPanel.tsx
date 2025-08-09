import { useDebateStore } from "@/store/debate";

export function ResultPanel() {
  const final = useDebateStore((s) => s.finalDecision);
  return (
    <div className="border rounded-xl p-4 h-[60vh] flex flex-col bg-[color:var(--claude-surface,_#FFFFFF)] shadow">
      <h2 className="font-medium mb-2">結論</h2>
      {final ? (
        <div className="text-sm space-y-2">
          <div>
            <span className="text-neutral-500">選定銘柄</span>: <span className="font-semibold">{final.selected}</span>
          </div>
          <div>
            <div className="text-neutral-500">理由</div>
            <p className="whitespace-pre-wrap">{final.rationale}</p>
          </div>
          {final.risks?.length ? (
            <div>
              <div className="text-neutral-500">リスク</div>
              <ul className="list-disc ml-5">
                {final.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="text-neutral-500">時間軸: {final.time_horizon}</div>
          <details className="mt-2">
            <summary className="cursor-pointer">JSON</summary>
            <pre className="text-xs overflow-auto bg-black/5 p-2 rounded">
{`${JSON.stringify(final, null, 2)}`}
            </pre>
          </details>
        </div>
      ) : (
        <div className="text-sm text-neutral-500">未計算</div>
      )}
    </div>
  );
}


