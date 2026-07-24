export default function Loading() {
	return (
		<main className="relative z-10 flex min-h-screen items-center justify-center bg-[#020617] px-4">
			<div className="flex flex-col items-center gap-4">
				<div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
				<p className="text-sm text-slate-400">Loading…</p>
			</div>
		</main>
	);
}