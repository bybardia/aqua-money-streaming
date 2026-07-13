"use client";

import { useEffect, useState } from "react";
import { listStreams, StreamData } from "@/lib/aqua";
import { withdraw, cancelStream, type WalletType } from "@/lib/tx";

const short = (a: string) => `${a.slice(0, 4)}...${a.slice(-4)}`;
const xlm = (stroops: bigint) => (Number(stroops) / 1e7).toFixed(4);

function vestedNow(s: StreamData, now: number): bigint {
  if (s.cancelled) return s.withdrawn;
  const start = Number(s.startTime);
  const stop = Number(s.stopTime);
  if (now <= start) return 0n;
  if (now >= stop) return s.amount;
  return (s.amount * BigInt(now - start)) / BigInt(stop - start);
}

export default function StreamList({
  address,
  walletType,
  refreshKey,
}: {
  address: string | null;
  walletType: WalletType | null;
  refreshKey: number;
}) {
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [now, setNow] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setStreams(await listStreams());
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load streams");
    }
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000));
    const structural = setInterval(load, 6000);
    const tick = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => {
      clearInterval(structural);
      clearInterval(tick);
    };
  }, []);

  async function run(id: number, fn: () => Promise<string>) {
    if (!address || !walletType) return;
    setBusyId(id);
    setErr(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setBusyId(null);
    }
  }

  if (streams.length === 0) {
    return <p className="text-sm text-slate-500">No streams yet. Create one above.</p>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="text-lg font-semibold text-white">Streams</h2>
      {err && <p className="text-sm text-red-400">{err}</p>}
      {[...streams]
        .sort((first, second) => second.id - first.id)
        .map((s) => {
        const vested = vestedNow(s, now);
        const available = s.cancelled
          ? 0n
          : vested > s.withdrawn
            ? vested - s.withdrawn
            : 0n;
        const pct =
          s.amount > 0n
            ? Math.min(100, Number((vested * 10000n) / s.amount) / 100)
            : 0;
        const isRecipient = address === s.recipient;
        const isSender = address === s.sender;
        const done = now >= Number(s.stopTime);
        const status = s.cancelled ? "cancelled" : done ? "completed" : "active";
        const statusColor = s.cancelled
          ? "text-red-400"
          : done
            ? "text-emerald-400"
            : "text-cyan-300";
        const showWithdraw = isRecipient && !s.cancelled;
        const showCancel = isSender && !s.cancelled && !done;
        return (
          <div
            key={s.id}
            className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-left"
          >
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>
                #{s.id} · <span className={statusColor}>{status}</span>
              </span>
              <span className="font-mono">
                {short(s.sender)} → {short(s.recipient)}
              </span>
            </div>
            <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-cyan-400 transition-all duration-1000 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-mono text-cyan-300">{xlm(vested)}</div>
                <div className="text-slate-500">streamed</div>
              </div>
              <div>
                <div className="font-mono text-white">{xlm(available)}</div>
                <div className="text-slate-500">available</div>
              </div>
              <div>
                <div className="font-mono text-slate-300">{xlm(s.amount)}</div>
                <div className="text-slate-500">total (XLM)</div>
              </div>
            </div>
            {(showWithdraw || showCancel) && (
              <div className="mt-3 flex gap-2">
                {showWithdraw && (
                  <button
                    onClick={() => run(s.id, () => withdraw(address!, s.id, walletType!))}
                    disabled={busyId === s.id || available === 0n}
                    className="flex-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-40"
                  >
                    {busyId === s.id ? "…" : "Withdraw"}
                  </button>
                )}
                {showCancel && (
                  <button
                    onClick={() => run(s.id, () => cancelStream(address!, s.id, walletType!))}
                    disabled={busyId === s.id}
                    className="flex-1 rounded-lg bg-red-500/80 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-40"
                  >
                    {busyId === s.id ? "…" : "Cancel"}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
