type Profile = {
  amount: number;
  currency: "JPY" | "USD";
  horizon: "short" | "mid" | "long";
  risk: "low" | "medium" | "high";
  universe?: "global" | "sp500" | "nasdaq100" | "nikkei225" | "custom";
};

type Props = {
  value: Profile;
  onChange: (p: Profile) => void;
};

export function StatusForm({ value, onChange }: Props) {
  const set = (patch: Partial<Profile>) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-neutral-400">投資金額</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={value.amount}
              onChange={(e) => set({ amount: Number(e.target.value) || 0 })}
              className="w-full border rounded-lg px-3 py-2 bg-[color:var(--claude-surface,_#FFFFFF)]"
            />
            <select
              value={value.currency}
              onChange={(e) => set({ currency: e.target.value as Profile["currency"] })}
              className="border rounded-lg px-2 py-2 bg-[color:var(--claude-surface,_#FFFFFF)]"
            >
              <option value="JPY">JPY</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-neutral-400">投資期間</label>
          <select
            value={value.horizon}
            onChange={(e) => set({ horizon: e.target.value as Profile["horizon"] })}
            className="w-full border rounded-lg px-3 py-2 bg-black/20"
          >
            <option value="short">短期（〜6ヶ月）</option>
            <option value="mid">中期（6〜24ヶ月）</option>
            <option value="long">長期（24ヶ月〜）</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-neutral-400">リスク許容度</label>
          <select
            value={value.risk}
            onChange={(e) => set({ risk: e.target.value as Profile["risk"] })}
            className="w-full border rounded-lg px-3 py-2 bg-black/20"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-neutral-400">ユニバース</label>
          <select
            value={value.universe ?? "sp500"}
            onChange={(e) => set({ universe: e.target.value as Profile["universe"] })}
            className="w-full border rounded-lg px-3 py-2 bg-black/20"
          >
            <option value="sp500">S&P 500（米大型株）</option>
            <option value="nasdaq100">NASDAQ 100</option>
            <option value="nikkei225">日経225</option>
            <option value="global">グローバル（LLM判断）</option>
          </select>
        </div>
      </div>
    </div>
  );
}


