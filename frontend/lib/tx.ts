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
import { RPC_URL, NETWORK_PASSPHRASE, AQUA_CONTRACT_ID } from "./config";

const server = new rpc.Server(RPC_URL);

// Build → simulate/assemble → sign with Freighter → send → poll.
async function invoke(
  source: string,
  method: string,
  args: xdr.ScVal[],
): Promise<string> {
  const account = await server.getAccount(source);
  const contract = new Contract(AQUA_CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(tx);

  const signed = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: source,
  });
  const signedXdr = typeof signed === "string" ? signed : signed.signedTxXdr;

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sent = await server.sendTransaction(signedTx);
  if (sent.status === "ERROR") {
    throw new Error("Transaction submission failed.");
  }

  let result = await server.getTransaction(sent.hash);
  const started = Date.now();
  while (result.status === "NOT_FOUND" && Date.now() - started < 30000) {
    await new Promise((r) => setTimeout(r, 1500));
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
}): Promise<string> {
  return invoke(params.sender, "create_stream", [
    new Address(params.sender).toScVal(),
    new Address(params.recipient).toScVal(),
    new Address(params.token).toScVal(),
    nativeToScVal(params.amount, { type: "i128" }),
    nativeToScVal(params.startTime, { type: "u64" }),
    nativeToScVal(params.stopTime, { type: "u64" }),
  ]);
}

export async function withdraw(caller: string, streamId: number): Promise<string> {
  return invoke(caller, "withdraw", [
    nativeToScVal(BigInt(streamId), { type: "u64" }),
  ]);
}

export async function cancelStream(caller: string, streamId: number): Promise<string> {
  return invoke(caller, "cancel_stream", [
    nativeToScVal(BigInt(streamId), { type: "u64" }),
  ]);
}
