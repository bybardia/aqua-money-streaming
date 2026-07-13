# 🌊 Aqua — Real-Time Money Streaming on Stellar

[![CI](https://github.com/bybardia/aqua-money-streaming/actions/workflows/ci.yml/badge.svg)](https://github.com/bybardia/aqua-money-streaming/actions/workflows/ci.yml)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet-7C3AED)](https://stellar.org/)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-06B6D4)](https://stellar.org/soroban)
[![License](https://img.shields.io/badge/License-MIT-22C55E)](LICENSE)

Aqua is a decentralized money-streaming protocol built on Stellar Soroban.

Instead of sending a complete payment at once, Aqua lets users stream tokens continuously over time. It is designed for salaries, subscriptions, grants, recurring payments, and token vesting.

Recipients can withdraw their vested balance at any moment. Senders can cancel an active stream and receive a fair refund of the unstreamed portion.

> ⚠️ **Network:** Aqua currently runs on the **Stellar Testnet**. All displayed assets have no real-world value.

## ✨ Features

- ⏱️ Per-second linear token streaming
- 💸 Withdraw vested funds at any time
- 🛑 Cancel active streams with a fair refund
- 📊 On-chain registry for stream and volume analytics
- 🔴 Live vested-balance updates
- 🆕 Newest streams displayed first
- 👛 Freighter browser-wallet integration
- 🔐 Ledger signing through Speculos
- 💳 Ledger Stax and Nano S Plus development support
- 🔗 Cross-contract communication between Aqua and Registry
- 📱 Responsive desktop and mobile interface
- 🎨 Custom Aqua protocol mark and premium static UI
- ⏳ Loading, success, rejection, and error states
- ✅ Rust smart-contract test suite
- 🔄 GitHub Actions CI/CD pipeline
- 🚀 Live deployment on Vercel

## 🌐 Live Project

- **Live demo:** https://aqua-money-streaming.vercel.app/
- **GitHub repository:** https://github.com/bybardia/aqua-money-streaming
- **Video walkthrough:** https://youtu.be/uRWHOTKqXbw
- **Network:** Stellar Testnet

> The hosted Vercel demo supports Freighter. Ledger Speculos mode requires the local bridge described below.

## 🏗️ Architecture

| Package | Description |
| --- | --- |
| `contracts/aqua` | Core escrow and streaming contract |
| `contracts/registry` | On-chain analytics and stream registry |
| `frontend` | Next.js, TypeScript, and Tailwind multi-wallet dApp |
| `ledger-bridge` | Local bridge between Aqua and Ledger Speculos |
| `.github/workflows/ci.yml` | Contract and frontend CI/CD pipeline |

### Contract architecture

~~~text
Sender
  |
  | create_stream
  v
Aqua Contract
  |
  | Cross-contract call
  v
Registry Contract
~~~

The Aqua contract manages token escrow, vesting, withdrawals, and cancellation. Whenever a stream is created, Aqua automatically calls the Registry contract to record its analytics.

### Frontend signing architecture

~~~text
                         ┌─────────────────────┐
                         │ Freighter Extension │
                         └──────────▲──────────┘
                                    │
Aqua Frontend ── Wallet Adapter ────┤
                                    │
                         ┌──────────▼──────────┐
                         │ Local Ledger Bridge │
                         └──────────┬──────────┘
                                    │ APDU
                         ┌──────────▼──────────┐
                         │ Ledger Speculos     │
                         │ Stax / Nano S Plus  │
                         └─────────────────────┘
~~~

Both signing methods interact with the same deployed Aqua contracts on Stellar Testnet.

## 📜 Deployed Contracts

| Contract | Testnet Address |
| --- | --- |
| Aqua | `CAYCGEXSUJ2SYV5L3OQ52UOCWGNZ7XK6H7ODXAURYCLAE3HPS4SJZUFG` |
| Registry | `CCVABJMB3KN3DVTVJY5FCS5YXMXJKFQYCIRHRRJPQBTFWEDMNFA6P5HV` |
| Native XLM SAC | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

### Explorer links

- [Aqua contract on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAYCGEXSUJ2SYV5L3OQ52UOCWGNZ7XK6H7ODXAURYCLAE3HPS4SJZUFG)
- [Registry contract on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCVABJMB3KN3DVTVJY5FCS5YXMXJKFQYCIRHRRJPQBTFWEDMNFA6P5HV)
- [Sample initialize transaction](https://stellar.expert/explorer/testnet/tx/6ec37dee236d703d941a5798bcda50377655d5885956a08a54cb6b14024cc8d0)

### Deployment transaction hashes

| Interaction | Transaction Hash |
| --- | --- |
| Aqua initialization | `6ec37dee236d703d941a5798bcda50377655d5885956a08a54cb6b14024cc8d0` |
| Registry initialization | `84d0043742342a7b58cbf886217ef6aa5ea725ee9b00f73c8ac60d94c7236a30` |

## ⚙️ How Aqua Works

### Creating a stream

1. The sender connects Freighter or a local Ledger Speculos account.
2. The sender provides the recipient address, amount, and duration.
3. Aqua builds and simulates the Soroban transaction.
4. The selected wallet reviews and signs the transaction.
5. The Aqua contract transfers tokens into escrow.
6. Aqua calls the Registry contract to record the stream.
7. The stream appears at the top of the interface.

### Vesting

The vested amount increases linearly over time:

~~~text
vested = total_amount × elapsed_time / stream_duration
~~~

Before the start time, the vested amount is zero. After the stop time, the complete stream amount is vested.

### Withdrawal

The recipient can withdraw:

~~~text
available = vested_amount - previously_withdrawn
~~~

A withdrawal only transfers the amount that has vested and has not already been withdrawn.

### Cancellation

When the sender cancels an active stream:

- The recipient receives the vested remainder.
- The sender receives the unstreamed remainder.
- The stream is marked as cancelled.
- No additional amount can vest after cancellation.

## 🧱 Tech Stack

### Smart contracts

- Rust
- Soroban SDK
- Stellar CLI
- Stellar Asset Contract
- Cross-contract invocation

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Stellar JavaScript SDK
- Freighter API

### Ledger development integration

- Official Stellar Ledger app
- Ledger Speculos
- LedgerJS Stellar bindings
- Local Node.js signing bridge
- Ledger Stax emulator
- Ledger Nano S Plus emulator

### Infrastructure

- GitHub Actions
- Vercel
- Stellar Testnet RPC
- Stellar Horizon
- Stellar Expert

## 🚀 Getting Started

### Prerequisites

- Git
- Rust
- Stellar CLI
- Node.js 20+
- npm
- Freighter wallet extension
- Docker for optional Ledger Speculos mode

Clone the repository:

~~~bash
git clone https://github.com/bybardia/aqua-money-streaming.git
cd aqua-money-streaming
~~~

## 🦀 Smart Contracts

Build the contracts:

~~~bash
stellar contract build
~~~

Run the tests:

~~~bash
cargo test --workspace
~~~

Run formatting checks:

~~~bash
cargo fmt --all -- --check
~~~

Run Clippy:

~~~bash
cargo clippy --all-targets --workspace
~~~

Build the optimized WASM contracts:

~~~bash
cargo build --workspace --release --target wasm32v1-none
~~~

Deployment information is available in [`DEPLOYMENT.md`](DEPLOYMENT.md).

## 🖥️ Frontend

Install dependencies:

~~~bash
cd frontend
npm install
~~~

Start development mode:

~~~bash
npm run dev
~~~

Open:

~~~text
http://localhost:3000
~~~

For production mode:

~~~bash
npm run build
npm start
~~~

Testnet configuration and deployed contract addresses are stored in:

~~~text
frontend/lib/config.ts
~~~

## 👛 Freighter Wallet

1. Install the Freighter browser extension.
2. Set Freighter to **Testnet**.
3. Open Aqua.
4. Select **Connect Freighter**.
5. Approve the connection.
6. Create, withdraw, or cancel a stream.
7. Review and approve each transaction in Freighter.

To switch accounts, change the active account inside Freighter before reconnecting.

## 🔐 Ledger and Speculos

Aqua includes a local Ledger development integration using the official Stellar Ledger application.

### Supported local models

- Ledger Stax
- Ledger Nano S Plus

### Important limitation

The current Ledger integration uses Speculos and a local Node.js bridge. It is not enabled on the public Vercel deployment by default.

### Build the Stellar Ledger app

Clone the official repository outside Aqua:

~~~bash
mkdir -p ~/ledger-dev
cd ~/ledger-dev
git clone --branch develop https://github.com/LedgerHQ/app-stellar.git
cd app-stellar
~~~

Pull the official Ledger development image:

~~~bash
sudo docker pull ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest
~~~

Allow the Docker container to use the local display:

~~~bash
xhost +local:docker
~~~

Enter the Ledger development container:

~~~bash
sudo docker run --rm -ti \
  --privileged \
  -v "/dev/bus/usb:/dev/bus/usb" \
  -v "$(realpath .):/app" \
  --publish 5001:5001 \
  --publish 9999:9999 \
  -e DISPLAY="$DISPLAY" \
  -v "/tmp/.X11-unix:/tmp/.X11-unix" \
  ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest
~~~

### Build for Ledger Stax

Inside Docker:

~~~bash
cd /app
pip install -r requirements.txt
cargo ledger build stax
~~~

Run Ledger Stax:

~~~bash
speculos \
  --apdu-port 9999 \
  --api-port 5001 \
  --model stax \
  target/stax/release/stellar
~~~

### Build for Nano S Plus

Inside Docker:

~~~bash
cargo ledger build nanosplus
~~~

Run Nano S Plus:

~~~bash
speculos \
  --apdu-port 9999 \
  --api-port 5001 \
  --display headless \
  --model nanosp \
  target/nanosplus/release/stellar
~~~

The Speculos web interface is available at:

~~~text
http://localhost:5001
~~~

### Start the Aqua Ledger Bridge

In another terminal:

~~~bash
cd ~/aqua-money-streaming/ledger-bridge
npm install
npm start
~~~

The bridge listens locally at:

~~~text
http://127.0.0.1:5050
~~~

Check the bridge:

~~~bash
curl http://127.0.0.1:5050/health
curl http://127.0.0.1:5050/address
~~~

### Connect Aqua to Ledger

Keep these processes running:

1. Stellar Ledger app in Speculos
2. Aqua Ledger Bridge
3. Aqua frontend

Then:

1. Open `http://localhost:3000`.
2. Select **Connect Ledger**.
3. Confirm the displayed Stellar address.
4. Create, withdraw, or cancel a stream.
5. Review the request inside the simulated Ledger interface.
6. Approve the transaction.
7. Aqua submits it to Stellar Testnet.

### Blind Signing

Soroban contract calls may not be fully clear-signed by the current Stellar Ledger app.

For local Testnet testing:

1. Open the Stellar app settings in Speculos.
2. Enable **Blind Signing**.
3. Keep **Nested Authorization** enabled.
4. Only approve known Aqua Testnet transactions.

> Never use a Speculos seed, Blind Signing, or this local setup with real assets.

See [`ledger-bridge/README.md`](ledger-bridge/README.md) for additional information.

## 🧪 Testing

The contract tests cover:

- Token escrow
- Linear vesting calculations
- Partial withdrawals
- Prevention of double withdrawals
- Fair cancellation
- Amount and time validation
- Authorization requirements
- Registry updates

Run contract tests:

~~~bash
cargo test --workspace
~~~

Validate the frontend:

~~~bash
cd frontend
npm run lint
npm run build
~~~

Validate the Ledger Bridge:

~~~bash
cd ledger-bridge
npm ci
node --check server.cjs
~~~

## 🔄 CI/CD

GitHub Actions runs automatically on pushes and pull requests to `main`.

### Smart-contract job

- Rust formatting
- Clippy
- Contract tests
- Optimized WASM build

### Frontend job

- Dependency installation
- ESLint
- Next.js production build

The frontend is deployed to Vercel from the `frontend` directory.

## 📸 Screenshots

| Desktop | Mobile |
| --- | --- |
| ![Aqua desktop interface](screenshots/ui.png) | ![Aqua mobile interface](screenshots/mobile.png) |

### CI/CD pipeline

![Aqua GitHub Actions](screenshots/ci.png)

### Contract tests

![Aqua contract tests](screenshots/tests.png)

## 🛡️ Security Notes

- Aqua currently runs on Stellar Testnet.
- Testnet assets have no real-world value.
- The contracts have not received a professional security audit.
- The Ledger Bridge listens only on `127.0.0.1`.
- Private keys are never returned by Freighter or Ledger.
- Speculos does not provide hardware-wallet security.
- Blind Signing should only be used for known Testnet transactions.
- Mainnet deployment requires an independent security review.

## 🗺️ Roadmap

- Physical Ledger support through WebHID
- Improved Ledger clear-signing support
- Multi-token streams
- Recurring streams
- Batch salary streaming
- Stream metadata and labels
- Employer and recipient dashboards
- Anchor-powered on/off-ramp integration
- Mainnet security audit
- Mainnet deployment

## 📄 License

This project is available under the [MIT License](LICENSE).
