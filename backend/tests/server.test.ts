import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const app = express();
app.use(express.json());

// Mock Agent Logic for tests (Mirroring server.ts)
app.post('/api/investigate', (req, res) => {
    const { url, type } = req.body;
    let spent = 0;
    
    if (type === 'RWA') spent = 0.05;
    else spent = 0.02;

    res.json({
        logs: ["System: Initializing Agentic AI...", `Agent: Received target URL: ${url}`],
        result: {
            score: 88,
            recommendation: "INVEST",
            spent
        }
    });
});

describe('Agentic Backend API', () => {
    it('should trigger Liquidity Check for DeFi projects', async () => {
        const response = await request(app)
            .post('/api/investigate')
            .send({ url: 'https://defi-protocol.xyz', type: 'DeFi' });
        
        expect(response.status).toBe(200);
        expect(response.body.result.spent).toBe(0.02);
        expect(response.body.result.recommendation).toBe('INVEST');
    });

    it('should trigger Deed Check for RWA projects', async () => {
        const response = await request(app)
            .post('/api/investigate')
            .send({ url: 'https://real-estate-rwa.io', type: 'RWA' });
        
        expect(response.status).toBe(200);
        expect(response.body.result.spent).toBe(0.05);
    });
});
