# Sentinel AI: Autonomous Due Diligence Agent

**"Don't invest first. Investigate first."**

Sentinel AI is an autonomous, agentic system built for the **Casper Agentic Buildathon**. It protects investors in the DeFi and RWA (Real World Assets) space by performing autonomous due diligence on projects before capital is deployed.

This project natively integrates the **Casper Builder Toolkit (cspr.build)** specifically designed for AI agents:
- **CSPR.click SKILL**: For seamless Casper Wallet authentication.
- **Odra Framework SKILL**: For writing robust, secure Smart Contracts (`Marketplace` and `Registry`).
- **CSPR.cloud MCP (Model Context Protocol)**: To allow the AI agent to index and fetch on-chain data APIs.
- **CSPR.trade MCP**: Used by the AI to fetch DEX trading and market liquidity data autonomously.
- **x402 Facilitator**: To seamlessly handle autonomous x402 micro-payments for premium intelligence.

## The Problem
When a user wants to invest in a new DeFi protocol or tokenized real-world asset, they need to verify audits, team backgrounds, liquidity, and physical assets. This takes hours. Sentinel AI automates this completely.

## The Solution
1. **Gather Free Data**: The agent scrapes standard open-source information.
2. **Evaluate Confidence**: The AI determines if it has enough data to make a reliable recommendation.
3. **Purchase Intelligence via x402**: If confidence is low, the agent uses its Casper Wallet to pay for premium data (e.g., Liquidity Analysis or Deed Check) via the Odra Marketplace Contract.
4. **Final Decision**: Synthesizes all gathered intelligence and saves an immutable record on the Casper Network.

---

## 🛠️ Comprehensive Installation & Setup Guide

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Casper Wallet](https://www.casperwallet.io/) browser extension

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sentinel-ai.git
cd sentinel-ai
```

### 2. Smart Contracts (Odra Framework) Setup
We use the Odra framework to compile the Casper smart contracts.
```bash
cd contracts
# Install the Odra cargo tool
cargo install cargo-odra

# Build the smart contracts
cargo build

# (Optional) Run tests
cargo test
```

### 3. Backend (Agent Orchestrator) Setup
The backend runs the ReAct LangChain agent that makes economic decisions.
```bash
cd backend

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Start the Agent Server
npm start
# Server runs on http://localhost:3001
```

### 4. Frontend (Next.js & cspr.click) Setup
The frontend provides the sleek user interface and real-time "Thinking Log".
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
# App runs on http://localhost:3000
```

---

## 🚀 Usage Guide

1. Open your browser and navigate to `http://localhost:3000`.
2. Click the **[Connect cspr.click]** button to authenticate with your Casper Wallet.
3. In the "Target Specification" panel, enter a project URL (e.g., `https://rwa-finance.xyz`).
4. Select the project type (`DeFi Protocol` or `Real World Asset`).
5. Click **INITIATE DUE DILIGENCE**.
6. Watch the **Live Agent Log** as the AI autonomously evaluates the project, decides it needs more info, and makes a Casper x402 payment to purchase premium intelligence.
7. Once finished, view the **Final Score** and the immutable on-chain record in the Investigation Report panel.

## ⚙️ Configuration

Before running the project, you must set up environment variables:

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your API keys

# Frontend
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your cspr.click App ID
```

> ⚠️ **Never commit `.env` files or private keys.** The `.gitignore` is pre-configured to exclude these.

For a complete list of all configuration variables and how to obtain API keys, see **[docs/configuration.md](docs/configuration.md)**.

## 🧪 Comprehensive Test Coverage

To ensure Sentinel AI is robust and production-ready, we have implemented tests across all three main components:

### Smart Contracts (Unit Tests)
Odra Framework unit tests validate the logic of the Marketplace and Registry.
```bash
cd contracts
cargo test
```

### Backend (Integration & API Tests)
Using `Jest` and `Supertest`, we validate the Agent's decision loop, ensuring it correctly decides to buy "Liquidity Checks" for DeFi, and "Deed Checks" for RWA.
```bash
cd backend
npm run test
```

### Frontend (Component & E2E Tests)
Using `@testing-library/react` and `jest`, we ensure the UI components (Project Input, cspr.click Wallet Connect, Live Thinking Log) render and react to user interactions correctly.
```bash
cd frontend
npm run test
```

## Architecture
See the `docs/architecture.md` file for an in-depth look at how the Agent, Odra Contracts, and Casper Toolkits interact.
