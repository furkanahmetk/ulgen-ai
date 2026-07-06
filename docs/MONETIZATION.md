# Sentinel AI: Agentic Economy & Monetization Model

Sentinel AI represents a paradigm shift in how AI applications interact with blockchain economies. Instead of relying on user-signed micro-transactions for every step of an investigation, Sentinel AI functions as a fully **Autonomous AI Agent** with its own wallet, budget, and decision-making capabilities.

## 1. The Maximum Budget Allocation (Initial Fee)
When a user requests an investigation, they do not pay a fixed fee. Instead, the Sentinel AI Backend calculates a **Maximum Budget** for that specific target using the `/api/estimate-fee` endpoint. 

This calculation includes:
- **Base LLM Cost:** Estimated cost of token usage for the primary investigation.
- **Potential Premium Data (x402):** A reserved budget in case the AI agent encounters suspicious activity and decides it needs to purchase premium data (e.g., Deep Liquidity Analysis, RWA Deed Verification).
- **Platform Margin:** A 30% safety and profit margin added to cover gas fees and platform revenue.

The user pays this Maximum Budget upfront via a standard Casper Transfer.

## 2. The "Ultimate Hybrid" x402 Architecture
To prove true Agentic autonomy and real-world readiness, the Sentinel AI Agent implements an advanced **"Ultimate Hybrid" x402 Architecture**.

When the agent decides to purchase premium data mid-investigation, it does not rely on simple mock transfers. Instead, it executes a two-step resilient pipeline:

### Phase 1: The Official HTTP Handshake
1. The Agent dynamically constructs the exact `paymentPayload` (with EIP-712 formatted parameters) and `paymentRequirements` JSON schemas dictated by the CSPR.cloud x402 specification.
2. It sends an HTTP POST request to the official `x402-facilitator.cspr.cloud/verify` endpoint.
3. This proves the backend can natively speak the x402 protocol and structure the exact cryptographic payloads required by the Decentralized API standard.

### Phase 2: The On-Chain Execution & Smart Contract Interaction
Instead of relying on mock transfers, the Agent uses its own funded `agent_keys` wallet to call the `purchase_premium_data` payable endpoint on our deployed **Marketplace Smart Contract**. 
- The agent attaches the necessary CSPR fee directly to the contract call.
- This interaction is fully logged on the Casper Testnet, yielding a genuine, verifiable `deployHash`.

### Phase 3: The Real-Time Data Fetch & LLM Re-evaluation
Immediately after the smart contract payment is confirmed, the system executes the data fetch to prove the value of the x402 transaction:
1. **Real Data Fetch:** The backend connects to the official **CSPR.trade MCP Server** (`https://mcp.cspr.trade/mcp`) via HTTP POST and executes the `analyze_trade` tool. This retrieves live DEX liquidity, slippage, and safety data.
2. **LLM Re-evaluation:** The newly purchased premium data is dynamically injected back into the **Gemini LLM prompt**. The AI is instructed to reconsider its original confidence score and recommendation based on the paid intelligence.

> **Proof of Execution:** This 3-layer pipeline (Payment -> Real Data Fetch -> AI Re-evaluation) guarantees that our Agentic Economy is fully functional, secure, and actively impacts the AI's final reasoning.

## 3. The Auto-Refund Mechanism
At the end of the investigation, the agent calculates the **Actual Cost** incurred (Base Cost + Premium Data Spent + 30% Margin).
If the agent did not need to purchase premium data, or if the actual cost was lower than the Maximum Budget collected, **the agent automatically issues an On-Chain Refund Transfer** back to the user's wallet.

### Why this matters?
- **User Trust:** Users only pay for the intelligence actually utilized.
- **Autonomy:** The AI acts as an independent financial entity, managing a project budget.
- **Scalability:** The platform naturally profits from the 30% margin on all executed tasks, creating a sustainable business model.

## 4. On-Chain Transparency
Every step of the financial flow is logged and verifiable on the Casper Network. The final investigation PDF report includes the transaction hashes for:
1. `FEE`: The user's initial payment.
2. `X402`: The agent's autonomous premium data purchase.
3. `REFUND`: The automatic refund of unspent budget.
4. `LOG`: The final InvestigationRegistry smart contract log.
