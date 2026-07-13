"use client";

import { useEffect, useState } from "react";
import {
  getStreamCount,
  getTotalStreams,
  getTotalVolume,
} from "@/lib/aqua";

const cards = [
  {
    key: "aqua",
    label: "Streams (Aqua)",
    icon: "≈",
    gradient: "from-cyan-400 to-sky-500",
  },
  {
    key: "total",
    label: "Total Streams",
    icon: "↗",
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    key: "volume",
    label: "Volume (XLM)",
    icon: "✦",
    gradient: "from-indigo-400 to-violet-500",
  },
] as const;

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="glass-panel group relative min-w-0 overflow-hidden rounded-2xl p-5">
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${gradient} opacity-70`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div
            className={`bg-gradient-to-r ${gradient} bg-clip-text text-3xl font-black tracking-tight text-transparent`}
          >
            {value}
          </div>

          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
        </div>

        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-lg font-black text-white opacity-80 shadow-lg`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-800/80">
        <div
          className={`h-full w-full rounded-full bg-gradient-to-r ${gradient}`}
        />
      </div>
    </div>
  );
}

function formatVolume(rawStroops: string): string {
  if (rawStroops === "…") return rawStroops;

  const xlm = Number(rawStroops) / 1e7;

  return xlm.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
}

export default function Stats() {
  const [count, setCount] = useState("…");
  const [total, setTotal] = useState("…");
  const [volume, setVolume] = useState("…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const [streamCount, totalStreams, totalVolume] =
          await Promise.all([
            getStreamCount(),
            getTotalStreams(),
            getTotalVolume(),
          ]);

        if (!alive) return;

        setCount(String(streamCount));
        setTotal(String(totalStreams));
        setVolume(totalVolume);
        setError(null);
      } catch (loadError) {
        if (alive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load stats"
          );
        }
      }
    }

    void load();

    const interval = setInterval(load, 5_000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const values = {
    aqua: count,
    total,
    volume: formatVolume(volume),
  };

  return (
    <section className="my-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={values[card.key]}
            icon={card.icon}
            gradient={card.gradient}
          />
        ))}
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}
