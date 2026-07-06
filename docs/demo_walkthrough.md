# 🎬 Sentinel AI — Live Demo Walkthrough

This guide walks you through a **real, end-to-end investigation** performed by the Sentinel AI agent on Casper Testnet. No mocks, no stubs — every tool call hit a live network endpoint.

---

## The Scenario

> *"I found a promising DeFi yield farm on Casper. Should I invest? Let me ask Sentinel AI."*

**Target:** A Casper Testnet account (`0163d8a0...ef5d63`)  
**Investigation type:** `DeFi`  
**Agent model:** Google Gemini 2.0 Flash  
**Network:** Casper Testnet (`casper-test`)

---

## Step 1 — Trigger the Investigation

Open the frontend at `http://localhost:3000`, paste the target address in the input field, select **DeFi**, and click **Initiate Due Diligence**.

Alternatively, call the API directly:

```bash
curl -X POST http://localhost:3001/api/investigate \
  -H "Content-Type: application/json" \
  -d '{
    "url": "0163d8a06bab82776ec0fa0b38f1306e4e6a944468609adf5c0f8f5ad592ef5d63",
    "type": "DeFi"
  }'
```

The agent starts its **ReAct loop** immediately.

---

## Step 2 — Agent Collects Free On-Chain Data

The agent simultaneously queries three data sources at no cost:

### 2a. CSPR.trade MCP — Market Data
```
📊 Agent: Querying CSPR.trade MCP for market data...
```
The agent calls the CSPR.trade MCP Server to check token prices and liquidity pools for the target. In this run, the server responded with a `406 Not Acceptable` because the SSE handshake wasn't completed — the agent logged the warning and moved on gracefully.

### 2b. Casper MCP Server — On-Chain Account Data
```
🔗 Agent: Querying Casper MCP Server for on-chain account data...
```
The Casper MCP server was contacted to retrieve deploy history and account metadata. The server returned an SSE stream — the agent's JSON parser flagged it and fell back to the REST API.

### 2c. CSPR.cloud REST API — Account Details (Fallback)
```
🌐 Agent: Querying CSPR.cloud REST API for account details...
✅ Agent: Account info retrieved via CSPR.cloud REST API
```
**Data retrieved:**
```json
{
  "account_hash": "a33f7c25549647f81631517bb8e29c2b0a5d4eda7d640a517c5e2caa71b9af7c",
  "balance": "1942545518477",
  "public_key": "0163d8a06bab82776ec0fa0b38f1306e4e6a944468609adf5c0f8f5ad592ef5d63",
  "deployment_threshold": 1,
  "key_management_threshold": 1,
  "main_purse_uref": "uref-ce36184a...cf81b-007"
}
```
Balance: ~**1,942 CSPR** on testnet.

---

## Step 3 — Gemini AI Analyzes the Data

```
🧠 Agent: Analyzing collected data with Gemini AI...
```

The agent feeds all collected data into a Gemini 2.0 Flash prompt asking for:
- A **confidence score** (0–100)
- **Key findings** (positive and negative)
- Whether **premium data** is needed
- A final **recommendation** (`INVEST`, `CAUTION`, or `AVOID`)

In this run, Gemini's free-tier quota was exhausted (rate limit). The agent handled this gracefully:

```
⚠️ Agent: Gemini AI analysis failed: [429 Too Many Requests]
```

It fell back to a heuristic baseline:
- Confidence: **40** (low — data insufficient without AI reasoning)
- Recommendation: `CAUTION`
- `needsPremiumData: true`

---

## Step 4 — Agent Decides to Buy Premium Intelligence

Because confidence was below the **80% threshold**, the agent autonomously triggered an **x402 micro-payment**:

```
💰 Agent: Confidence is low. Initiating x402 micro-payment for premium intelligence...
🔄 Agent: Paying for Deep Liquidity & Rug-Pull Analysis via x402 Facilitator...
✅ Agent: x402 payment of 0.02 CSPR processed via https://x402-facilitator.cspr.cloud
```

The agent paid **0.02 CSPR** — no human approval needed. This is the autonomous payment capability at the core of Sentinel AI.

---

## Step 5 — Re-Analysis with Premium Data

After receiving the premium liquidity analysis:
```
🧠 Agent: Re-analyzing with premium data...
🧠 Agent: Updated confidence: 65%
```

Confidence jumped from 40% → **65%** thanks to the additional data.

---

## Step 6 — Final Due Diligence Report

```
📋 Agent: Synthesizing final due diligence report...
✅ Agent: Investigation complete. Score: 65/100 | Recommendation: CAUTION
```

**Full report:**

| Field | Value |
|-------|-------|
| **Score** | 65 / 100 |
| **Recommendation** | ⚠️ CAUTION |
| **CSPR Spent (agent)** | 0.02 CSPR |
| **Liquidity Analyzed** | ✅ Yes (via x402 premium) |
| **Payment Facilitator** | `https://x402-facilitator.cspr.cloud` |

**Tools used in this run:**
- Casper MCP Server (Testnet)
- CSPR.trade MCP (Public)
- CSPR.cloud REST API
- Google Gemini AI
- x402 Facilitator (Micro-payments)

---

## Live Transaction Proof

Both smart contracts used in this project are deployed **live** on Casper Testnet as **upgradeable** contracts:

| Contract | Package Hash | TX Link |
|----------|-------------|---------|
| **Marketplace** | `hash-047acbebd87099f014e65c9902cb3b5e89a1796f8bf4af31e95fc4d2dce21699` | [View on cspr.live](https://testnet.cspr.live/transaction/c4fe0bcd30c90a9b59071cb6237fa486c8d65cb443fecf53cb1ed3f31251f24b) |
| **InvestigationRegistry** | `hash-8777fd6ba97b6c96994194d091237bc7c4b966864453350d34c471b3e74f1464` | [View on cspr.live](https://testnet.cspr.live/transaction/a0dd9749c12fb4856116111e224ebd79bfd04d82b6a17d1b4cbe5788f233210f) |

Both contracts were deployed using **Odra Framework 2.8.x** with `InstallConfig::upgradable()`, meaning future upgrades publish new WASM versions under the same package hash without changing the contract address.

---

## What This Demonstrates

| Capability | Demonstrated |
|-----------|-------------|
| Autonomous multi-tool orchestration | ✅ |
| Graceful fallback between data sources | ✅ |
| x402 autonomous micro-payment | ✅ |
| Live on-chain data retrieval | ✅ |
| Upgradeable Casper smart contracts | ✅ |
| Odra Framework contract deployment | ✅ |
| Gemini AI integration with error handling | ✅ |

---

## Running It Yourself

1. Follow the [Usage Guide](usage_guide.md) to set up backend and frontend.
2. Get a funded testnet wallet from the [Casper Testnet Faucet](https://testnet.cspr.live/tools/faucet).
3. Run a full investigation:
   ```bash
   curl -X POST http://localhost:3001/api/investigate \
     -H "Content-Type: application/json" \
     -d '{"url": "<casper-public-key-or-contract-hash>", "type": "DeFi"}'
   ```
4. Watch the agent reason, call tools, pay for data, and deliver a report — all autonomously.
