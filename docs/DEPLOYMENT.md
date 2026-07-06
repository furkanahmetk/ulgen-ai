# Sentinel AI: Deployment Guide

This guide explains how to deploy the Sentinel AI project in a production environment. To avoid domain and DNS configuration issues, the recommended architecture is:
- **Frontend**: Vercel (Next.js serverless environment)
- **Backend**: Render, Heroku, or a dedicated VPS (Node.js/Express)

## 🏗️ Architecture Overview

When the frontend and backend are deployed on separate domains, you must ensure that:
1. The **Frontend** knows exactly where the Backend is located (via `NEXT_PUBLIC_API_URL`).
2. The **Backend** allows requests from the Frontend's Vercel domain (via `CORS` settings).

---

## 1. Backend Deployment (Render, Heroku, or VPS)

The backend is a standard Node.js Express server. It must be running continuously.

### Step 1: Prepare the Environment Variables
Before deploying, gather all required keys. You will need to input these into your hosting provider's "Environment Variables" section.

```env
PORT=3001
NODE_ENV=production

# Casper & CSPR.cloud
CASPER_NODE_URL=https://node.testnet.casper.network/rpc
CASPER_CHAIN_NAME=casper-test
CSPR_CLOUD_API_KEY=your_cspr_cloud_api_key_here
CSPR_CLOUD_REST_URL=https://api.testnet.cspr.cloud
CASPER_MCP_URL=https://mcp.testnet.cspr.cloud/mcp
CSPR_TRADE_MCP_URL=https://mcp.cspr.trade/mcp
X402_FACILITATOR_URL=https://x402-facilitator.cspr.cloud

# Smart Contracts
MARKETPLACE_CONTRACT_HASH=hash-81f425ad385a853f4bc0920329c882738f2c49c15ff6494dcd321aa6c293717a
REGISTRY_CONTRACT_HASH=hash-31da4afad7aed8ef0ad973593de98a13de3855087affd9095e7c35c277c9ce14

# Wallet Config
# IMPORTANT: Provide the relative path or base64 encode your key and decode it on the server.
AGENT_SECRET_KEY_PATH=./agent_keys/secret_key.pem
PUBLISHER_PUBLIC_KEY=your_publisher_public_key_here

# LLM APIs
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=google/gemma-3-27b-it
```

### Step 2: CORS Configuration
Ensure your `backend/src/server.ts` allows CORS requests from your future Vercel domain. By default, Sentinel AI is configured to allow `*` or specific origins.
```typescript
app.use(cors({
    origin: ['http://localhost:3000', 'https://your-project.vercel.app'],
    methods: ['GET', 'POST']
}));
```

### Step 3: Build and Start Command
In your hosting provider settings (e.g., Render Web Service), use:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `backend`

Once deployed, note your backend URL (e.g., `https://sentinel-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

Vercel provides native, zero-config support for Next.js applications.

### Step 1: Import Project
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Import your GitHub repository.

### Step 2: Configure Project Settings
In the "Configure Project" screen, make the following critical adjustments:
- **Framework Preset**: Next.js
- **Root Directory**: Select the `frontend` folder (Important!).

### Step 3: Environment Variables
Copy the contents of `frontend/.env.vercel.example` and paste them into Vercel. 
Ensure you update the `NEXT_PUBLIC_API_URL` to point to the backend you just deployed.

```env
# Point this to your Render/VPS URL! Do not use localhost in production.
NEXT_PUBLIC_API_URL=https://sentinel-backend.onrender.com

NEXT_PUBLIC_CSPR_CLICK_APP_NAME="Sentinel AI"
NEXT_PUBLIC_CSPR_CLICK_APP_ID=your_cspr_click_app_id_here
NEXT_PUBLIC_CASPER_CHAIN_NAME=casper-test
NEXT_PUBLIC_CASPER_NODE_URL=https://rpc.testnet.casperlabs.io/rpc
```

### Step 4: Deploy
Click **Deploy**. Vercel will automatically build the Next.js app and assign you a URL (e.g., `https://sentinel-ai.vercel.app`).

---

## 3. Post-Deployment Verification

1. **Verify Backend Status**: Go to `https://sentinel-backend.onrender.com/api/investigations` and ensure it returns an empty array `[]` (not a 404 or 502 error).
2. **Verify Frontend API Calls**: Open your Vercel site, open the Browser Developer Tools (F12) -> Network Tab. Submit an investigation. Verify that the request is sent to `https://sentinel-backend.onrender.com/...` and not `localhost`.
3. **Verify CSPR.click**: Ensure the Casper Wallet popup successfully connects on the Vercel domain. You may need to whitelist your Vercel domain in your CSPR.click dashboard.
