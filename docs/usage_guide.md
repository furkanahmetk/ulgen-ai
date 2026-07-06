# 📖 Sentinel AI — Usage Guide

Sentinel AI is an autonomous AI agent running on the Casper Network that analyzes DeFi projects and RWA (Real World Asset) tokens to produce comprehensive due diligence reports.

---

## 🏗️ Architecture Overview

```
User → Frontend (Next.js, port 3000)
          ↓
       Backend (Express, port 3001)
          ↓
  ┌─────────────────────────────────┐
  │   Sentinel AI ReAct Agent       │
  │  1. CSPR.trade MCP              │ ← Market / Liquidity data
  │  2. Casper MCP Server           │ ← On-chain data
  │  3. CSPR.cloud REST API         │ ← Account & transaction history
  │  4. Google Gemini AI            │ ← AI reasoning & decision
  │  5. x402 Facilitator            │ ← Micro-payment for premium data
  └─────────────────────────────────┘
          ↓
  Odra Smart Contracts (Casper Testnet)
  - Marketplace (upgradeable)
  - InvestigationRegistry (upgradeable)
```

---

## 🚀 Installation & Quick Start

### Prerequisites
- Node.js >= 18
- Rust + `wasm32-unknown-unknown` toolchain (for contract compilation)
- A funded Casper Testnet wallet

### 1. Clone the Repository
```bash
git clone https://github.com/username/sentinel-ai
cd sentinel-ai
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env     # Fill in your API keys
npm run build
npm start                # Runs on http://localhost:3001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev              # Runs on http://localhost:3000
```

### 4. Smart Contract Deployment (Optional)
```bash
cd contracts

# Compile contracts to WASM
ODRA_MODULE=Marketplace cargo build --release \
  --target wasm32-unknown-unknown \
  --bin sentinel_contracts_build_contract

cp target/wasm32-unknown-unknown/release/sentinel_contracts_build_contract.wasm wasm/Marketplace.wasm

# Deploy to Testnet as upgradeable contracts
cargo run --bin deploy
```

---

## 🔧 Environment Variables (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend port | `3001` |
| `GOOGLE_API_KEY` | Google Gemini AI API key | `your_google_key` |
| `CSPR_CLOUD_API_KEY` | CSPR.cloud API key | `your_cspr_key` |
| `CASPER_MCP_URL` | Casper MCP endpoint | `https://mcp.testnet.cspr.cloud/mcp` |
| `CSPR_TRADE_MCP_URL` | CSPR.trade MCP endpoint | `https://mcp.cspr.trade/mcp` |
| `X402_FACILITATOR_URL` | x402 payment facilitator | `https://x402-facilitator.cspr.cloud` |
| `CASPER_NODE_URL` | Casper RPC node URL | `https://node.testnet.casper.network/rpc` |
| `MARKETPLACE_CONTRACT_HASH` | Deployed Marketplace hash | `hash-e3ec7d5...` |
| `REGISTRY_CONTRACT_HASH` | Deployed Registry hash | `hash-dbe7911...` |
| `AGENT_SECRET_KEY_PATH` | Agent wallet PEM file path | `./keys/secret_key.pem` |

---

## 🔌 API Reference

### `GET /api/health`
Returns the current system status and component connectivity.

**Response:**
```json
{
  "status": "ok",
  "service": "Sentinel AI Backend",
  "toolkit": "Casper AI Toolkit",
  "components": {
    "llm": "Gemini (connected)",
    "casperMCP": "https://mcp.testnet.cspr.cloud/mcp",
    "csprTradeMCP": "https://mcp.cspr.trade/mcp",
    "x402Facilitator": "https://x402-facilitator.cspr.cloud",
    "csprCloudREST": "https://api.testnet.cspr.cloud"
  }
}
```

---

### `POST /api/investigate`
The main analysis endpoint. Runs a full autonomous due diligence investigation on a given Casper account, contract hash, or project URL.

**Request Body:**
```json
{
  "url": "0163d8a06bab82776ec0fa0b38f1306e4e6a944468609adf5c0f8f5ad592ef5d63",
  "type": "DeFi"
}
```

