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

function shortAddress(address) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

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

// Safe request logger for the demo. No secrets are printed.
app.use((request, _response, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] --> ${request.method} ${request.path}`);
  next();
});

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

async function getLedgerAddress(ledger, display = false) {
  const { rawPublicKey } = await ledger.getPublicKey(
    DERIVATION_PATH,
    display
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
    console.log("    waiting for address confirmation on Ledger Stax...");
    const result = await withLedger(async (ledger) => {
      const configuration = await ledger.getAppConfiguration();
      const address = await getLedgerAddress(ledger, true);

      return {
        address,
        derivationPath: DERIVATION_PATH,
        appVersion: configuration.version,
      };
    });

    console.log(
      `    OK address confirmed: ${shortAddress(result.address)} (Stellar app v${result.appVersion})`
    );
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
    console.log(
      `    signing request received (${transactionXdr.length} XDR chars)`
    );
    console.log("    waiting for approval on Ledger Stax...");
    const result = await withLedger(async (ledger) => {
      const address = await getLedgerAddress(ledger, false);

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

    console.log(
      `    OK transaction approved and signed by ${shortAddress(result.address)}`
    );
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
  console.log("Ready. Waiting for requests from the Aqua frontend...");
});
