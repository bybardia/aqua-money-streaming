import Link from "next/link";
import Stats from "@/components/Stats";

const features = [
  { icon: "↯", label: "Per-second streaming" },
  { icon: "◇", label: "Ledger secured" },
  { icon: "✦", label: "Stellar Testnet" },
];

function AquaLogo() {
  return (
    <div className="aqua-logo-shell" aria-label="Aqua logo">
      <svg
        className="aqua-mark"
        viewBox="0 0 96 96"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="aqua-logo-gradient"
            x1="18"
            y1="14"
            x2="78"
            y2="82"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#A5F3FC" />
            <stop offset="0.46" stopColor="#22D3EE" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>

          <linearGradient
            id="aqua-wave-gradient"
            x1="16"
            y1="64"
            x2="80"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#67E8F9" />
            <stop offset="1" stopColor="#818CF8" />
          </linearGradient>

          <filter id="aqua-logo-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="48"
          cy="48"
          r="37"
          fill="none"
          stroke="url(#aqua-logo-gradient)"
          strokeWidth="1.5"
          strokeOpacity="0.28"
        />

        <path
          d="M29 59L43.4 26.5C45.2 22.4 50.8 22.4 52.6 26.5L67 59"
          fill="none"
          stroke="url(#aqua-logo-gradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#aqua-logo-glow)"
        />

        <path
          d="M36.5 46.5H59.5"
          fill="none"
          stroke="#CFFAFE"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <path
          d="M18 65C25 58.5 32 58.5 39 65C46 71.5 53 71.5 60 65C67 58.5 74 58.5 81 65"
          fill="none"
          stroke="url(#aqua-wave-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#aqua-logo-glow)"
        />

        <path
          d="M24 75C29 71 34 71 39 75C44 79 49 79 54 75C59 71 64 71 69 75"
          fill="none"
          stroke="url(#aqua-wave-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
      </svg>
    </div>
  );
}

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

      <div className="relative z-10">
        <header className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-10 pt-14 text-center sm:pt-20">
          <div className="relative">
            <div
              className="aqua-logo-halo"
              aria-hidden="true"
            />
            <AquaLogo />
          </div>

          <div className="mt-7 flex items-center justify-center gap-3">
            <h1 className="aqua-title text-6xl font-black tracking-[-0.06em] sm:text-7xl">
              Aqua
            </h1>

            <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
              Testnet
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-400/60" />
            <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-cyan-300/70">
              Continuous Payment Protocol
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-400/60" />
          </div>

          <p className="mt-6 max-w-2xl text-balance text-base leading-7 text-slate-400 sm:text-lg">
            Programmable money streams on Stellar. Create secure, real-time
            payment flows for salaries, subscriptions and vesting.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="aqua-pill rounded-full px-4 py-2 text-xs font-medium text-slate-300"
              >
                <span className="mr-2 text-cyan-300">
                  {feature.icon}
                </span>
                {feature.label}
              </div>
            ))}
          </div>

          <div className="mt-10 flex w-full max-w-xl items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-400/20" />
            <span className="h-1.5 w-1.5 rotate-45 border border-cyan-300/40" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-400/20" />
          </div>
        </header>

        

        <section className="mx-auto -mt-2 flex max-w-4xl flex-col items-center px-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-90"
            >
              Launch App →
            </Link>
            <Link
              href="/streams"
              className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/5"
            >
              Explore streams
            </Link>
          </div>

          <div className="mt-14 w-full max-w-4xl">
            <h2 className="mb-4 text-center text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/70">
              Live on Testnet
            </h2>
            <Stats />
          </div>
        </section>
      </div>
    </div>
  );
}
