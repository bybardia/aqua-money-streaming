# Aqua Ledger Bridge

A small local Node.js service that connects the Aqua frontend to the official
Stellar Ledger app running in the Speculos emulator. It exposes a minimal HTTP
API the dApp uses to read the Stellar address and to sign prepared Soroban
transactions.

> This bridge is for local Testnet development only. It listens exclusively on
> `127.0.0.1` and never handles or exposes private keys.

## Requirements

- Node.js 20+
- Docker (for the Speculos emulator)
- The official Stellar Ledger app built for a supported model (Stax or Nano S Plus)

## Configuration

The bridge uses fixed local defaults:

| Setting | Value |
| --- | --- |
| Bridge host/port | `127.0.0.1:5050` |
| Speculos API | `http://127.0.0.1:5001` |
| Derivation path | `44'/148'/0'` |
| Allowed origins | `http://localhost:3000`, `http://127.0.0.1:3000` |

## Running

Start the Speculos emulator (see the root `README.md` Ledger section), then:

~~~bash
cd ledger-bridge
npm install
npm start
~~~

Expected startup output:

~~~text
Aqua Ledger Bridge: http://127.0.0.1:5050
Speculos: http://127.0.0.1:5001
Path: 44'/148'/0'
~~~

## HTTP API

### `GET /health`

Returns a simple status object:

~~~json
{ "ok": true, "service": "aqua-ledger-bridge", "network": "Stellar Testnet" }
~~~

### `GET /address`

Reads the Stellar address from the device and asks the user to confirm it on
screen. Returns the address, derivation path, and Stellar app version.

### `POST /sign-transaction`

Body: `{ "transactionXdr": "...", "networkPassphrase": "..." }`

Signs the prepared transaction on the device and returns the signed XDR. The
bridge only sends the transaction signature base to the device and adds the
returned signature to the transaction.

## Local logging

The bridge prints timestamped, non-sensitive logs so you can follow the flow
during development and demos. It logs the request method and path, the public
Stellar address, the transaction hash, and status messages.

It never logs private keys, signatures, or full transaction XDR.

Example during a connect and a stream creation:

~~~text
[19:00:12] -> GET /address
[19:00:12] Connect: waiting for address confirmation on the device...
[19:00:18] Connect: address confirmed GCNC...BQ5B (Stellar app 6.0.3)
[19:01:40] -> POST /sign-transaction
[19:01:40] Sign: request for GCNC...BQ5B
[19:01:40] Sign: transaction hash 3f9a...
[19:01:40] Sign: waiting for approval on the device...
[19:01:55] Sign: approved and signed by GCNC...BQ5B
~~~

## Security notes

- Runs on Testnet only; Testnet assets have no real-world value.
- Speculos is an emulator and does not provide hardware-wallet security.
- Blind Signing is used for Soroban calls and should only be enabled for known
  Testnet transactions.
- The bridge binds to `127.0.0.1` and rejects requests from other origins.
