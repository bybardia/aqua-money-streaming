"use client";

import { useEffect, useState } from "react";
import { isConnected, requestAccess, getAddress } from "@stellar/freighter-api";
import { createStream } from "@/lib/tx";
import { NATIVE_TOKEN_ID } from "@/lib/config";
import Stats from "@/components/Stats";

export default function Dashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const [walletErr, setWalletErr] = useState<string | null>(null);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("10");
  const [minutes, setMinutes] = useState("5");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const c = await isConnected();
        if (c.isConnected) {
          const r = await getAddress();
          if (r.address) setAddress(r.address);
        }
      } catch {}
    })();
  }, []);

  async function connect() {
    setWalletErr(null);
    try {
      const c = await isConnected();
      if (!c.isConnected) return setWalletErr("Freighter not detected.");
      const r = await requestAccess();
      if (r.error) return setWalletErr(r.error);
      setAddress(r.address);
    } catch {
      setWalletErr("Could not connect.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    setBusy(true);
    setMsg(null);
    try {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const stop = now + BigInt(Number(minutes) * 60);
      const stroops = BigInt(Math.round(Number(amount) * 10_000_000));
      const hash = await createStream({
        sender: address,
        recipient: recipient.trim(),
        token: NATIVE_TOKEN_ID,
        amount: stroops,
        startTime: now,
        stopTime: stop,
      });
      setOk(true);
      setMsg(`✅ Stream created! tx: ${hash.slice(0, 10)}…`);
      setRecipient("");
    } catch (err) {
      setOk(false);
      setMsg(err instanceof Error ? err.message : "Failed to create stream");
    } finally {
      setBusy(false);
    }
  }

  const short = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      {address ? (
        <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 font-mono text-sm text-cyan-300">
          🟢 {short}
        </span>
      ) : (
        <button
          onClick={connect}
          className="rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-white hover:bg-cyan-400"
        >
          Connect Freighter
        </button>
      )}
      {walletErr && <p className="text-sm text-red-400">{walletErr}</p>}

      <Stats />

      {address && (
        <form
          onSubmit={submit}
          className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 p-6 text-left"
        >
          <h2 className="mb-4 text-lg font-semibold text-white">
            Create a stream
          </h2>

          <label className="mb-1 block text-xs text-slate-400">
            Recipient address (G...)
          </label>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            placeholder="G..."
            className="mb-4 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white outline-none"
          />

          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-400">
                Amount (XLM)
              </label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0.1"
                step="0.1"
                required
                className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-400">
                Duration (minutes)
              </label>
              <input
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                type="number"
                min="1"
                required
                className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          <button
            disabled={busy}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-white hover:bg-cyan-400 disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create Stream"}
          </button>

          {msg && (
            <p className={`mt-3 text-sm ${ok ? "text-emerald-400" : "text-red-400"}`}>
              {msg}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
