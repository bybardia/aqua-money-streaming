"use client";

import { useEffect, useState } from "react";
import {
  isConnected,
  requestAccess,
  getAddress,
} from "@stellar/freighter-api";
import { createStream, type WalletType } from "@/lib/tx";
import { connectLedger } from "@/lib/ledger";
import { NATIVE_TOKEN_ID } from "@/lib/config";
import Stats from "@/components/Stats";
import StreamList from "@/components/StreamList";

const DISCONNECT_KEY = "aqua_disconnected";
const WALLET_TYPE_KEY = "aqua_wallet_type";

export default function Dashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [walletErr, setWalletErr] = useState<string | null>(null);
  const [ledgerVersion, setLedgerVersion] = useState<string | null>(null);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("10");
  const [minutes, setMinutes] = useState("5");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        if (localStorage.getItem(DISCONNECT_KEY) === "1") return;

        const previousWallet = localStorage.getItem(WALLET_TYPE_KEY);

        // Ledger/Speculos requires an explicitly running local bridge,
        // so it is never reconnected automatically.
        if (previousWallet === "ledger") return;

        const connection = await isConnected();

        if (connection.isConnected) {
          const result = await getAddress();

          if (result.address) {
            setAddress(result.address);
            setWalletType("freighter");
          }
        }
      } catch {
        // Do not interrupt the initial page load when no wallet is available.
      }
    })();
  }, []);

  async function connectFreighter() {
    setWalletErr(null);
    setMsg(null);

    try {
      const connection = await isConnected();

      if (!connection.isConnected) {
        setWalletErr("Freighter not detected.");
        return;
      }

      const result = await requestAccess();

      if (result.error) {
        setWalletErr(result.error);
        return;
      }

      localStorage.removeItem(DISCONNECT_KEY);
      localStorage.setItem(WALLET_TYPE_KEY, "freighter");

      setAddress(result.address);
      setWalletType("freighter");
      setLedgerVersion(null);
    } catch {
      setWalletErr("Could not connect to Freighter.");
    }
  }

  async function connectLedgerWallet() {
    setWalletErr(null);
    setMsg(null);
    setBusy(true);

    try {
      const result = await connectLedger();

      localStorage.removeItem(DISCONNECT_KEY);
      localStorage.setItem(WALLET_TYPE_KEY, "ledger");

      setAddress(result.address);
      setWalletType("ledger");
      setLedgerVersion(result.appVersion);
    } catch (error) {
      setWalletErr(
        error instanceof Error ? error.message : "Could not connect to Ledger."
      );
    } finally {
      setBusy(false);
    }
  }

  function disconnect() {
    localStorage.setItem(DISCONNECT_KEY, "1");
    localStorage.removeItem(WALLET_TYPE_KEY);

    setAddress(null);
    setWalletType(null);
    setLedgerVersion(null);
    setWalletErr(null);
    setMsg(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!address || !walletType) return;

    setBusy(true);
    setMsg(null);

    try {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const stop = now + BigInt(Number(minutes) * 60);
      const stroops = BigInt(
        Math.round(Number(amount) * 10_000_000)
      );

      const hash = await createStream({
        sender: address,
        recipient: recipient.trim(),
        token: NATIVE_TOKEN_ID,
        amount: stroops,
        startTime: now,
        stopTime: stop,
        walletType,
      });

      setOk(true);
      setMsg(`✅ Stream created! tx: ${hash.slice(0, 10)}…`);
      setRecipient("");
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setOk(false);
      setMsg(
        error instanceof Error ? error.message : "Failed to create stream"
      );
    } finally {
      setBusy(false);
    }
  }

  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "";

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16">
      <section className="mb-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        {address ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-sm text-emerald-400">
                  🟢 {shortAddress}
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  {walletType === "ledger"
                    ? `Ledger via Speculos · Stellar app ${ledgerVersion}`
                    : "Freighter · Stellar Testnet"}
                </div>
              </div>

              <button
                type="button"
                onClick={disconnect}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Disconnect
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Connected to Stellar Testnet. All displayed funds are test assets.
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-3 text-lg font-semibold text-white">
              Connect a wallet
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={connectFreighter}
                disabled={busy}
                className="rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                Connect Freighter
              </button>

              <button
                type="button"
                onClick={connectLedgerWallet}
                disabled={busy}
                className="rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {busy ? "Connecting…" : "Connect Ledger"}
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Ledger development mode requires the local Speculos emulator and
              Aqua Ledger Bridge.
            </p>
          </>
        )}

        {walletErr && (
          <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
            {walletErr}
          </p>
        )}
      </section>

      <Stats />

      {address && walletType && (
        <form
          onSubmit={submit}
          className="my-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-5"
        >
          <h2 className="mb-5 text-xl font-semibold text-white">
            Create a stream
          </h2>

          <label className="mb-2 block text-sm text-slate-300">
            Recipient address (G...)
          </label>

          <input
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            required
            placeholder="G..."
            className="w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white outline-none"
          />

          <button
            type="button"
            onClick={() => setRecipient(address)}
            className="mb-4 mt-1 text-xs text-cyan-400 hover:underline"
          >
            Use my address (stream to myself)
          </button>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">
              Amount (XLM)
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                min="0.1"
                step="0.1"
                required
                className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none"
              />
            </label>

            <label className="text-sm text-slate-300">
              Duration (minutes)
              <input
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                type="number"
                min="1"
                required
                className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create Stream"}
          </button>

          {msg && (
            <p
              className={`mt-3 text-sm ${
                ok ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {msg}
            </p>
          )}
        </form>
      )}

      <StreamList
        address={address}
        walletType={walletType}
        refreshKey={refreshKey}
      />
    </main>
  );
}
