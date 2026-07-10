# Aqua 🌊

**Real-time money streaming dApp on Stellar Soroban.**

Stream tokens per-second — salaries, subscriptions, and vesting — with live on-chain balance updates.

## Tech Stack
- **Smart Contracts:** Rust + Soroban SDK
- **Frontend:** Next.js + Tailwind + Stellar SDK
- **Wallet:** Freighter
- **Network:** Stellar Testnet

## Architecture
- `contracts/aqua` — stream manager (create / withdraw / cancel)
- `contracts/registry` — indexes streams per user (inter-contract calls)

## Status
🚧 Under active development — Vibecoding Level 3 submission.
