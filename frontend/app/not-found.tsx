import Link from "next/link";

export default function NotFound() {
	return (
		<main className="relative z-10 flex min-h-screen items-center justify-center bg-[#020617] px-4">
			<div className="glass-panel max-w-md rounded-2xl p-8 text-center">
				<h2 className="text-2xl font-bold text-white">404</h2>
				<p className="mt-2 text-sm text-slate-400">
					This page drifted off the stream.
				</p>
				<Link
					href="/"
					className="mt-5 inline-block rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white"
				>
					Back home
				</Link>
			</div>
		</main>
	);
}