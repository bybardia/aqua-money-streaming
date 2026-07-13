const express = require("express");
const cors = require("cors");

const SpeculosTransportModule = require(
  "@ledgerhq/hw-transport-node-speculos-http"
);
const StrModule = require("@ledgerhq/hw-app-str");
const StellarSdk = require("@stellar/stellar-sdk");

const SpeculosHttpTransport =
  SpeculosTransportModule.default || SpeculosTransportModule;
const Str = StrModule.default || StrModule;

const HOST = "127.0.0.1";
const PORT = 5050;
const SPECULOS_HOST = "http://127.0.0.1";
const SPECULOS_PORT = "5001";
const DERIVATION_PATH = "44'/148'/0'";

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by the Ledger bridge."));
    },
  })
);

app.use(express.json({ limit: "2mb" }));

async function withLedger(callback) {
  const transport = await SpeculosHttpTransport.open({
    baseURL: SPECULOS_HOST,
    apiPort: SPECULOS_PORT,
  });

  try {
    const ledger = new Str(transport);
    return await callback(ledger);
  } finally {
    await transport.close();
  }
}

async function getLedgerAddress(ledger) {
  const { rawPublicKey } = await ledger.getPublicKey(
    DERIVATION_PATH,
    false
  );

  return StellarSdk.StrKey.encodeEd25519PublicKey(rawPublicKey);
}

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "aqua-ledger-bridge",
    network: "Stellar Testnet",
  });
});

app.get("/address", async (_request, response) => {
  try {
    const result = await withLedger(async (ledger) => {
      const configuration = await ledger.getAppConfiguration();
      const address = await getLedgerAddress(ledger);

      return {
        address,
        derivationPath: DERIVATION_PATH,
        appVersion: configuration.version,
      };
    });

    response.json(result);
  } catch (error) {
    console.error("Failed to read Ledger address:", error);
    response.status(503).json({
      error: "Could not connect to the Stellar app in Speculos.",
    });
  }
});

app.post("/sign-transaction", async (request, response) => {
  const { transactionXdr, networkPassphrase } = request.body ?? {};

  if (
    typeof transactionXdr !== "string" ||
    typeof networkPassphrase !== "string"
  ) {
    response.status(400).json({
      error: "transactionXdr and networkPassphrase are required.",
    });
    return;
  }

  try {
    const result = await withLedger(async (ledger) => {
      const address = await getLedgerAddress(ledger);

      const transaction = StellarSdk.TransactionBuilder.fromXDR(
        transactionXdr,
        networkPassphrase
      );

      const { signature } = await ledger.signTransaction(
        DERIVATION_PATH,
        Buffer.from(transaction.signatureBase())
      );

      transaction.addSignature(
        address,
        signature.toString("base64")
      );

      return {
        address,
        signedTransactionXdr: transaction.toXDR(),
      };
    });

    response.json(result);
  } catch (error) {
    console.error("Ledger signing failed:", error);
    response.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Ledger signing failed.",
    });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Aqua Ledger Bridge: http://${HOST}:${PORT}`);
  console.log(`Speculos: ${SPECULOS_HOST}:${SPECULOS_PORT}`);
  console.log(`Path: ${DERIVATION_PATH}`);
});
