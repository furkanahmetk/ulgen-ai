# Sentinel AI - Testnet Deployment & Integration Guide

For the project to be fully functional and communicate with the outside world (Casper Network, data providers, etc.), it requires API keys and wallets. This guide explains step-by-step what you need to do to deploy the project on the testnet.

## 🟢 Step 1: Casper Wallet and Testnet Balance (For Users)
Users need a wallet to log in to the system.
1. Install the **Casper Wallet** extension in your browser.
2. Create a new account and select **Casper Testnet** as the network.
3. Go to the [Casper Testnet Faucet](https://testnet.cspr.live/tools/faucet).
4. Paste your wallet's Public Key and click "Request Tokens" to get free test CSPR coins.

## 🟢 Step 2: CSPR.cloud Integration (For On-Chain Data)
CSPR.cloud is required for the agent to quickly read data on the Casper network.
1. Go to [cspr.cloud](https://cspr.cloud) and create a Developer account.
2. Click the **"Create New Project"** button on the dashboard.
3. Name the project `Sentinel AI Testnet`.
4. Copy the generated **API Key**.
5. Open the `backend/.env` file in your project and update this line:
   ```env
   CSPR_CLOUD_API_KEY=your_cspr_cloud_api_key_here
   ```

## 🟢 Step 2.5: CSPR.trade API (For Market and DEX Data)
Required for the agent to read token prices and DEX data on the Casper network.
1. Go to [cspr.trade](https://cspr.trade) to get API access (or use the key provided during the hackathon).
2. Open your `backend/.env` file and update:
   ```env
   CSPR_TRADE_API_URL=https://api.cspr.trade/v1
   CSPR_TRADE_API_KEY=your_cspr_trade_api_key_here
   ```

## 🟢 Step 3: CSPR.click App ID (For User Login)
This is required to manage the wallet connection popup (UI) for users.
1. Go to [cspr.click](https://cspr.click).
2. Log in to the developer portal and register your application.
3. Copy the provided **App ID**.
4. Create (or open) the `frontend/.env.local` file in your project and add:
   ```env
   NEXT_PUBLIC_CSPR_CLICK_APP_ID=your_app_id_here
   NEXT_PUBLIC_CSPR_CLICK_APP_NAME="Sentinel AI"
   NEXT_PUBLIC_CASPER_CHAIN_NAME="casper-test"
   ```

## 🟢 Step 4: Creating the Agent Wallet
Since the AI Agent will make its own payments (x402) autonomously, it needs its own wallet (Private Key) running in the background.
1. Open your terminal and navigate to the `backend` folder of your project.
2. Generate a key pair for the agent:
   ```bash
   mkdir -p keys
   casper-client keygen keys/
   ```
3. This will create `secret_key.pem` and `public_key_hex` files inside the `keys/` folder.
4. Copy the text inside `public_key_hex`, go back to the [Casper Faucet](https://testnet.cspr.live/tools/faucet), and send free test CSPR to this wallet as well (the agent needs funds to make payments).
5. Add the following path to your `backend/.env` file:
   ```env
   AGENT_SECRET_KEY_PATH=./keys/secret_key.pem
   ```

## 🟢 Step 5: x402 Facilitator (For Autonomous Payments)
This infrastructure allows the agent to pay for premium data.
1. Add the following information to your `backend/.env` file:
   ```env
   X402_FACILITATOR_URL=https://x402.cspr.build
   X402_FACILITATOR_API_KEY=enter_your_testnet_key_here
   ```

## 🟢 Step 6: Deploying Smart Contracts to Testnet
You need to deploy the contracts you wrote with Odra to the Casper Testnet. To sign the transaction, we will use the Agent wallet (Private Key) that we generated and funded in Step 4.
1. Navigate to the `contracts` folder in your terminal.
2. Build and deploy the contract to the testnet:
   ```bash
   cargo odra build
   cargo odra deploy -- --chain-name casper-test --secret-key ../backend/keys/secret_key.pem
   ```
3. When the process is complete, the terminal will give you a `Contract Hash` (e.g., `hash-abc123...`).
4. Open your `backend/.env` file and paste these hashes:
   ```env
   MARKETPLACE_CONTRACT_HASH=your_hash_value_1
   REGISTRY_CONTRACT_HASH=your_hash_value_2
   ```

## 🟢 Step 7: AI Agent (LLM) Selection
You need to define the AI model that will act as the brain of the system. Check out the [LLM Integration Guide](llm_integration_guide.md) to set up OpenAI, Gemini, Groq, or Ollama.

## 🚀 Final Step: Starting the Project
If all keys and hashes have been added to your `.env` files, the project is now ready to run live on the testnet!

**Start the Backend:**
```bash
cd backend
npm install
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Go to `http://localhost:3000` in your browser. You can now connect your wallet, send requests to the agent, and watch the agent make payments through the contract using its own balance on the testnet!
