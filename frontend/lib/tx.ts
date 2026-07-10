import {
  rpc,
  Contract,
  TransactionBuilder,
  Address,
  nativeToScVal,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { RPC_URL, NETWORK_PASSPHRASE, AQUA_CONTRACT_ID } from "./config";

const server = new rpc.Server(RPC_URL);

export async function createStream(params: {
  sender: string;
  recipient: string;
  token: string;
  amount: bigint; // in stroops (1 XLM = 10_000_000)
  startTime: bigint; // unix seconds
  stopTime: bigint; // unix seconds
}): Promise<string> {
  const account = await server.getAccount(params.sender);
  const contract = new Contract(AQUA_CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "create_stream",
        new Address(params.sender).toScVal(),
        new Address(params.recipient).toScVal(),
        new Address(params.token).toScVal(),
        nativeToScVal(params.amount, { type: "i128" }),
        nativeToScVal(params.startTime, { type: "u64" }),
        nativeToScVal(params.stopTime, { type: "u64" }),
      ),
    )
    .setTimeout(60)
    .build();

  // Simulate + assemble Soroban auth/resources/fees.
  const prepared = await server.prepareTransaction(tx);

  // Sign with Freighter.
  const signed = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: params.sender,
  });
  const signedXdr = typeof signed === "string" ? signed : signed.signedTxXdr;

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sent = await server.sendTransaction(signedTx);
  if (sent.status === "ERROR") {
    throw new Error("Transaction submission failed.");
  }

  // Poll until the transaction is confirmed.
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
