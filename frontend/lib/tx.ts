import {
  rpc,
  Contract,
  TransactionBuilder,
  Address,
  nativeToScVal,
  BASE_FEE,
  xdr,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { signWithLedger } from "./ledger";
import {
  RPC_URL,
  NETWORK_PASSPHRASE,
  AQUA_CONTRACT_ID,
} from "./config";

export type WalletType = "freighter" | "ledger";

const server = new rpc.Server(RPC_URL);

async function signPreparedTransaction(
  preparedXdr: string,
  source: string,
  walletType: WalletType
): Promise<string> {
  if (walletType === "ledger") {
    return signWithLedger(
      preparedXdr,
      NETWORK_PASSPHRASE,
      source
    );
  }

  const signed = await signTransaction(preparedXdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: source,
  });

  return typeof signed === "string" ? signed : signed.signedTxXdr;
}

// Build → simulate/assemble → sign with selected wallet → send → poll.
async function invoke(
  source: string,
  method: string,
  args: xdr.ScVal[],
  walletType: WalletType
): Promise<string> {
  const account = await server.getAccount(source);
  const contract = new Contract(AQUA_CONTRACT_ID);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(transaction);

  const signedXdr = await signPreparedTransaction(
    prepared.toXDR(),
    source,
    walletType
  );

  const signedTransaction = TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );

  const sent = await server.sendTransaction(signedTransaction);

  if (sent.status === "ERROR") {
    throw new Error("Transaction submission failed.");
  }

  let result = await server.getTransaction(sent.hash);
  const started = Date.now();

  while (
    result.status === "NOT_FOUND" &&
    Date.now() - started < 30_000
  ) {
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    result = await server.getTransaction(sent.hash);
  }

  if (result.status !== "SUCCESS") {
    throw new Error(`Transaction failed: ${result.status}`);
  }

  return sent.hash;
}

export async function createStream(params: {
  sender: string;
  recipient: string;
  token: string;
  amount: bigint;
  startTime: bigint;
  stopTime: bigint;
  walletType: WalletType;
}): Promise<string> {
  return invoke(
    params.sender,
    "create_stream",
    [
      new Address(params.sender).toScVal(),
      new Address(params.recipient).toScVal(),
      new Address(params.token).toScVal(),
      nativeToScVal(params.amount, { type: "i128" }),
      nativeToScVal(params.startTime, { type: "u64" }),
      nativeToScVal(params.stopTime, { type: "u64" }),
    ],
    params.walletType
  );
}

export async function withdraw(
  caller: string,
  streamId: number,
  walletType: WalletType
): Promise<string> {
  return invoke(
    caller,
    "withdraw",
    [nativeToScVal(BigInt(streamId), { type: "u64" })],
    walletType
  );
}

export async function cancelStream(
  caller: string,
  streamId: number,
  walletType: WalletType
): Promise<string> {
  return invoke(
    caller,
    "cancel_stream",
    [nativeToScVal(BigInt(streamId), { type: "u64" })],
    walletType
  );
}
