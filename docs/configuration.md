# Sentinel AI - Environment & Configuration Guide

This document explains how to configure Sentinel AI for development and production use.

## Quick Start

### 1. Backend Configuration

```bash
cd backend
cp .env.example .env
```

Open `.env` and configure the following:

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Server port (default: `3001`) |
| `CASPER_NODE_URL` | Yes | Casper RPC endpoint |
| `CASPER_CHAIN_NAME` | Yes | `casper-test` (testnet) or `casper` (mainnet) |
| `CSPR_CLOUD_API_KEY` | Yes | API key from [cspr.cloud](https://cspr.cloud) |
| `CSPR_TRADE_API_KEY` | Yes | API key from [cspr.trade](https://cspr.trade) |
| `X402_FACILITATOR_URL` | Yes | x402 Facilitator endpoint |
| `X402_FACILITATOR_API_KEY` | Yes | x402 API key |
| `MARKETPLACE_CONTRACT_HASH` | After deploy | Hash of the deployed Marketplace contract |
| `REGISTRY_CONTRACT_HASH` | After deploy | Hash of the deployed Registry contract |
| `AGENT_SECRET_KEY_PATH` | Yes | Path to the agent's Casper wallet `.pem` key file |
| `OPENAI_API_KEY` | Optional | For real LLM-powered reasoning |

### 2. Frontend Configuration

```bash
cd frontend
cp .env.local.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (default: `http://localhost:3001`) |
| `NEXT_PUBLIC_CSPR_CLICK_APP_ID` | Yes | Your cspr.click App ID |
| `NEXT_PUBLIC_CSPR_CLICK_APP_NAME` | Yes | Display name in the wallet popup |
| `NEXT_PUBLIC_CASPER_CHAIN_NAME` | Yes | `casper-test` or `casper` |

---

## Obtaining API Keys

### CSPR.cloud API Key
1. Visit [https://cspr.cloud](https://cspr.cloud)
2. Register for a developer account
3. Create a new project and copy your API key

### CSPR.click App ID
1. Visit [https://cspr.click](https://cspr.click)
2. Register your application
3. Copy the App ID provided

### x402 Facilitator
1. Visit [https://cspr.build](https://cspr.build) → Developers → x402 Facilitator
2. Follow the setup instructions to obtain your endpoint and key

### Agent Wallet (Testnet)
For development, you need a Casper testnet wallet:
1. Generate a key pair:
   ```bash
   mkdir -p backend/keys
   casper-client keygen backend/keys/
   ```
2. Fund it using the [Casper Testnet Faucet](https://testnet.cspr.live/tools/faucet)
3. Set `AGENT_SECRET_KEY_PATH=./keys/secret_key.pem` in your `.env`

> ⚠️ **Security Warning**: Never commit your `.env` files or private key files to version control. The `.gitignore` is pre-configured to exclude these.

---

## Smart Contract Deployment

After deploying your Odra contracts to testnet:

```bash
cd contracts
cargo odra build
cargo odra deploy -- --chain-name casper-test
```

Copy the returned contract hashes into your `backend/.env`:
```
MARKETPLACE_CONTRACT_HASH=hash-abc123...
REGISTRY_CONTRACT_HASH=hash-def456...
```

---

## Running the Full Stack

```bash
# Terminal 1: Backend
cd backend
npm install
npm run build
npm start

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Terminal 3: Smart Contracts (build only)
cd contracts
cargo build
cargo test
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.
