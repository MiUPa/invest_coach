import { useState } from "react";
import { DebatePanel } from "./components/DebatePanel";
import { ResultPanel } from "./components/ResultPanel";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { TickerInput } from "./components/TickerInput";

export function App() {
  const [tickers, setTickers] = useState<string[]>([]);
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b p-4">
        <h1 className="text-xl font-semibold">Invest Coach</h1>
        <p className="text-sm text-neutral-500">教育目的のディベート型銘柄選定（投資助言ではありません）</p>
      </header>
      <main className="flex-1 container mx-auto p-4 space-y-4">
        <section className="bg-white/5 rounded-md p-4 border">
          <TickerInput value={tickers} onChange={setTickers} />
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DebatePanel tickers={tickers} />
          <ResultPanel />
        </section>
      </main>
      <SettingsDrawer />
      <footer className="border-t p-4 text-xs text-neutral-500">
        本アプリは教育・リサーチ目的の情報提供であり、投資助言ではありません。
      </footer>
    </div>
  );
}


