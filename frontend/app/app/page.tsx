import Dashboard from "@/components/Dashboard";

export const metadata = {
	title: "Aqua App — Create & manage streams",
};

export default function AppPage() {
	return (
		<main className="relative z-10 min-h-screen py-10">
			<div className="aqua-grid" />
			<div className="aqua-orb aqua-orb-one" />
			<div className="aqua-orb aqua-orb-two" />

			<div className="mx-auto mb-8 w-full max-w-2xl px-4">
				<h1 className="text-2xl font-bold text-white">Aqua App</h1>
				<p className="mt-1 text-sm text-slate-400">
					Create real-time payment streams and manage the ones you send or
					receive.
				</p>
			</div>

			<Dashboard />
		</main>
	);
}