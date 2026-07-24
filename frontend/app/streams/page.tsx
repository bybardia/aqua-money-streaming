"use client";

import { useWallet } from "@/lib/wallet";
import Stats from "@/components/Stats";
import StreamList from "@/components/StreamList";

export default function StreamsPage() {
	const { address, walletType } = useWallet();

	return (
		<main className="relative z-10 min-h-screen py-10">
			<div className="aqua-grid" />
			<div className="aqua-orb aqua-orb-one" />
			<div className="aqua-orb aqua-orb-two" />

			<div className="mx-auto mb-8 w-full max-w-2xl px-4">
				<h1 className="text-2xl font-bold text-white">Stream Explorer</h1>
				<p className="mt-1 text-sm text-slate-400">
					Every stream created on the Aqua contract, live from Stellar Testnet.
					Connect a wallet to withdraw or cancel your own streams.
				</p>
			</div>

			<div className="mx-auto w-full max-w-2xl px-4">
				<Stats />
				<div className="mt-8">
					<StreamList
						address={address}
						walletType={walletType}
						refreshKey={0}
					/>
				</div>
			</div>
		</main>
	);
}