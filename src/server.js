import express from 'express';
import { Connection, Keypair, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const app = express();
app.use(express.json());

// Initialize Secrets Manager Client
const secretsClient = new SecretsManagerClient({ region: 'ap-southeast-2' });

// Fetch secrets (e.g., escrow wallet private key)
const fetchSecrets = async () => {
    try {
        const command = new GetSecretValueCommand({ SecretId: 'HomeChanceLotterySecrets' });
        const response = await secretsClient.send(command);
        return JSON.parse(response.SecretString);
    } catch (error) {
        console.error('Error fetching secrets:', error.message);
        throw new Error('Failed to fetch secrets');
    }
};

// Mock Solana payout function (replace with actual logic)
const paySellerAndCharitySol = async (amountSol, raffleId) => {
    const secrets = await fetchSecrets();
    const connection = new Connection('https://api.devnet.solana.com');
    const escrowKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secrets.ESCROW_WALLET_PRIVATE_KEY)));
    
    const transaction = new Transaction().add(
        await connection.getLatestBlockhash()
    );
    transaction.sign(escrowKeypair);
    return transaction.signature.toString(); // Mock signature
};

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.post('/payout-sol', async (req, res) => {
    const { amountSol, raffleId } = req.body;
    if (!amountSol || !raffleId) {
        return res.status(400).json({ error: 'Missing amountSol or raffleId' });
    }
    try {
        const signature = await paySellerAndCharitySol(amountSol, raffleId);
        res.status(200).json({ message: 'Solana payout processed', signature });
    } catch (error) {
        res.status(500).json({ error: 'Solana payout failed', details: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

