export const metadata = {
	title: "About Aqua — How it works",
};

const steps = [
	{
		n: "1",
		title: "Fund a stream",
		body: "A sender locks an amount of a Stellar asset into the Aqua Soroban contract, with a start time and an end time.",
	},
	{
		n: "2",
		title: "Money vests per second",
		body: "From start to end, the recipient's withdrawable balance grows continuously — no batch payouts, no manual scheduling.",
	},
	{
		n: "3",
		title: "Withdraw anytime",
		body: "The recipient can withdraw their vested balance whenever they want, straight from the contract.",
	},
	{
		n: "4",
		title: "Cancel fairly",
		body: "If the sender cancels, the recipient keeps everything vested so far and the sender is refunded the rest.",
	},
];

export default function AboutPage() {
	return (
		<main className="relative z-10 min-h-screen py-10">
			<div className="aqua-grid" />
			<div className="aqua-orb aqua-orb-one" />
			<div className="aqua-orb aqua-orb-two" />

			<div className="mx-auto w-full max-w-2xl px-4">
				<h1 className="text-3xl font-bold text-white">About Aqua</h1>
				<p className="mt-2 text-slate-300">
					Aqua is a real-time money-streaming protocol on Stellar. Instead of
					paying someone in one lump sum, money flows to them every second — a
					better primitive for salaries, subscriptions, grants and vesting.
				</p>

				<h2 className="mt-10 text-xl font-semibold text-white">How it works</h2>
				<div className="mt-4 space-y-4">
					{steps.map((step) => (
						<div
							key={step.n}
							className="glass-panel flex gap-4 rounded-2xl p-5"
						>
							<span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-sm font-bold text-white">
								{step.n}
							</span>
							<div>
								<h3 className="font-semibold text-white">{step.title}</h3>
								<p className="mt-1 text-sm text-slate-300">{step.body}</p>
							</div>
						</div>
					))}
				</div>

				<h2 className="mt-10 text-xl font-semibold text-white">
					Where this is going
				</h2>
				<p className="mt-2 text-slate-300">
					Aqua is the streaming core of a bigger vision:{" "}
					<span className="font-semibold text-cyan-300">FlowBridge</span> —
					programmable cross-border payroll on Stellar. Employers fund payroll
					in a stable asset, workers earn continuously, and eligible users cash
					out to local currency through Stellar anchors. Anchor / fiat off-ramp
					and a multi-contract payroll system are on the roadmap for later
					stages.
				</p>

				<h2 className="mt-10 text-xl font-semibold text-white">
					Honest disclosure
				</h2>
				<div className="glass-panel mt-4 rounded-2xl p-5">
					<ul className="space-y-2 text-sm text-slate-300">
						<li>
							• Aqua runs on <strong>Stellar Testnet</strong>. All displayed
							funds are test assets with <strong>no real-world value</strong>.
						</li>
						<li>
							• Hardware-wallet signing is demonstrated with a{" "}
							<strong>simulated Ledger Stax</strong> via the{" "}
							<strong>Speculos</strong> emulator — not a physical device.
						</li>
						<li>
							• Ledger signing here uses <strong>Blind Signing</strong>. Aqua
							does not claim Clear Signing or hardware Secure Element security.
						</li>
						<li>
							• Aqua stores no private keys and no personal / KYC data.
						</li>
					</ul>
				</div>

				<p className="mt-10 text-center text-xs text-slate-500">
					Built on Stellar Soroban · Testnet assets have no real-world value
				</p>
			</div>
		</main>
	);
}