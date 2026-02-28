# Arbix — Product Overview 

## 🎯 The Problem

**$2.3 billion** in MEV was extracted on EVM chains in 2025 — almost all of it by sophisticated actors running closed-source bots.

The same token trades at different prices on PancakeSwap, BiSwap, THENA, and BabySwap **simultaneously**. These arbitrage windows last milliseconds, span 100+ price pairs, and are invisible to manual traders. Single-source bots miss them too — they can't cross-validate prices across oracles.

Additionally, arbitrage on BNB Chain is broken in three ways:

| Problem | Reality |
|---|---|
| **Simple bots miss 70% of opportunities** | Rule-based bots only check 1–2 DEXes. THENA and BabySwap spreads go unnoticed. |
| **Bots can't say WHY they traded** | No institution can deploy a black-box system. Regulators and auditors need rationale. |
| **Capital requirement kills small players** | Most arb requires upfront capital. Small traders get priced out. |


## 💡 The Solution: Arbix

**Arbix is the first AI-native autonomous arbitrage engine on BNB Chain — combining real-time multi-DEX price discovery, Bellman-Ford graph pathfinding, and explainable ML scoring with zero-capital flash loan execution and institutional-grade risk controls.**

It levels the playing field for everyone on BNB Chain by building an open, transparent, AI-powered system that detects inefficiencies in real-time, explains every decision, and executes on-chain.

## ⭐ 5 Core Features

### 1. 🔮 5-Oracle Real-Time Price Intelligence
Not 1 API. Not 2. **Five fully independent price sources** — including direct on-chain reads from BSC smart contracts fetched **in parallel every 5 seconds**. DEX prices that deviate >15% from Binance are auto-rejected as low-liquidity noise.

### 2. 🧠 7-Model ML Ensemble — Zero External Libraries
Every model coded from scratch in pure Python. No sklearn. No PyTorch. **937 lines of hand-written ML**. ~70% of apparent opportunities are **rejected** by the ML engine as too risky. Only high-confidence, low-risk opportunities pass.

### 3. 📐 Bellman-Ford Arbitrage Graph Engine
We build a **full weighted directed graph** of every token × every source and run **Bellman-Ford negative cycle detection** to find profitable loops. Detects direct, triangular, and cross-source arbitrage while factoring in real transaction and gas fees.

### 4. 🧩 XAI — Every Decision Is Explainable
**No black boxes.** Every trade decision generates a structured JSON Explanatory Matrix. Every decision is **logged, timestamped, and viewable in the dashboard**. 

### 5. ⚡ 3 Purpose-Built Smart Contracts — Live on BSC Testnet
Not just ERC-20 tokens. **987 lines of production Solidity** implementing a complete on-chain trading infrastructure. Integrates natively with **PancakeSwap V2, BiSwap V2, THENA, and BabySwap** routers.


## 📊 Impact & Live Results

### Paper Trading Performance (Realistic Model)

| Metric | Value | Notes |
|---|---|---|
| **Win Rate** | ~63.6% | Not 100% — spread decay + noise creates real losses |
| **Sharpe Ratio** | ~13.88 | Consistent small wins with bounded variance |
| **Spread Capture** | 35% of detected | MEV, latency, slippage erode ~65% of theoretical profit |
| **Cost Per Trade** | ~$0.67 | 15bps slippage + $0.25 gas + 8bps/sec execution decay |
| **Oracles Online** | 5/5 | All sources validated against each other in real-time |

The losing trades come from Gaussian execution noise (σ=35%) pushing net P&L below zero after costs — **exactly what happens in real DeFi trading**.

## 🗺️ Roadmap

### Phase 1 — Hackathon (Current) ✅
- [x] 5 oracle sources with real-time validation & cross-checking
- [x] 7-model ML ensemble (937 lines, zero external dependencies)
- [x] Bellman-Ford graph detection: direct, triangular, cross-chain arbitrage
- [x] XAI explainable decision engine — full rationale per trade
- [x] 3 smart contracts deployed on BSC Testnet (10 on-chain transactions)
- [x] 9-page React dashboard with 3 real-time WebSocket streams

### Phase 2 — Testnet Validation (Q2 2026)
- [ ] End-to-end on-chain execution via ArbixExecutor with real tokens
- [ ] Vault deposit/withdraw flow (USDT/BNB)
- [ ] PancakeSwap V3 concentrated liquidity integration
- [ ] Contract verification + automated test suite

### Phase 3 — Mainnet Launch (Q3 2026)
- [ ] BSC Mainnet deployment with audited contracts
- [ ] opBNB L2 integration for sub-cent gas costs
- [ ] MEV protection via Flashbots-style bundling
- [ ] Public vault launch for community depositors

### Phase 4 — Scale (Q4 2026)
- [ ] Cross-chain: BSC ↔ Ethereum ↔ Solana bridge arbitrage
- [ ] DAO governance for vault parameters & fee structure
- [ ] Mobile app with push notifications
- [ ] API tier for institutional traders
