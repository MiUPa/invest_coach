import { useState } from "react";

type Props = {
  value: string[];
  onChange: (tickers: string[]) => void;
};

export function TickerInput({ value, onChange }: Props) {
  const [text, setText] = useState("");

  const addTickers = () => {
    const tokens = text
      .split(/[\s,\n]+/)
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);
    const unique = Array.from(new Set([...value, ...tokens]));
    onChange(unique);
    setText("");
  };

  const remove = (t: string) => onChange(value.filter((v) => v !== t));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">銘柄（ティッカー/銘柄コード）</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="例: AAPL, MSFT, 7203.T"
        className="w-full h-24 p-2 border rounded-md bg-transparent"
      />
      <div className="flex items-center gap-2">
        <button onClick={addTickers} className="px-3 py-1.5 border rounded-md">
          追加
        </button>
        <button onClick={() => onChange([])} className="px-3 py-1.5 border rounded-md">
          クリア
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-sm border rounded-full px-2 py-1">
              {t}
              <button onClick={() => remove(t)} className="text-neutral-500 hover:text-neutral-700">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


