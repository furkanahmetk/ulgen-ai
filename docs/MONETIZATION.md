# Sentinel AI: Agentic Economy & Monetization Model

Sentinel AI represents a paradigm shift in how AI applications interact with blockchain economies. Instead of relying on user-signed micro-transactions for every step of an investigation, Sentinel AI functions as a fully **Autonomous AI Agent** with its own wallet, budget, and decision-making capabilities.

## 1. The Maximum Budget Allocation (Initial Fee)
When a user requests an investigation, they do not pay a fixed fee. Instead, the Sentinel AI Backend calculates a **Maximum Budget** for that specific target using the `/api/estimate-fee` endpoint. 

This calculation includes:
- **Base LLM Cost:** Estimated cost of token usage for the primary investigation.
- **Potential Premium Data (x402):** A reserved budget in case the AI agent encounters suspicious activity and decides it needs to purchase premium data (e.g., Deep Liquidity Analysis, RWA Deed Verification).
- **Platform Margin:** A 30% safety and profit margin added to cover gas fees and platform revenue.

The user pays this Maximum Budget upfront via a standard Casper Transfer.

## 2. Autonomous Agent Spending (x402)
Once the budget is allocated, the AI agent begins its work. If the agent's confidence score drops below a certain threshold during the investigation, it will autonomously decide to purchase premium data.
**The agent uses its own funded wallet (`agent_keys`)** to execute real on-chain transfers to the data publisher's address via the CSPR.cloud x402 Facilitator. The user is never prompted to sign these mid-investigation micro-payments, preserving true autonomy.

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
