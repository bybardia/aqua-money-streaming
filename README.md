# 💧 Aqua — Real-Time Money Streaming on Stellar

> Programmable, per-second money streams on Stellar Soroban. The streaming core of **FlowBridge** — a vision for programmable cross-border payroll.

[![Live Demo](https://img.shields.io/badge/demo-live-06b6d4)](https://aqua-money-streaming.vercel.app/)
[![Network](https://img.shields.io/badge/network-Stellar%20Testnet-8b5cf6)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/smart%20contracts-Soroban-000)](https://soroban.stellar.org)

- 🌐 **Live app:** https://aqua-money-streaming.vercel.app/
- 🎥 **Demo video:** https://youtu.be/uRWHOTKqXbw
- 📦 **Repo:** https://github.com/bybardia/aqua-money-streaming

---

## ⚠️ Honest disclosure (please read)

Aqua is a **Testnet** project built for learning and demonstration. To avoid any confusion:

- Everything runs on **Stellar Testnet**. All balances are **test assets with no real-world value**.
- Hardware-wallet signing is demonstrated with a **simulated Ledger Stax** running in the **Speculos** emulator — **not a physical device**.
- Ledger signing uses **Blind Signing**. Aqua does **not** claim Clear Signing, a hardware Secure Element, or any "agent kit" security.
- Aqua stores **no private keys** and collects **no KYC / personal data**.

---

## What is Aqua?

Instead of paying someone in one lump sum, Aqua lets money **flow continuously, second by second**, from a sender to a recipient. It's a better primitive for:

- 💼 Salaries & payroll
- 🔁 Subscriptions
- 🎓 Grants & vesting

### How it works

1. **Fund a stream** — a sender locks an amount of a Stellar asset into the Aqua contract with a start time and stop time.
2. **Money vests per second** — the recipient's withdrawable balance grows continuously between start and stop.
3. **Withdraw anytime** — the recipient pulls their vested balance whenever they want.
4. **Cancel fairly** — if the sender cancels, the recipient keeps everything vested so far and the sender is refunded the rest.

---

## 🌉 The bigger vision: FlowBridge

Aqua is the streaming engine of a larger idea — **FlowBridge: programmable cross-border payroll on Stellar**.

- Employers fund payroll in a stable asset.
- Remote workers earn continuously via Aqua streams.
- Eligible users cash out to local currency through Stellar **anchors** (SEP-24).

The payroll orchestration (multi-contract factory/treasury/access-control), anchor/fiat off-ramp, and mainnet deployment are on the roadmap for later stages. **Aqua (this repo) delivers the working streaming core on Testnet today.**

---

## 🏗️ Architecture

```
aqua-money-streaming/
├── contracts/
│   ├── aqua/          # Core money-streaming Soroban contract (Rust)
│   └── registry/      # Stream registry contract
├── frontend/          # Next.js (App Router) dApp
│   ├── app/
│   │   ├── page.tsx        # Landing page (hero + live stats + CTA)
│   │   ├── app/            # The dApp: create streams
│   │   ├── streams/        # Explorer: browse all streams
│   │   ├── about/          # How it works + disclosure
│   │   ├── feedback/       # Wallet-gated feedback + public feed
│   │   └── api/feedback/   # Feedback storage endpoint
│   ├── components/         # Navbar, Dashboard, Stats, StreamList
│   └── lib/                # wallet, contract calls, config, ledger bridge
└── ledger-bridge/     # Local bridge to Speculos (simulated Ledger)
```

### Tech stack

| Layer | Tech |
|---|---|
| Smart contracts | Rust + Soroban SDK |
| Frontend | Next.js (App Router), React 19, Tailwind CSS v4 |
| Chain access | `@stellar/stellar-sdk` |
| Wallets | Freighter (`@stellar/freighter-api`), Ledger via Speculos |
| Monitoring | Vercel Analytics + Speed Insights, Sentry |
| Hosting | Vercel |

---

## 📜 Deployed contracts (Stellar Testnet)

| Contract | Address |
|---|---|
| Aqua (streaming) | `CAYCGEXSUJ2SYV5L3OQ52UOCWGNZ7XK6H7ODXAURYCLAE3HPS4SJZUFG` |
| Registry | `CCVABJMB3KN3DVTVJY5FCS5YXMXJKFQYCIRHRRJPQBTFWEDMNFA6P5HV` |
| Native token (XLM) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

- **RPC:** `https://soroban-testnet.stellar.org`
- **Network passphrase:** `Test SDF Network ; September 2015`

### Core contract functions

| Function | Description |
|---|---|
| `create_stream(sender, recipient, token, amount, start_time, stop_time) -> u64` | Open a new stream, returns stream id |
| `withdraw(stream_id)` | Recipient withdraws vested balance (auth: recipient) |
| `cancel_stream(stream_id)` | Sender cancels, splitting funds fairly (auth: sender) |
| `get_stream(stream_id)` | Read a stream's state |
| `stream_count()` | Total number of streams |
| `balance(...)` | Vested/withdrawable balance |
| `initialize(...)` | One-time contract setup |

---

## 🚀 Local development

### Prerequisites

- Node.js 20+
- Rust + `stellar` CLI (for contracts)
- A [Freighter](https://freighter.app) wallet on Testnet

### 1. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run dev
```

Open http://localhost:3000

### 2. Environment variables (`frontend/.env.local`)

```bash
# Feedback storage (Google Apps Script web app URL)
FEEDBACK_SHEET_URL=https://script.google.com/macros/s/XXXX/exec

# Optional: local Ledger bridge (Speculos)
NEXT_PUBLIC_LEDGER_BRIDGE_URL=http://127.0.0.1:5050
```

> On Vercel, add the same variables under **Settings → Environments → Production**. `SENTRY_AUTH_TOKEN` is also required there for source-map upload at build time.

### 3. (Optional) Simulated Ledger via Speculos

Aqua can sign with a **simulated** Ledger Stax running in Speculos, bridged by a small local server.

```bash
# Terminal 1 — Speculos (Docker)
# (see docs; runs the Stellar app on a simulated Stax at api port 5001)

# Terminal 2 — bridge
cd ledger-bridge
npm start        # express server on 127.0.0.1:5050

# Terminal 3 — frontend
cd frontend
npm run dev
```

---

## ✨ Features

- ⏱️ **Per-second streaming** — balances vest live in the UI.
- 👛 **Two wallets** — Freighter (browser) and a simulated Ledger (Speculos).
- 🔎 **Explorer** — browse every stream on the contract.
- 📊 **Live stats** — total streams and volume, auto-refreshing.
- 💬 **Wallet-gated feedback** — only connected wallets can post; feedback is public and tied to its wallet.
- 🧯 **Resilient UX** — loading, error, and empty states across all routes.
- 📱 **Responsive** — works on mobile with a collapsible nav.
- 📈 **Monitoring** — Vercel Analytics + Sentry error tracking.

---

## 🗺️ Roadmap

- [x] Core money-streaming contract on Testnet
- [x] Multi-page dApp (create, explore, about, feedback)
- [x] Freighter + simulated Ledger signing
- [x] Analytics + error monitoring
- [ ] Multi-contract payroll orchestration (Factory / Treasury / Access-Control)
- [ ] Anchor / SEP-24 fiat off-ramp (FlowBridge)
- [ ] Mainnet deployment with licensed anchors & real KYC

---

## 🙏 Feedback

Tried Aqua on Testnet? Connect your wallet and leave feedback at **/feedback** on the live app. Every review is public and tied to the wallet that submitted it.

---

## 📄 License

MIT — for educational / demonstration use on Stellar Testnet.
