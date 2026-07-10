"use client";

import { useEffect, useState } from "react";
import { getStreamCount, getTotalStreams, getTotalVolume } from "@/lib/aqua";

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-4 text-center">
      <div className="text-2xl font-bold text-cyan-300">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>
    </div>
  );
}

export default function Stats() {
  const [count, setCount] = useState<string>("…");
  const [total, setTotal] = useState<string>("…");
  const [volume, setVolume] = useState<string>("…");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [c, t, v] = await Promise.all([
          getStreamCount(),
          getTotalStreams(),
          getTotalVolume(),
        ]);
        if (!alive) return;
        setCount(String(c));
        setTotal(String(t));
        setVolume(v);
        setErr(null);
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : "Failed to load");
      }
    }
    load();
    const id = setInterval(load, 5000); // refresh every 5s
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="w-full max-w-xl">
      <div className="grid grid-cols-3 gap-3">
        <Card label="Streams (Aqua)" value={count} />
        <Card label="Total Streams" value={total} />
        <Card label="Total Volume" value={volume} />
      </div>
      {err && <p className="mt-3 text-center text-sm text-red-400">{err}</p>}
    </div>
  );
}
