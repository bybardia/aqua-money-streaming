const LEDGER_BRIDGE_URL =
  process.env.NEXT_PUBLIC_LEDGER_BRIDGE_URL ?? "http://127.0.0.1:5050";

type LedgerAddressResponse = {
  address?: string;
  derivationPath?: string;
  appVersion?: string;
  error?: string;
};

type LedgerSignatureResponse = {
  address?: string;
  signedTransactionXdr?: string;
  error?: string;
};

function isStellarAddress(value: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(value);
}

export async function connectLedger(): Promise<{
  address: string;
  appVersion: string;
}> {
  let response: Response;

  try {
    response = await fetch(`${LEDGER_BRIDGE_URL}/address`, {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Ledger Bridge is unavailable. Start Speculos and the local bridge."
    );
  }

  const data = (await response.json()) as LedgerAddressResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Could not connect to Ledger.");
  }

  if (!data.address || !isStellarAddress(data.address)) {
    throw new Error("Ledger returned an invalid Stellar address.");
  }

  return {
    address: data.address,
    appVersion: data.appVersion ?? "unknown",
  };
}

export async function signWithLedger(
  transactionXdr: string,
  networkPassphrase: string,
  expectedAddress: string
): Promise<string> {
  let response: Response;

  try {
    response = await fetch(`${LEDGER_BRIDGE_URL}/sign-transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactionXdr,
        networkPassphrase,
      }),
    });
  } catch {
    throw new Error(
      "Ledger Bridge is unavailable. Start Speculos and the local bridge."
    );
  }

  const data = (await response.json()) as LedgerSignatureResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Ledger signing failed.");
  }

  if (data.address !== expectedAddress) {
    throw new Error("The connected Ledger account does not match the sender.");
  }

  if (!data.signedTransactionXdr) {
    throw new Error("Ledger Bridge did not return a signed transaction.");
  }

  return data.signedTransactionXdr;
}
