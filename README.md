<div align="center">

<img src="Frontend/public/cyber-trading-orb.png" width="120" alt="Arbix Logo" />

# A R B I X

### 🏆 AI-Powered Real-Time Arbitrage Detection Engine for BNB Chain

*Autonomous AI Agent · 5 Live Oracles · 7-Model ML Ensemble · Bellman-Ford Graph Detection · XAI Explainability · 3 On-Chain Contracts*

<br/>

[![BNB Chain](https://img.shields.io/badge/🔶_BNB_Chain_%C3%97_YZi_Labs-Hackathon_2026-F0B90B?style=for-the-badge)](https://www.bnbchain.org)
[![Deployed](https://img.shields.io/badge/✅_BSC_Testnet-LIVE-00C853?style=for-the-badge)](https://testnet.bscscan.com/address/0x2df9e83a350027991170ab82a83FBD1836d76d3B)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)]()
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)]()
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?style=for-the-badge&logo=solidity&logoColor=white)]()

<br/>

**10,600+ lines of code** · **17 Python modules** · **18 React components** · **3 Solidity contracts** · **30+ API endpoints** · **3 WebSocket streams**

</div>

---

> **Arbix** is an autonomous AI agent that monitors price differences across 5 independent real-time oracle sources — including prices read directly from smart contracts on BSC — scores opportunities with a 7-model ML ensemble, explains every decision via XAI, and executes on-chain via 3 purpose-built Solidity contracts. Fully open-source. Zero external ML libraries. Every algorithm coded from scratch.

---

## 📚 Documentation
This repository has been structured for the **BNB Chain Hackathon** to make evaluation straightforward.

### 📝 Read the Full Project Overview
A complete breakdown of the Problem, Solution, 5 Core Features, and Impact.
👉 **[Read `docs/PROJECT.md`](docs/PROJECT.md)**

### ⚙️ Architecture, Setup, & Demo Walkthrough
Details on our Bellman-Ford Negative Cycle engine, ML sub-models, local setup instructions, and what judges should specifically look for in the live dashboard demo.
👉 **[Read `docs/TECHNICAL.md`](docs/TECHNICAL.md)**

### ⛓️ Deployed Smart Contract Addresses
All on-chain contracts are mapped directly at the root level for easy explorer links.
👉 **[Read `bsc.address`](bsc.address)**

### 🎥 Pitch & Video Links
Demo and presentation deck links mapped in the `docs` folder.
👉 **[View `docs/EXTRAS.md`](docs/EXTRAS.md)**

---

## 📁 Repository Structure

```
/README.md
/bsc.address              ← Live testing endpoints and contract addresses
/docs/
    PROJECT.md            ← Problem, solution, business, limitations
    TECHNICAL.md          ← Architecture, setup, demo guide
    EXTRAS.md             ← Demo video & presentation links
/Frontend/                ← React 18, Vite 
/Backend/                 ← Python 3.11, FastAPI
/Contracts/               ← Solidity 0.8.19, Hardhat
```

*Note: As per our Vercel and Render deployment configurations, our source code exists in `Frontend/` and `Backend/` directly at the root, instead of grouped under a unified `/src/` folder. Please look inside those respective folders to review the codebase.*

---

## 🏗️ Built For

<div align="center">

**BNB Chain × YZi Labs Hackathon, Bengaluru 2026**

*DeFi Infrastructure Track*

Every price comparison uses actual BSC on-chain data. The smart contracts are written specifically for the BNB Chain DEX ecosystem. The ML ensemble and realistic cost model reflect production-grade quant architecture — not a hackathon toy.

<br/>

⭐ **Star this repo** if you think DeFi should be transparent.

</div>
