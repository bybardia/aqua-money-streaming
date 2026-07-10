"use client";

import { useEffect, useState } from "react";
import { isConnected, requestAccess, getAddress } from "@stellar/freighter-api";

export default function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // On load: if already connected, show the address.
  useEffect(() => {
    (async () => {
      try {
        const conn = await isConnected();
        if (conn.isConnected) {
          const res = await getAddress();
          if (res.address) setAddress(res.address);
        }
      } catch {
        /* Freighter not installed yet */
      }
    })();
  }, []);

  async function connect() {
    setError(null);
    setLoading(true);
    try {
      const conn = await isConnected();
      if (!conn.isConnected) {
        setError("Freighter not detected. Please install the extension.");
        return;
      }
      const res = await requestAccess();
      if (res.error) {
        setError(res.error);
        return;
      }
      setAddress(res.address);
    } catch (e) {
      setError("Could not connect to Freighter.");
    } finally {
      setLoading(false);
    }
  }

  const short = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "";

  return (
    <div className="flex flex-col items-center gap-2">
      {address ? (
        <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 font-mono text-sm text-cyan-300">
          🟢 {short}
        </span>
      ) : (
        <button
          onClick={connect}
          disabled={loading}
          className="rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Connect Freighter"}
        </button>
      )}
      {error && <p className="max-w-xs text-sm text-red-400">{error}</p>}
    </div>
  );
}
