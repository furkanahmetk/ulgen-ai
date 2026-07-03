const { CasperServiceByJsonRPC, Keys, DeployUtil } = require('casper-js-sdk');
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const CASPER_NODE_URL = process.env.CASPER_NODE_URL || 'http://node.testnet.caspercommunity.io:7777/rpc';
const CASPER_CHAIN_NAME = process.env.CASPER_CHAIN_NAME || 'casper-test';
const AGENT_SECRET_KEY_PATH = process.env.AGENT_SECRET_KEY_PATH || './keys/secret_key.pem';

const casperService = new CasperServiceByJsonRPC(CASPER_NODE_URL);

/**
 * Loads the agent's key pair from the PEM file.
 */
function getAgentKeyPair(): any {
    const fullPath = path.resolve(AGENT_SECRET_KEY_PATH);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Agent secret key not found at ${fullPath}. Please run 'npm run generate-keys' and fund the wallet.`);
    }
    return Keys.Ed25519.loadKeyPairFromPrivateFile(fullPath);
}

/**
 * Creates and sends a native transfer deploy on the Casper network.
 * @param amountInCSPR The amount to transfer in CSPR (e.g. 0.02)
 * @param targetPublicKeyHex The hex public key of the receiver
 * @returns The deploy hash
 */
export async function payForPremiumService(amountInCSPR: number, targetPublicKeyHex: string): Promise<string> {
    try {
        const agentKeyPair = getAgentKeyPair();
        
        // Convert CSPR to motes (1 CSPR = 1,000,000,000 motes)
        const amountInMotes = (amountInCSPR * 1_000_000_000).toString();
        const id = Math.round(Math.random() * 100000); // Random transaction ID

        const toPublicKey = Keys.PublicKey.fromHex(targetPublicKeyHex);
        
        // standard payment for native transfer is usually 0.1 CSPR
        const paymentAmount = 100_000_000;

        let deployParams = new DeployUtil.DeployParams(
            agentKeyPair.publicKey,
            CASPER_CHAIN_NAME,
            1, // gasPrice
            1800000 // ttl in ms
        );

        let session = DeployUtil.ExecutableDeployItem.newTransfer(
            amountInMotes,
            toPublicKey,
            null, // target URf, using public key directly
            id
        );

        let payment = DeployUtil.standardPayment(paymentAmount);
        let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
        
        // Sign deploy
        deploy = DeployUtil.signDeploy(deploy, agentKeyPair);

        // Send deploy
        const deployResult = await casperService.deploy(deploy);
        
        return deployResult.deploy_hash;
    } catch (error) {
        console.error("Error sending Casper transaction:", error);
        throw error;
    }
}
