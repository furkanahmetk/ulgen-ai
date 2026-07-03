const { Keys } = require('casper-js-sdk');
const fs = require('fs');
const path = require('path');

const keysDir = path.join(__dirname, '../keys');

if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
}

// Generate new Ed25519 key pair
const keyPair = Keys.Ed25519.new();

// Export as PEM files
const publicKeyPem = keyPair.exportPublicKeyInPem();
const privateKeyPem = keyPair.exportPrivateKeyInPem();

// Save to files
fs.writeFileSync(path.join(keysDir, 'public_key.pem'), publicKeyPem);
fs.writeFileSync(path.join(keysDir, 'secret_key.pem'), privateKeyPem);
fs.writeFileSync(path.join(keysDir, 'public_key_hex'), keyPair.accountHex());

console.log('✅ Keys generated successfully in the "keys" directory!');
console.log('Public Key Hex (Fund this address via Testnet Faucet):');
console.log(keyPair.accountHex());
console.log('\nMake sure to update your .env file:');
console.log(`AGENT_SECRET_KEY_PATH=./keys/secret_key.pem`);
