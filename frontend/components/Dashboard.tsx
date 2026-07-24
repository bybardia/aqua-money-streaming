"use client";

import { useState } from "react";
import { createStream } from "@/lib/tx";
import { NATIVE_TOKEN_ID } from "@/lib/config";
import { useWallet } from "@/lib/wallet";
import Stats from "@/components/Stats";
import StreamList from "@/components/StreamList";

export default function Dashboard() {
	const { address, walletType, connectFreighter } = useWallet();

	const [recipient, setRecipient] = useState("");
	const [amount, setAmount] = useState("10");
	const [minutes, setMinutes] = useState("5");
	const [busy, setBusy] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);
	const [ok, setOk] = useState(true);
	const [refreshKey, setRefreshKey] = useState(0);

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		if (!address || !walletType) return;

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

	return (
		<div className="mx-auto w-full max-w-2xl px-4">
			<Stats />

			{address && walletType ? (
				<form onSubmit={submit} className="glass-panel mt-8 rounded-2xl p-6">
					<h2 className="mb-4 text-lg font-semibold text-white">
						Create a stream
					</h2>

					<label className="mb-1 block text-sm text-slate-300">
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

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm text-slate-300">
								Amount (XLM)
							</label>
							<input
								value={amount}
								onChange={(event) => setAmount(event.target.value)}
								type="number"
								min="0.1"
								step="0.1"
								required
								className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none"
							/>
						</div>

						<div>
							<label className="block text-sm text-slate-300">
								Duration (minutes)
							</label>
							<input
								value={minutes}
								onChange={(event) => setMinutes(event.target.value)}
								type="number"
								min="1"
								required
								className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={busy}
						className="mt-4 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 font-semibold text-white disabled:opacity-60"
					>
						{busy ? "Creating…" : "Create Stream"}
					</button>

					{msg && (
						<p
							className={`mt-3 text-sm ${
								ok ? "text-emerald-400" : "text-rose-400"
							}`}
						>
							{msg}
						</p>
					)}
				</form>
			) : (
				<div className="glass-panel mt-8 rounded-2xl p-6 text-center">
					<p className="text-sm text-slate-300">
						Connect a wallet from the top bar to create a stream.
					</p>
					<button
						onClick={connectFreighter}
						className="mt-3 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white"
					>
						Connect Freighter
					</button>
				</div>
			)}

			<div className="mt-8">
				<StreamList
					address={address}
					walletType={walletType}
					refreshKey={refreshKey}
				/>
			</div>
		</div>
	);
}