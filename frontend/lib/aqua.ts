import {
  rpc,
  Contract,
  TransactionBuilder,
  Account,
  Keypair,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
  xdr,
} from "@stellar/stellar-sdk";
import {
  RPC_URL,
  NETWORK_PASSPHRASE,
  AQUA_CONTRACT_ID,
  REGISTRY_CONTRACT_ID,
} from "./config";

const server = new rpc.Server(RPC_URL);

async function readCall(
  contractId: string,
  method: string,
  ...args: xdr.ScVal[]
): Promise<unknown> {
  const contract = new Contract(contractId);
  const source = new Account(Keypair.random().publicKey(), "0");
  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(sim.error);
  }
  const retval = sim.result?.retval;
  return retval ? scValToNative(retval) : null;
}

export async function getStreamCount(): Promise<number> {
  return Number(await readCall(AQUA_CONTRACT_ID, "stream_count"));
}
export async function getTotalStreams(): Promise<number> {
  return Number(await readCall(REGISTRY_CONTRACT_ID, "total_streams"));
}
export async function getTotalVolume(): Promise<string> {
  const v = await readCall(REGISTRY_CONTRACT_ID, "total_volume");
  return String(v ?? 0);
}

export type StreamData = {
  id: number;
  sender: string;
  recipient: string;
  token: string;
  amount: bigint;
  withdrawn: bigint;
  startTime: bigint;
  stopTime: bigint;
  cancelled: boolean;
};

export async function getStream(id: number): Promise<StreamData | null> {
  try {
    const s = (await readCall(
      AQUA_CONTRACT_ID,
      "get_stream",
      nativeToScVal(BigInt(id), { type: "u64" }),
    )) as Record<string, unknown> | null;
    if (!s) return null;
    return {
      id,
      sender: String(s.sender),
      recipient: String(s.recipient),
      token: String(s.token),
      amount: BigInt(s.amount as bigint),
      withdrawn: BigInt(s.withdrawn as bigint),
      startTime: BigInt(s.start_time as bigint),
      stopTime: BigInt(s.stop_time as bigint),
      cancelled: Boolean(s.cancelled),
    };
  } catch {
    return null;
  }
}

export async function listStreams(): Promise<StreamData[]> {
  const count = await getStreamCount();
  // Try ids 0..count to cover either indexing; missing ones return null.
  const ids = Array.from({ length: count + 1 }, (_, i) => i);
  const results = await Promise.all(ids.map((id) => getStream(id)));
  return results.filter((s): s is StreamData => s !== null);
}