**`type` values:**
| Value | Description |
|-------|-------------|
| `DeFi` | Liquidity, rug-pull risk, and protocol analysis |
| `RWA` | Real-world asset deed verification |
| `NFT` | NFT collection authenticity analysis |

**Response:**
```json
{
  "logs": [
    "🔍 Agent: Starting autonomous investigation...",
    "✅ Agent: Account info retrieved via CSPR.cloud REST API",
    "💰 Agent: x402 payment of 0.02 CSPR processed",
    "✅ Agent: Investigation complete. Score: 75/100"
  ],
  "result": {
    "score": 75,
    "recommendation": "INVEST | CAUTION | AVOID",
    "reasoning": "Based on on-chain data analysis...",
    "findings": ["Verified account", "Low liquidity"],
    "spent": 0.02,
    "toolsUsed": [
      "Casper MCP Server (Testnet)",
      "CSPR.trade MCP (Public)",
      "CSPR.cloud REST API",
      "Google Gemini AI",
      "x402 Facilitator (Micro-payments)"
    ],
    "details": {
      "accountInfo": { "balance": "...", "public_key": "..." },
      "liquidityAnalyzed": true
    }
  }
}
```

---

### `GET /api/tokens`
Returns the list of available tokens on CSPR.trade.

---

### `GET /api/x402/supported`
Lists payment methods supported by the x402 Facilitator.

---

## 💡 Usage Examples

### Example 1: Investigate a DeFi Account
```bash
curl -X POST http://localhost:3001/api/investigate \
  -H "Content-Type: application/json" \
  -d '{
    "url": "0163d8a06bab82776ec0fa0b38f1306e4e6a944468609adf5c0f8f5ad592ef5d63",
    "type": "DeFi"
  }'
```

### Example 2: Verify an RWA Token
```bash
curl -X POST http://localhost:3001/api/investigate \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://realestate-project.io",
    "type": "RWA"
  }'
```

### Example 3: Health Check
```bash
curl http://localhost:3001/api/health
```

---

## 🧠 Agent Logic

Sentinel AI follows a **ReAct** (Reason + Act) loop:

1. **OBSERVE** — Collects free data via CSPR.trade MCP, Casper MCP, and CSPR.cloud REST
2. **THINK** — Analyzes collected data using Gemini AI; calculates a confidence score
3. **ACT** — If confidence < 80, autonomously purchases premium intelligence via x402 micropayment
4. **REPORT** — Synthesizes all gathered data into a final due diligence report

---

## ⛓️ Smart Contracts (Casper Testnet)

| Contract | Package Hash |
|----------|-------------|
| **Marketplace** | `hash-e3ec7d595fb6ce93e74cefb97e7996ad517311104693f0d4a85401adedf318fd` |
| **InvestigationRegistry** | `hash-dbe7911c5d1885d8663973753bd3d427b4e3c57f41d47b195075d2224843c918` |

Both contracts are deployed as **upgradeable** — new versions can be published under the same package hash without changing the contract address.

---

## 🔑 Wallet Setup

```bash
cd backend

# Generate a new key pair
node scripts/generateKeys.js

# Fund your wallet from the Casper Testnet faucet:
# https://testnet.cspr.live/tools/faucet
# Use the address from public_key.hex
```

---

## 🛠️ Developer Notes

### Upgrading a Contract
```bash
cd contracts
# After writing new contract code, recompile and redeploy.
# The same package hash is preserved; only a new version is appended.
cargo run --bin deploy
```

### MCP SSE Compatibility
The Casper MCP Server and CSPR.trade MCP require SSE (Server-Sent Events) format. For the current `fetch`-based client, ensure the Accept header is set correctly:
```
Accept: application/json, text/event-stream
```

### Gemini Quota Management
The free tier has a limited daily request quota. You can use a paid plan or switch to an alternative LLM (Groq, Ollama):
```env
# Groq alternative
GROQ_API_KEY=gsk_...
```
