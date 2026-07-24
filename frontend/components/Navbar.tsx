"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useWallet } from "@/lib/wallet";

const navLinks = [
	{ href: "/", label: "Home" },
	{ href: "/app", label: "App" },
	{ href: "/streams", label: "Explorer" },
	{ href: "/about", label: "About" },
	{ href: "/feedback", label: "Feedback" },
];

const short = (a: string) => `${a.slice(0, 4)}...${a.slice(-4)}`;

export default function Navbar() {
	const {
		address,
		walletType,
		busy,
		walletErr,
		connectFreighter,
		connectLedgerWallet,
		disconnect,
		clearWalletError,
	} = useWallet();

	const pathname = usePathname();
	const [menuOpen, setMenuOpen] = useState(false);

	const closeMenu = () => setMenuOpen(false);

	const walletControls = address ? (
		<div className="flex flex-wrap items-center gap-2">
			<span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
				{walletType === "ledger" ? "Ledger" : "Freighter"} · {short(address)}
			</span>
			<button
				onClick={disconnect}
				className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
			>
				Disconnect
			</button>
		</div>
	) : (
		<div className="flex flex-wrap items-center gap-2">
			<button
				onClick={connectFreighter}
				disabled={busy}
				className="rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
			>
				{busy ? "…" : "Freighter"}
			</button>
			<button
				onClick={connectLedgerWallet}
				disabled={busy}
				className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-60"
			>
				Ledger
			</button>
		</div>
	);

	return (
		<header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur">
			<nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
				<Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
					<span className="text-lg font-black tracking-tight text-white">
						Aqua
					</span>
					<span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-cyan-300">
						Testnet
					</span>
				</Link>

				{/* Desktop links */}
				<div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={`hover:text-white ${
								pathname === link.href ? "text-white" : ""
							}`}
						>
							{link.label}
						</Link>
					))}
				</div>

				{/* Desktop wallet */}
				<div className="hidden md:block">{walletControls}</div>

				{/* Mobile hamburger */}
				<button
					onClick={() => setMenuOpen((v) => !v)}
					className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-200 md:hidden"
					aria-label="Toggle menu"
				>
					{menuOpen ? "✕" : "☰"}
				</button>
			</nav>

			{/* Mobile menu */}
			{menuOpen && (
				<div className="border-t border-white/5 bg-[#020617]/95 px-4 py-4 md:hidden">
					<div className="flex flex-col gap-3 text-sm text-slate-300">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={closeMenu}
								className={`hover:text-white ${
									pathname === link.href ? "text-white" : ""
								}`}
							>
								{link.label}
							</Link>
						))}
					</div>
					<div className="mt-4">{walletControls}</div>
				</div>
			)}

			{walletErr && (
				<div className="border-t border-rose-500/20 bg-rose-500/10 px-4 py-2 text-center text-xs text-rose-300">
					{walletErr}{" "}
					<button onClick={clearWalletError} className="underline">
						dismiss
					</button>
				</div>
			)}
		</header>
	);
}