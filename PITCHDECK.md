# Arbix — Pitch Deck Content
## AI-Powered Real-Time Arbitrage Detection Engine for BNB Chain

---

## 🎯 SLIDE 1: THE PROBLEM

**Price inefficiencies exist across DEXes every second.**

- The same token trades at different prices on PancakeSwap, BiSwap, THENA, and BabySwap — simultaneously
- These windows last milliseconds and span 100+ price pairs
- Manual traders can't detect them. Bots with single-source data miss them.
- **$2.3B+ in MEV extracted on EVM chains in 2025** — most goes to sophisticated actors, not regular users

---

## 🚀 SLIDE 2: THE SOLUTION — ARBIX

**An autonomous AI agent that monitors 5 live oracle sources in parallel, detects arbitrage using graph algorithms, scores opportunities with a 7-model ML ensemble, and executes on-chain via purpose-built smart contracts.**

> "From price feed to trade execution in under 3 seconds."

---

## ⭐ SLIDE 3: 5 CORE FEATURES

### 1. 🔮 5-Oracle Real-Time Price Intelligence
- **Binance REST** — centralized exchange baseline (10 symbols, sub-second)
- **CoinGecko** — aggregated across 700+ exchanges
- **PancakeSwap on-chain** — direct `eth_call` to BSC pool reserves (no API middleman)
- **1inch/BiSwap on-chain** — second DEX price via `getReserves()` with Binance validation
- **Pyth/Jupiter** — cross-chain oracle (Solana prices for cross-chain arb detection)
- All fetched in **parallel every 5 seconds**, validated, zero-price filtered

### 2. 🧠 7-Model ML Ensemble (No External Libraries)
Pure Python implementations — no sklearn, no torch, no faking:
- **Bayesian Confidence Calibration** — self-correcting accuracy via Beta distribution priors
- **EMA Crossover Signals** — short/long exponential moving average trend detection
- **Ornstein-Uhlenbeck Half-Life** — mean-reversion speed estimation (how fast does a spread close?)
- **Mean-Reversion Probability** — ADF-inspired stationarity testing
- **Source Consensus Weighting** — multi-oracle agreement analysis
- **Volatility-Adjusted Scoring** — regime-aware confidence (lower confidence during DISLOCATION)
- **Weighted Ensemble** — combines all 6 sub-models into final confidence + risk score

### 3. 📐 Bellman-Ford Arbitrage Graph Detection
- Builds a **weighted directed graph** of all token pairs across all sources
- Runs **Bellman-Ford negative cycle detection** — finds profitable loops in O(V·E)
- Detects 3 types:
  - **Direct arbitrage** — same pair, different DEX (BNB on PancakeSwap vs BiSwap)
  - **Triangular arbitrage** — 3-hop cycles within a single DEX (USDT→BNB→ETH→USDT)
  - **Cross-chain arbitrage** — BSC vs Solana price differences via bridge
- Real fee model: swap fees (0.1%-0.3%), gas ($0.002-$0.05), bridge costs, slippage

### 4. 🧩 XAI Explainable Decision Engine
Every trade decision includes a full **Explainability Matrix**:
- Path breakdown with buy/sell sources and prices
- Fee decomposition (swap fee, gas, bridge cost per leg)
- ML sub-model scores (which models agreed/disagreed)
- Risk factors (volatility, liquidity depth, time decay)
- Human-readable rationale: *"Buy BNB on BiSwap at $609.07, sell on PancakeSwap at $612.18. Spread: 0.51%. Net after fees: 0.11%. Confidence: 72%. 5 of 7 models agree."*
- **Full auditability** — every decision is logged and reviewable in the UI

### 5. ⚡ 3 Purpose-Built Smart Contracts on BSC
All deployed and live on BSC Testnet with successful transactions:

| Contract | What It Does |
|---|---|
| **ArbixPriceOracle** | On-chain TWAP calculator + anomaly detector. Reads DEX reserves directly. Emits `AnomalyDetected` events when price deviates >5% from TWAP. |
| **ArbixExecutor** | Flash-loan powered multi-DEX arbitrage executor. Supports PancakeSwap V2, BiSwap, THENA, BabySwap. Circuit breaker, min profit guard, daily loss limit. |
| **ArbixVault** | Capital management vault for depositors. Deposit/withdraw with profit-sharing. 10% performance fee (capped at 30%). Lock period + emergency withdraw. |

---

## 🛠️ SLIDE 4: TECH STACK

