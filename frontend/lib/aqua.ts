import {
  rpc,
  Contract,
  TransactionBuilder,
  Account,
  Keypair,
  scValToNative,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import {
  RPC_URL,
  NETWORK_PASSPHRASE,
  AQUA_CONTRACT_ID,
  REGISTRY_CONTRACT_ID,
} from "./config";

const server = new rpc.Server(RPC_URL);

// Read-only call to a no-argument contract method returning a scalar.
async function readCall(contractId: string, method: string): Promise<unknown> {
  const contract = new Contract(contractId);
  // A throwaway source account is fine for read-only simulation.
  const source = new Account(Keypair.random().publicKey(), "0");

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method))
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
