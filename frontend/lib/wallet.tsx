"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { isConnected, requestAccess, getAddress } from "@stellar/freighter-api";
import { connectLedger } from "@/lib/ledger";
import { type WalletType } from "@/lib/tx";

const DISCONNECT_KEY = "aqua_disconnected";
const WALLET_TYPE_KEY = "aqua_wallet_type";

type WalletContextValue = {
	address: string | null;
	walletType: WalletType | null;
	ledgerVersion: string | null;
	walletErr: string | null;
	busy: boolean;
	connectFreighter: () => Promise<void>;
	connectLedgerWallet: () => Promise<void>;
	disconnect: () => void;
	clearWalletError: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
	const [address, setAddress] = useState<string | null>(null);
	const [walletType, setWalletType] = useState<WalletType | null>(null);
	const [walletErr, setWalletErr] = useState<string | null>(null);
	const [ledgerVersion, setLedgerVersion] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		void (async () => {
			try {
				if (localStorage.getItem(DISCONNECT_KEY) === "1") return;

				const previousWallet = localStorage.getItem(WALLET_TYPE_KEY);

				// Ledger/Speculos requires an explicitly running local bridge,
				// so it is never reconnected automatically.
				if (previousWallet === "ledger") return;

				const connection = await isConnected();

				if (connection.isConnected) {
					const result = await getAddress();

					if (result.address) {
						setAddress(result.address);
						setWalletType("freighter");
					}
				}
			} catch {
				// Do not interrupt the initial page load when no wallet is available.
			}
		})();
	}, []);

	async function connectFreighter() {
		setWalletErr(null);

		try {
			const connection = await isConnected();

			if (!connection.isConnected) {
				setWalletErr("Freighter not detected.");
				return;
			}

			const result = await requestAccess();

			if (result.error) {
				setWalletErr(result.error);
				return;
			}

			localStorage.removeItem(DISCONNECT_KEY);
			localStorage.setItem(WALLET_TYPE_KEY, "freighter");

			setAddress(result.address);
			setWalletType("freighter");
			setLedgerVersion(null);
		} catch {
			setWalletErr("Could not connect to Freighter.");
		}
	}

	async function connectLedgerWallet() {
		setWalletErr(null);
		setBusy(true);

		try {
			const result = await connectLedger();

			localStorage.removeItem(DISCONNECT_KEY);
			localStorage.setItem(WALLET_TYPE_KEY, "ledger");

			setAddress(result.address);
			setWalletType("ledger");
			setLedgerVersion(result.appVersion);
		} catch (error) {
			setWalletErr(
				error instanceof Error ? error.message : "Could not connect to Ledger."
			);
		} finally {
			setBusy(false);
		}
	}

	function disconnect() {
		localStorage.setItem(DISCONNECT_KEY, "1");
		localStorage.removeItem(WALLET_TYPE_KEY);

		setAddress(null);
		setWalletType(null);
		setLedgerVersion(null);
		setWalletErr(null);
	}

	function clearWalletError() {
		setWalletErr(null);
	}

	return (
		<WalletContext.Provider
			value={{
				address,
				walletType,
				ledgerVersion,
				walletErr,
				busy,
				connectFreighter,
				connectLedgerWallet,
				disconnect,
				clearWalletError,
			}}
		>
			{children}
		</WalletContext.Provider>
	);
}

export function useWallet() {
	const context = useContext(WalletContext);
	if (!context) {
		throw new Error("useWallet must be used within a WalletProvider");
	}
	return context;
}