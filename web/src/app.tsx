import { useState } from "react";
import { DebatePanel } from "./components/DebatePanel";
import { ResultPanel } from "./components/ResultPanel";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { StatusForm } from "./components/StatusForm";

export function App() {
  const [profile, setProfile] = useState<{ amount: number; currency: "JPY"|"USD"; horizon: "short"|"mid"|"long"; risk: "low"|"medium"|"high"; universe?: "global"|"sp500"|"nasdaq100"|"nikkei225"|"custom" }>({ amount: 100000, currency: "JPY", horizon: "mid", risk: "medium", universe: "sp500" });
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b p-4 backdrop-blur bg-white/70">
        <h1 className="text-3xl font-semibold tracking-wide bg-gradient-to-r from-brand-600 to-fuchsia-500 bg-clip-text text-transparent">Invest Coach</h1>
        <p className="text-sm text-neutral-600">教育目的のディベート（投資助言ではありません）</p>
      </header>
      <main className="flex-1 container mx-auto p-4 space-y-4">
        <section className="rounded-xl p-4 border bg-white/80 shadow">
          <StatusForm value={profile} onChange={setProfile} />
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DebatePanel tickers={[]} profile={profile} />
          <ResultPanel />
        </section>
      </main>
      <SettingsDrawer />
      <footer className="border-t p-4 text-xs text-neutral-500 bg-white/70">
        本アプリは教育・リサーチ目的の情報提供であり、投資助言ではありません。
      </footer>
    </div>
  );
}


