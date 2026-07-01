import express from 'express';
import cors from 'cors';

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

const buyPremiumService = (service: string, amount: string) => {
    console.log(`[x402 Facilitator Mock] Paying ${amount} CSPR for ${service}...`);
    // Here we use the x402 Facilitator to negotiate and sign the transaction via Casper Wallet
    
    if (service === 'Liquidity Check') {
        return { liquidityScore: 85, rugPullRisk: "Low" };
    }
    if (service === 'Deed Check') {
        return { realEstateVerified: true, owner: "Sentinel Corp" };
    }
    return {};
};

app.post('/api/investigate', (req, res) => {
    const { url, type } = req.body;
    
    console.log(`Starting investigation for ${url} (Type: ${type})`);
    
    const logs: string[] = [];
    logs.push("Agent: Starting observation...");
    
    const freeData = getFreeInfo(url);
    logs.push(`Agent: Queried CSPR.cloud MCP. Confidence: ${freeData.confidence}%`);
    
    let premiumData = {};
    if (freeData.confidence < 80) {
        logs.push("Agent: Confidence is too low. Need to buy premium intelligence via x402 Facilitator.");
        if (type === 'RWA') {
            logs.push("Agent: Purchasing 'Deed Check' via x402 Facilitator for 0.05 CSPR.");
            premiumData = buyPremiumService('Deed Check', '0.05');
        } else {
            logs.push("Agent: Purchasing 'Liquidity Check' from CSPR.trade MCP via x402 Facilitator for 0.02 CSPR.");
            premiumData = buyPremiumService('Liquidity Check', '0.02');
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
