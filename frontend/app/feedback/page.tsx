"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet";

const roles = ["Sender / Employer", "Recipient / Employee", "Just exploring"];
const short = (a: string) => (a ? `${a.slice(0, 4)}...${a.slice(-4)}` : "anon");

type FeedbackItem = {
	at: string;
	role: string;
	rating: number;
	liked: string;
	improve: string;
	wallet: string;
};

export default function FeedbackPage() {
	const { address, connectFreighter } = useWallet();

	const [role, setRole] = useState(roles[0]);
	const [rating, setRating] = useState(5);
	const [liked, setLiked] = useState("");
	const [improve, setImprove] = useState("");
	const [contact, setContact] = useState("");
	const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
	const [errMsg, setErrMsg] = useState<string | null>(null);

	const [items, setItems] = useState<FeedbackItem[]>([]);
	const [loadingList, setLoadingList] = useState(true);

	const loadList = useCallback(async () => {
		setLoadingList(true);
		try {
			const res = await fetch("/api/feedback", { cache: "no-store" });
			const data = (await res.json()) as { items?: FeedbackItem[] };
			setItems(Array.isArray(data.items) ? data.items : []);
		} catch {
			setItems([]);
		} finally {
			setLoadingList(false);
		}
	}, []);

	useEffect(() => {
		void loadList();
	}, [loadList]);

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		if (!address) return;

		setStatus("sending");
		setErrMsg(null);

		try {
			const res = await fetch("/api/feedback", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					role,
					rating,
					liked,
					improve,
					contact,
					wallet: address,
				}),
			});

			const data = (await res.json().catch(() => ({}))) as {
				ok?: boolean;
				error?: string;
			};

			if (!res.ok || !data.ok) {
				throw new Error(data.error ?? `Request failed (${res.status})`);
			}

			setLiked("");
			setImprove("");
			setContact("");
			setStatus("idle");
			await loadList();
		} catch (error) {
			setStatus("error");
			setErrMsg(
				error instanceof Error ? error.message : "Failed to send feedback"
			);
		}
	}

	return (
		<main className="relative z-10 min-h-screen py-10">
			<div className="aqua-grid" />
			<div className="aqua-orb aqua-orb-one" />
			<div className="aqua-orb aqua-orb-two" />

			<div className="mx-auto w-full max-w-xl px-4">
				<h1 className="text-3xl font-bold text-white">Feedback</h1>
				<p className="mt-2 text-slate-300">
					Connect the wallet you used on Testnet and leave feedback. Every
					review is public and tied to the wallet that submitted it.
				</p>

				{/* Form — wallet gated */}
				{address ? (
					<form onSubmit={submit} className="glass-panel mt-8 rounded-2xl p-6">
						<p className="mb-4 rounded-lg bg-slate-800/60 px-3 py-2 text-xs text-slate-300">
							Posting as{" "}
							<span className="font-mono text-emerald-300">
								{short(address)}
							</span>
						</p>

						<label className="mb-1 block text-sm text-slate-300">
							Which best describes you?
						</label>
						<select
							value={role}
							onChange={(event) => setRole(event.target.value)}
							className="mb-4 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none"
						>
							{roles.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>

						<label className="mb-1 block text-sm text-slate-300">
							Overall rating
						</label>
						<div className="mb-4 flex gap-2">
							{[1, 2, 3, 4, 5].map((value) => (
								<button
									key={value}
									type="button"
									onClick={() => setRating(value)}
									className={`h-9 w-9 rounded-lg text-sm font-semibold ${
										rating >= value
											? "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white"
											: "bg-slate-800 text-slate-400"
									}`}
								>
									{value}
								</button>
							))}
						</div>

						<label className="mb-1 block text-sm text-slate-300">
							What worked well?
						</label>
						<textarea
							value={liked}
							onChange={(event) => setLiked(event.target.value)}
							rows={3}
							className="mb-4 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none"
						/>

						<label className="mb-1 block text-sm text-slate-300">
							What should we improve?
						</label>
						<textarea
							value={improve}
							onChange={(event) => setImprove(event.target.value)}
							rows={3}
							className="mb-4 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none"
						/>

						<label className="mb-1 block text-sm text-slate-300">
							Contact (optional, private — email or X handle)
						</label>
						<input
							value={contact}
							onChange={(event) => setContact(event.target.value)}
							className="mb-4 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none"
						/>

						<button
							type="submit"
							disabled={status === "sending"}
							className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 font-semibold text-white disabled:opacity-60"
						>
							{status === "sending" ? "Sending…" : "Submit feedback"}
						</button>

						{status === "error" && errMsg && (
							<p className="mt-3 text-sm text-rose-400">{errMsg}</p>
						)}
					</form>
				) : (
					<div className="glass-panel mt-8 rounded-2xl p-6 text-center">
						<p className="text-sm text-slate-300">
							You need a connected wallet to leave feedback.
						</p>
						<button
							onClick={connectFreighter}
							className="mt-3 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white"
						>
							Connect Freighter
						</button>
					</div>
				)}

				{/* Public feedback list */}
				<h2 className="mt-12 text-xl font-semibold text-white">
					Community feedback{" "}
					{!loadingList && (
						<span className="text-sm font-normal text-slate-500">
							({items.length})
						</span>
					)}
				</h2>

				<div className="mt-4 space-y-3">
					{loadingList ? (
						<p className="text-sm text-slate-500">Loading feedback…</p>
					) : items.length === 0 ? (
						<p className="text-sm text-slate-500">
							No feedback yet. Be the first!
						</p>
					) : (
						[...items].reverse().map((item, index) => (
							<div
								key={`${item.wallet}-${item.at}-${index}`}
								className="glass-panel rounded-2xl p-4"
							>
								<div className="flex items-center justify-between">
									<span className="font-mono text-xs text-emerald-300">
										{short(item.wallet)}
									</span>
									<span className="text-sm text-cyan-300">
										{"★".repeat(Math.max(0, Math.min(5, Number(item.rating))))}
										<span className="text-slate-600">
											{"★".repeat(
												5 - Math.max(0, Math.min(5, Number(item.rating)))
											)}
										</span>
									</span>
								</div>
								{item.role && (
									<p className="mt-1 text-xs text-slate-500">{item.role}</p>
								)}
								{item.liked && (
									<p className="mt-2 text-sm text-slate-200">
										<span className="text-slate-400">👍 </span>
										{item.liked}
									</p>
								)}
								{item.improve && (
									<p className="mt-1 text-sm text-slate-200">
										<span className="text-slate-400">🔧 </span>
										{item.improve}
									</p>
								)}
							</div>
						))
					)}
				</div>
			</div>
		</main>
	);
}