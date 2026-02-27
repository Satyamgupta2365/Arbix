<div align="center">

```
 █████╗ ██████╗ ██████╗ ██╗██╗  ██╗
██╔══██╗██╔══██╗██╔══██╗██║╚██╗██╔╝
███████║██████╔╝██████╔╝██║ ╚███╔╝ 
██╔══██║██╔══██╗██╔══██╗██║ ██╔██╗ 
██║  ██║██║  ██║██████╔╝██║██╔╝ ██╗
╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝
```

### **AI-Powered Real-Time Arbitrage Detection Engine for BNB Chain**

*5 Live Oracles · Bellman-Ford Graph Detection · XAI Decision Engine · 3 Solidity Contracts*

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Chain](https://img.shields.io/badge/Chain-BNB%20Smart%20Chain-yellow?style=for-the-badge&logo=binance)](https://bscscan.com)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python&logoColor=white)]()
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)]()
[![Hackathon](https://img.shields.io/badge/BNB%20Chain%20×%20YZi%20Labs-Hackathon%202025-F0B90B?style=for-the-badge)]()

> **Arbix** monitors price differences across 5 independent real-time oracle sources — including prices read directly from smart contracts on BSC — and uses a 7-stage AI pipeline to detect, score, and explain arbitrage opportunities with full on-chain execution capability via 3 purpose-built Solidity contracts.

[Architecture](#architecture) · [Oracles](#oracles) · [AI Engine](#ai-engine) · [Smart Contracts](#smart-contracts) · [Quick Start](#quick-start)

</div>

---

## What is Arbitrage?

The same token (e.g. BNB) trades at slightly different prices on different exchanges at the same moment. PancakeSwap might quote $612.18 while BiSwap quotes $609.07 — a 0.51% spread. Buy on BiSwap, sell on PancakeSwap, pocket the difference. This window lasts milliseconds and requires monitoring 100+ price pairs simultaneously. That's what Arbix does.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          5 REAL-TIME ORACLES                        │
│                                                                     │
│  Binance REST   CoinGecko REST   PancakeSwap    BiSwap      Pyth   │
│  (CEX prices)   (700+ exchgs)    (on-chain)    (on-chain)  (oracle)│
│       │               │              │              │          │    │
│       └───────────────┴──────────────┴──────────────┴──────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ parallel fetch every 5s
                               ▼
                    ┌─────────────────────┐
                    │    PRICE MATRIX     │  ← validates, filters zero prices
                    │  matrix[sym][src]   │  ← rejects DEX quotes >15% from Binance
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌────────────────┐
    │  ARBITRAGE   │  │   ANOMALY    │  │    SCORING     │
    │    GRAPH     │  │  DETECTOR    │  │    ENGINE      │
    │              │  │              │  │                │
    │ Bellman-Ford │  │ Z-score      │  │ 5-factor score │
    │ Direct arb   │  │ Source       │  │ Kelly criterion│
    │ Triangular   │  │ divergence   │  │ position size  │
    │ Cross-chain  │  │ Regime:      │  │                │
    └──────┬───────┘  │ CALM/VOLATILE│  └───────┬────────┘
           │          │ /DISLOCATION │          │
           └──────────┼──────────────┘          │
                      ▼                         │
               ┌──────────────┐                 │
               │  XAI ENGINE  │◀────────────────┘
               │              │
               │ Structured   │
               │ rationale    │
               │ per decision │
               └──────┬───────┘
                      ▼
              ┌────────────────┐
              │  AGENT LOOP    │  ← decides: EXECUTE or SKIP
              │  (5s cycles)   │  ← adapts thresholds to regime
              └──────┬─────────┘
                     ▼
            ┌─────────────────┐
            │ PORTFOLIO ENGINE │  ← real P&L: slippage + gas + decay
            │  (no randomness) │  ← won = (net_pnl > 0)
            └─────────────────┘
```

---

## Oracles

Arbix pulls prices from **5 fully independent sources** in parallel. Every DEX price is validated against Binance spot — quotes deviating more than 15% are rejected as low-liquidity noise.

| Oracle | Source | Method | What It Proves |
|---|---|---|---|
| **Binance** | `api.binance.com` | REST, 10/10 symbols | CEX reference price |
| **CoinGecko** | `api.coingecko.com` | REST, aggregated 700+ exchanges | Broad market consensus |
| **PancakeSwap** | BSC Mainnet | `eth_call getAmountsOut` on Router `0x10ED43C7...` | #1 BSC DEX, $17M USDT/BNB pool |
| **BiSwap** | BSC Mainnet | `eth_call getAmountsOut` on Router `0x3a6d8cA2...` | #2 BSC DEX, lower 0.1% fee |
| **Pyth / Jupiter** | Hermes API | Decentralized oracle, batched 4 feeds/req | Cross-chain price consensus |

**On-chain oracle detail**: The PancakeSwap and BiSwap oracles make real `eth_call` RPC calls to BSC (`bsc-dataseed1.binance.org`) calling `getAmountsOut(amountIn, [tokenAddress, USDT])` on each DEX router. No API key. No middleman. The price comes directly from the liquidity pool's reserve ratio on-chain.

```python
# Example: price of BNB from PancakeSwap — pure on-chain
calldata = encode_get_amounts_out(1 * 10**18, WBNB_ADDRESS, USDT_ADDRESS)
result = eth_call(PANCAKESWAP_ROUTER, calldata)
bnb_price = decode_uint256(result) / 1e18   # → $612.16
```

---

## AI Engine

7 modules form the intelligence pipeline:

### 1. Price Matrix (`engine/price_matrix.py`)
Maintains `matrix[symbol][source] = price_point`. Runs all 5 oracle fetches in parallel with `asyncio`. Filters `price <= 0` entries. Removes stale zero-price cache entries immediately.

### 2. Arbitrage Graph (`engine/arbitrage_graph.py`)
Uses **Bellman-Ford algorithm** (same as Dijkstra but handles negative cycles — ideal for arbitrage loop detection) to find:
- **Direct arb**: 1 coin, 2 sources, price difference
- **Triangular arb**: USDT→BNB→ETH→USDT on one DEX, detects if the triangle gives more USDT back
- **Cross-chain arb**: same coin on BSC vs Solana prices (via Pyth)

### 3. Scoring Engine (`engine/scoring.py`)
Each opportunity is rated on 5 factors:
1. **Spread strength** — how large is the price gap
2. **Profitability** — net profit after fees (0.25% PancakeSwap, 0.10% BiSwap, BSC gas ~$0.10)
3. **Source reliability** — Binance > CoinGecko > DEX (weighted by trust)
4. **Volume** — is there enough liquidity to fill the trade
5. **Data freshness** — how old is the price data

Position size = **Kelly Criterion**: `f* = (p*b - q) / b` where `p` = win probability, `b` = profit-to-loss ratio.

### 4. XAI Engine (`engine/xai.py`)
Explainable AI — every trade decision includes a structured natural-language rationale:
```json
{
  "action": "EXECUTE",
  "rationale": "BTC spread 2.01% between BiSwap ($64,583) and Binance ($65,878). Score: 0.847. Kelly size: $847. Net profit after 0.25% fee + $0.10 gas: $16.23.",
  "confidence": 0.847,
  "risks": ["BiSwap liquidity: $218K (moderate)", "BSC gas spike risk: low"]
}
```

### 5. Anomaly Detector (`engine/anomaly.py`)
- **Z-score spike detection**: price moves > 2 standard deviations flagged
- **Source divergence**: if two normally-correlated sources diverge > 2%, alert
- **Regime classification**: `CALM → RANGING → TRENDING → VOLATILE → DISLOCATION`
- The agent tightens/loosens thresholds based on current regime

### 6. Portfolio Engine (`engine/portfolio.py`)
Real deterministic P&L — zero randomness:
```python
gross_pnl    = position_size * net_profit_pct / 100
slippage     = position_size * 0.0005          # 5 basis points
gas_cost     = 0.10                             # BSC gas in USD
exec_decay   = position_size * 0.0002 * 2.0    # 2bps/sec × 2 sec delay
net_pnl      = gross_pnl - slippage - gas_cost - exec_decay
won          = (net_pnl > 0)                   # no random.random()
```

### 7. Agent (`engine/agent.py`)
Orchestrates the full loop every 5 seconds: `scan → detect → score → decide → execute`. Adapts `min_spread_pct` and `confidence_threshold` based on market regime in real time.

---

## Smart Contracts

Three Solidity contracts (BSC Mainnet-ready, awaiting deployment):

### `ArbixExecutor.sol` — The Trader
Flash-loan powered multi-DEX arbitrage executor supporting 4 BSC DEXes.

```
executeCrossDexArbitrage()   → Buy on BiSwap, sell on PancakeSwap in 1 tx
executeTriangularArbitrage() → USDT→BNB→ETH→USDT on one DEX
executeFlashArbitrage()      → Borrow $100K from PancakeSwap (no collateral),
                               arb, repay+fee — all in one atomic transaction.
                               If unprofitable → entire tx reverts. Max risk: $0.10 gas.
getBestPrice()               → Query all 4 DEXes, return best router + price
calculateArbitrageProfit()   → Simulate net profit before executing
```

**Safety**: circuit breaker (auto-pause on daily loss limit), `minProfitBps` guard, deadline protection, `onlyAgent` modifier locks execution to the AI backend wallet only.

### `ArbixPriceOracle.sol` — The Watcher
On-chain TWAP calculator + anomaly detector.

```
getPriceFromDex()     → Read price directly from PancakeSwap/BiSwap pool reserves
getAggregatedPrice()  → Median of 2 DEXes + spread in basis points
recordPrice()         → Store price point for TWAP history
getTWAP()             → Time-weighted average over configurable window (prevents manipulation)
```

Emits `AnomalyDetected` event on-chain when price deviates >5% from recent TWAP.

### `ArbixVault.sol` — The Bank
Capital management vault for depositors.

```
deposit()         → Deposit USDT/BNB into vault (1-hour lock)
withdraw()        → Withdraw principal + proportional profit share
fundExecutor()    → Send capital from vault to Executor for trading
collectProfits()  → Pull profits from Executor back to vault
```

Non-reentrancy guard, 10% performance fee (capped at 30%), emergency withdraw.

---

## Live API — What's Actually Working Right Now

```bash
# Real prices from all 5 oracles
GET /api/prices/matrix

# All pairwise spreads (hard-capped at 10% — no garbage data)
GET /api/prices/spreads

# Arbitrage opportunities detected this cycle
GET /api/arbitrage/opportunities

# AI agent status, regime, thresholds
GET /api/agent/status

# Recent trade decisions with XAI rationale
GET /api/agent/decisions?limit=10

# Smart contract info + DEX router addresses
GET /api/contracts

# LIVE: simulate arbitrage profit across 4 DEXes using real on-chain getAmountsOut
GET /api/contracts/simulate?token_in=USDT&token_out=WBNB&amount=1000

# Real liquidity pool reserves from PancakeSwap + BiSwap
GET /api/contracts/reserves/USDT/WBNB

# WebSocket: live price stream
WS /ws/prices

# WebSocket: live spread heatmap
WS /ws/spreads

# WebSocket: live agent decisions
WS /ws/agent
```

### Example — Live Arbitrage Simulation (real on-chain data):
```bash
curl 'http://localhost:8000/api/contracts/simulate?token_in=USDT&token_out=WBNB&amount=1000'

# Response:
{
  "dex_prices": {
    "pancakeswap": { "amount_out": 1.6297, "fee": "0.25%" },
    "biswap":      { "amount_out": 1.6233, "fee": "0.10%" },
    "babyswap":    { "amount_out": 1.6124, "fee": "0.30%" }
  },
  "best_buy": "babyswap",
  "best_sell": "pancakeswap",
  "spread_pct": 1.0723,
  "estimated_profit": 10.72,
  "profitable": true
}
```

---

## Quick Start

### Prerequisites
```
Python 3.10+
Node.js 18+
```

### Backend
```bash
cd Backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd Frontend
npm install
npm run dev -- --port 3001
```

Open [http://localhost:3001](http://localhost:3001)

### Environment (optional — Supabase for persistence)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Project Structure

```
Arbix/
├── Backend/
│   ├── main.py                 # FastAPI app, 20+ routes, 3 WebSocket endpoints
│   ├── oracles/
│   │   ├── binance.py          # Binance REST — 10/10 symbols
│   │   ├── coingecko.py        # CoinGecko REST — 30s cache, backoff on 429
│   │   ├── pancakeswap.py      # On-chain eth_call, Binance validation
│   │   ├── oneinch.py          # BiSwap on-chain eth_call, Binance validation
│   │   └── jupiter.py          # Pyth Network Hermes, batched 4/req, validated
│   └── engine/
│       ├── price_matrix.py     # Parallel oracle fetch, zero-price filtering
│       ├── arbitrage_graph.py  # Bellman-Ford, direct, triangular, cross-chain
│       ├── scoring.py          # 5-factor scoring, Kelly Criterion sizing
│       ├── xai.py              # Explainable AI rationale generation
│       ├── anomaly.py          # Z-score, divergence, regime classification
│       ├── portfolio.py        # Deterministic P&L, real cost breakdown
│       └── agent.py            # Main orchestration loop, adaptive thresholds
├── Frontend/
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── DashboardPage.jsx    # Live prices, agent status, portfolio
│       │   ├── CoinsPage.jsx        # Multi-source price comparison table
│       │   ├── AnalyticsPage.jsx    # Network Graph, spread heatmap
│       │   ├── AgentPage.jsx        # AI decisions, XAI rationale feed
│       │   ├── ContractsPage.jsx    # Smart contract explorer + simulator
│       │   └── SettingsPage.jsx
│       └── components/
│           ├── NetworkGraph.jsx     # SVG pentagon oracle visualization
│           ├── Sidebar.jsx
│           ├── AnimatedCounter.jsx
│           ├── LivePriceWidget.jsx
│           ├── NotificationToast.jsx
│           └── LandingCards.jsx
└── Contracts/
    ├── ArbixExecutor.sol       # Flash-loan multi-DEX arbitrage executor
    ├── ArbixPriceOracle.sol    # On-chain TWAP + anomaly detection
    └── ArbixVault.sol          # Capital management vault
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.10, FastAPI, asyncio, httpx |
| Frontend | React 18, Vite, React Router |
| Blockchain | Solidity 0.8.19, BSC Mainnet RPC |
| Oracle | Binance REST, CoinGecko REST, Pyth Hermes, BSC eth_call |
| Database | Supabase (PostgreSQL) |
| AI | Custom — Bellman-Ford, Kelly Criterion, Z-score, XAI |

---

## Hackathon Context

Built for **BNB Chain × YZi Labs Hackathon, Bengaluru 2025**.

**Theme alignment**: Real-time DeFi intelligence on BNB Chain. Every price comparison involves actual BSC on-chain data. The smart contracts are written specifically for the BNB Chain DEX ecosystem (PancakeSwap V2, BiSwap V2, THENA, BabySwap).

---

## License

MIT © Arbix Team

---

<div align="center">

*All prices shown are from real sources. No mocks, no simulated data. On-chain quotes read directly from BSC smart contracts.*

</div>
