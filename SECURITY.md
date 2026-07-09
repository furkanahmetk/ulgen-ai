# Security Policy

# Security Policy

Security is a top priority for Ulgen AI. We take the security of our smart contracts, AI agent interactions, and backend infrastructure seriously.

## Supported Versions

Only the latest `main` branch and currently deployed testnet smart contracts are actively supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| `1.x.x` (main) | :white_check_mark: |
| `< 1.0.0` | :x:                |

## Reporting a Vulnerability

Please do **not** report security vulnerabilities through public GitHub issues. 

Instead, please report them by sending an email to the repository maintainers or creating a private security advisory on GitHub if enabled. 

Please include the following information in your report:
* A detailed description of the vulnerability.
* Step-by-step instructions to reproduce the issue.
* The potential impact (e.g., unauthorized access, fund drain).

We will endeavor to respond to your report within 48 hours and provide a timeline for a fix.

## Smart Contract Security

Our smart contracts are built using the **Odra Framework** for the Casper Network.
- Contracts are **upgradeable**, meaning we can patch vulnerabilities without changing the contract hash.
- **NEVER** share your private keys (`secret_key.pem`) or commit them to the repository. The `.gitignore` is set up to ignore `*.pem` and `.env` files by default.
- If you find a potential exploit in the `Marketplace` or `InvestigationRegistry` contracts, please report it immediately.

## API Key & AI Agent Security

The Ulgen AI backend orchestrates sensitive actions using LLM models (Gemini) and micropayments (x402 Facilitator).
- Ensure your `.env` files (e.g., `GOOGLE_API_KEY`, `CSPR_CLOUD_API_KEY`, `AGENT_SECRET_KEY_PATH`) are kept secure.
- The AI agent is designed with a strict **ReAct loop** to prevent prompt injection attacks from autonomously executing unauthorized on-chain transactions.
- Always monitor the transaction logs if you are running your own local instance of the backend.

Thank you for helping keep Ulgen AI secure!
