"use client";

import { useEffect } from "react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="relative z-10 flex min-h-screen items-center justify-center bg-[#020617] px-4">
			<div className="glass-panel max-w-md rounded-2xl p-8 text-center">
				<h2 className="text-xl font-semibold text-white">
					Something went wrong
				</h2>
				<p className="mt-2 text-sm text-slate-400">
					{error.message || "An unexpected error occurred."}
				</p>
				<button
					onClick={reset}
					className="mt-5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white"
				>
					Try again
				</button>
			</div>
		</main>
	);
}