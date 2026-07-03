import express from 'express';
import cors from 'cors';
import { payForPremiumService } from './casper';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock Agent State
let currentInvestigation: any = null;

// Mock Tools
const getFreeInfo = (url: string) => {
    return {
        url,
        basicInfo: "Anonymous team, website looks new, contract verified.",
        confidence: 40
    };
};


app.post('/api/investigate', async (req, res) => {
    const { url, type } = req.body;
    
    console.log(`Starting investigation for ${url} (Type: ${type})`);
    
    const logs: string[] = [];
    logs.push("Agent: Starting observation...");
    
    const freeData = getFreeInfo(url);
    logs.push(`Agent: Queried CSPR.cloud MCP. Confidence: ${freeData.confidence}%`);
    
    let premiumData = {};
    if (freeData.confidence < 80) {
        logs.push("Agent: Confidence is too low. Need to buy premium intelligence via x402 Facilitator.");
        
        // Use a dummy public key for the provider (this would normally be the service provider's public key)
        const dummyProviderKey = '01e9d16ecba28b2db51a2f6fb39e8a5b28d6c8b09315dc4a415951d388e1bbdcf3';

        try {
            if (type === 'RWA') {
                logs.push("Agent: Sending transaction for 'Deed Check' via x402 Facilitator for 0.05 CSPR.");
                const deployHash = await payForPremiumService(0.05, dummyProviderKey);
                logs.push(`Agent: Payment transaction broadcasted. Deploy Hash: ${deployHash}`);
                
                // Simulate getting the premium data after payment
                premiumData = { realEstateVerified: true, owner: "Sentinel Corp", paymentDeployHash: deployHash };
            } else {
                logs.push("Agent: Sending transaction for 'Liquidity Check' from CSPR.trade MCP via x402 Facilitator for 0.02 CSPR.");
                const deployHash = await payForPremiumService(0.02, dummyProviderKey);
                logs.push(`Agent: Payment transaction broadcasted. Deploy Hash: ${deployHash}`);
                
                // Real fetching logic would go here:
                // const tradeData = await fetch('https://api.cspr.trade/v1/liquidity...');
                premiumData = { liquidityScore: 85, rugPullRisk: "Low", paymentDeployHash: deployHash };
            }
        } catch (error: any) {
            logs.push(`Agent Error: Failed to execute payment transaction. ${error.message}`);
            return res.status(500).json({ logs, error: error.message });
        }
    }
    
    logs.push("Agent: Synthesizing final report.");
    
    // Final mock decision
    const finalScore = 88;
    
    res.json({
        logs,
        result: {
            score: finalScore,
            recommendation: "INVEST",
            spent: type === 'RWA' ? 0.05 : 0.02,
            details: { ...freeData, ...premiumData }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Sentinel AI Backend running on http://localhost:${PORT}`);
});