| Layer | Technology | Why |
|---|---|---|
| **Backend** | Python 3.11, FastAPI, asyncio, httpx | Async-first for parallel oracle fetching |
| **Frontend** | React 18, Vite, Framer Motion | Real-time WebSocket updates, 9-page dashboard |
| **Blockchain** | Solidity 0.8.19, Hardhat, BSC Testnet | Native BNB Chain integration |
| **Oracles** | Binance REST, CoinGecko, Pyth Hermes, BSC eth_call | 5 independent price sources for validation |
| **AI/ML** | Custom 7-model ensemble (pure Python) | No external ML deps — fully transparent algorithms |
| **Database** | Supabase (PostgreSQL) | Real-time persistence for trade history |
| **Detection** | Bellman-Ford graph algorithm | Mathematically optimal negative cycle detection |
| **Smart Contracts** | PancakeSwap V2, BiSwap V2, THENA, BabySwap | 4 DEX integrations for maximum coverage |

**Key Technical Differentiators:**
- 0 external ML libraries — every algorithm implemented from scratch in pure Python
- On-chain price reads via direct `eth_call` (no API middlemen)
- Sub-3-second detection-to-decision pipeline
- 30+ API endpoints, 3 WebSocket streams, 10+ real-time charts

---

## 🏆 SLIDE 5: WHY CHOOSE ARBIX?

### vs. Existing Arbitrage Bots
| Feature | Typical Bots | Arbix |
|---|---|---|
| Price sources | 1-2 APIs | **5 live oracles** (including on-chain reads) |
| Scoring | Simple threshold | **7-model ML ensemble** with Bayesian calibration |
| Explainability | None (black box) | **Full XAI rationale** for every decision |
| Detection | Pair-by-pair | **Graph-based** (Bellman-Ford finds ALL profitable cycles) |
| Safety | Basic stop-loss | **Circuit breaker + anomaly detection + regime classifier** |
| On-chain | Swap via router | **Custom contracts** (Oracle + Executor + Vault) |
| UI | Terminal/logs | **9-page React dashboard** with real-time WebSockets |

### Why Us?
1. **Not a toy** — realistic cost model (spread decay, slippage, gas) means reported PnL reflects real-world outcomes
2. **Fully transparent** — XAI engine explains every decision; no black-box trading
3. **Built for BNB Chain** — contracts integrate PancakeSwap, BiSwap, THENA, BabySwap natively
4. **Open source** — MIT license, every line of code viewable
5. **Production architecture** — the same patterns used by professional quant desks (Bayesian calibration, OU half-life, Kelly Criterion sizing)

### Traction (Live Demo Stats)
- **63.6% win rate** across 11 paper trades (with realistic 35% spread decay + noise)
- **13.88 Sharpe ratio** on profitable opportunity detection
- **140-160 opportunities scanned per 5-second cycle**
- **5 oracles validated against each other** (reject divergent prices)
- **3 smart contracts deployed with 10 on-chain transactions**

---

## 📍 SLIDE 6: ROADMAP

### Phase 1 — Hackathon (Now) ✅
- 5 oracle sources, 7-model ML, Bellman-Ford detection, XAI decisions
- 3 contracts deployed on BSC Testnet
- 9-page React UI with real-time WebSockets

### Phase 2 — Testnet Validation (Q2 2026)
- End-to-end on-chain execution via ArbixExecutor
- Vault deposit/withdraw with real tokens
- PancakeSwap V3 concentrated liquidity integration

### Phase 3 — Mainnet Launch (Q3 2026)
- BSC Mainnet deployment with audited contracts
- opBNB L2 integration for reduced gas
- MEV protection (Flashbots-style bundling)
- Public vault for community depositors

### Phase 4 — Scale (Q4 2026)
- Cross-chain: BSC ↔ Ethereum ↔ Solana
- DAO governance for vault parameters
- Mobile app + API for institutional traders
- **Revenue: 10% performance fee on vault profits (capped at 30%)**

---

## 🔗 SLIDE 7: LINKS

| Resource | Link |
|---|---|
| **GitHub** | github.com/Satyamgupta2365/Arbix |
| **Demo** | localhost:3000 (or deployed URL) |
| **ArbixPriceOracle** | [BSCScan ↗](https://testnet.bscscan.com/address/0x73764D77B6736a2643Ea6fB773AeBb79FaFc7a83) |
| **ArbixExecutor** | [BSCScan ↗](https://testnet.bscscan.com/address/0x2df9e83a350027991170ab82a83FBD1836d76d3B) |
| **ArbixVault** | [BSCScan ↗](https://testnet.bscscan.com/address/0xde18515788bd4bE6FA3C09AFd7957E1A47aEc307) |
| **License** | MIT (fully open source) |

---

*Built for BNB Chain × YZi Labs Hackathon, Bengaluru 2026*
*Team Arbix — DeFi Infrastructure Track*
