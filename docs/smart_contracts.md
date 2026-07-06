# 📜 Sentinel AI Smart Contracts Documentation

Sentinel AI utilizes **Odra Framework (v2.8.x)** to build, test, and deploy secure, upgradable WebAssembly (Wasm) smart contracts on the Casper Blockchain. 

This document details the purpose, structure, and entry points of the two primary smart contracts powering the Sentinel AI ecosystem: **Marketplace** and **InvestigationRegistry**.

---

## 1. Marketplace Contract (`marketplace.rs`)

### 🎯 Purpose
The Marketplace contract acts as the on-chain financial hub for Sentinel AI. It handles incoming payments for investigations, manages the autonomous agent's "x402" premium data purchases, and allows the platform administrator to withdraw collected fees. 

Because the Sentinel AI agent needs to dynamically purchase third-party premium data (e.g., Deep Liquidity Analysis) during an investigation, this contract provides specialized payable endpoints to process these micro-transactions securely.

### 🔌 Entry Points (Endpoints)

#### `init()`
- **Type:** Constructor (`#[odra(init)]`)
- **Description:** Initializes the contract and sets the caller (deployer) as the `owner`.

#### `request_investigation(target_url: String)`
- **Type:** Payable (`#[odra(payable)]`)
- **Description:** Called by users (or the frontend acting on behalf of the user) to initiate and pay for an investigation. 
- **Validation:** Enforces a minimum attached value of **50 CSPR** (`50_000_000_000` motes). If the attached value is less, it reverts with `Error::InsufficientFee`.
- **State Change:** Records the payment amount against a unique key `investigation_{caller_address}_{target_url}`.

#### `purchase_premium_data(data_type: String)`
- **Type:** Payable (`#[odra(payable)]`)
- **Description:** The core endpoint for the **x402 Autonomous Agent flow**. When the AI agent determines it needs external premium data, it calls this endpoint, attaching the necessary CSPR fee from its own agent wallet.
- **State Change:** Records the transaction against a unique key `premium_{caller_address}_{data_type}`.

#### `purchase_service(service_name: String, amount: U512)`
- **Type:** Non-Payable
- **Description:** A legacy/utility endpoint to record service purchases without enforcing direct CSPR attachment (used primarily for off-chain or fiat-backed service tracking).

#### `withdraw()`
- **Type:** Non-Payable (Admin Only)
- **Description:** Allows the `owner` of the contract to withdraw the entire CSPR balance accumulated from investigations and premium data purchases.
- **Validation:** Reverts with `Error::Unauthorized` if called by any account other than the owner.

#### `get_purchase_amount(caller: String, service_name: String) -> U512`
- **Type:** Getter (Read-Only)
- **Description:** Returns the total amount spent by a specific caller for a specific service.

---

## 2. Investigation Registry Contract (`registry.rs`)

### 🎯 Purpose
The Investigation Registry is an immutable, on-chain ledger designed to store the final results of the AI's investigations. By logging the agent's findings on the Casper Blockchain, Sentinel AI ensures that security audits, risk scores, and recommendations are transparent, verifiable, and tamper-proof.

### 🔌 Entry Points (Endpoints)

#### `init()`
- **Type:** Constructor (`#[odra(init)]`)
- **Description:** Initializes the contract and sets the caller as the `owner`.

#### `log_investigation(target: String, score: u8, recommendation: String)`
- **Type:** Non-Payable
- **Description:** Called by the Autonomous AI Agent at the end of an investigation lifecycle. It permanently logs the target's risk profile to the blockchain.
- **Parameters:**
  - `target`: The URL, Hash, or Public Key investigated.
  - `score`: The AI-calculated risk score (0-100).
  - `recommendation`: The final verdict (e.g., `INVEST`, `CAUTION`, `AVOID`).
- **Event:** Emits an `InvestigationLogged` event for sub-graph indexing and frontend notification.

#### `get_investigation(target: String) -> Option<InvestigationResult>`
- **Type:** Getter (Read-Only)
- **Description:** Retrieves the latest stored investigation result for a given target. Returns `None` if the target has not been investigated.

#### `set_owner(new_owner: Address)`
- **Type:** Non-Payable (Admin Only)
- **Description:** Transfers the administrative ownership of the registry to a new Casper address.
- **Validation:** Reverts with `Error::NotOwner` if called by anyone other than the current owner.

---

## 🏗️ Upgradability Architecture

Both contracts are designed using Casper's native **Upgradable Contract Package** architecture via the Odra Framework.

### How Upgrades Work
1. **Initial Deployment:** When deployed using `InstallConfig::upgradable()`, Odra creates a **Contract Package Hash** and an associated `access_token` URef. The package hash remains permanent.
2. **Versioning:** When code logic is updated (e.g., adding a new entry point like `purchase_premium_data`), a new Wasm payload is sent to the network.
3. **Execution:** The network validates the deployer's `access_token` URef. If valid, the network attaches the new Wasm as `contract_version: 2` under the exact same Package Hash.
4. **Benefit:** The application's backend and frontend never need to update their `.env` variables. All interactions with the Package Hash automatically route to the newest secure version of the contract.

### Best Practices Enforced
- **No Scratch Deploys:** To maintain transaction history and immutable trust, new features or bug fixes are *strictly* applied as version upgrades to the existing package hashes. Deploying from scratch is explicitly prohibited in the Sentinel AI development lifecycle.
