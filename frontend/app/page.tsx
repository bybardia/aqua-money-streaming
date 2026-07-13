import Dashboard from "@/components/Dashboard";

const features = [
  { icon: "⚡", label: "Per-second streaming" },
  { icon: "🔐", label: "Ledger secured" },
  { icon: "✦", label: "Stellar Testnet" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="aqua-grid" aria-hidden="true" />
      <div className="aqua-noise" aria-hidden="true" />
      <div
        className="aqua-orb aqua-orb-one"
        aria-hidden="true"
      />
      <div
        className="aqua-orb aqua-orb-two"
        aria-hidden="true"
      />
      <div
        className="aqua-orb aqua-orb-three"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <header className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-10 pt-14 text-center sm:pt-20">
          <div className="aqua-logo-shell" aria-hidden="true">
            <span className="text-4xl">🌊</span>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <h1 className="aqua-title text-5xl font-black tracking-tight sm:text-6xl">
              Aqua
            </h1>

            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              Testnet
            </span>
          </div>

          <p className="mt-5 max-w-2xl text-balance text-base leading-7 text-slate-400 sm:text-lg">
            Real-time money streaming on Stellar. Create programmable payment
            flows for salaries, subscriptions and vesting—all secured on-chain.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="aqua-pill rounded-full px-4 py-2 text-xs font-medium text-slate-300"
              >
                <span className="mr-2">{feature.icon}</span>
                {feature.label}
              </div>
            ))}
          </div>

          <div
            className="mt-10 h-px w-full max-w-xl bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
            aria-hidden="true"
          />
        </header>

        <Dashboard />

        <footer className="mx-auto mt-16 max-w-4xl border-t border-slate-800/70 px-4 py-8 text-center text-xs text-slate-600">
          Built on Stellar Soroban · Testnet assets have no real-world value
        </footer>
      </div>
    </div>
  );
}
