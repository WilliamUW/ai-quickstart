import cors from 'cors';
import { createAgent } from './agent/createAgent.js';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

let agent: Awaited<ReturnType<typeof createAgent>>;

// Initialize the agent
createAgent().then(a => {
  agent = a;
  console.log('Agent initialized successfully');
}).catch(error => {
  console.error('Failed to initialize agent:', error);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', agentReady: !!agent });
});

// Generate verifiable text endpoint
app.post('/api/generate', async (req, res) => {
  try {
    if (!agent) {
      return res.status(503).json({ error: 'Agent not ready' });
    }

    const { prompt, userAddress } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Generating text for prompt:', prompt);
    const result = await agent.generateVerifiableText(prompt, userAddress);
    console.log('Generation result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ 
      error: 'Failed to generate text',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// New endpoint to get all transactions for a wallet address
app.get('/api/transactions/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Validate wallet address format (basic check for Ethereum address)
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ 
        error: 'Invalid wallet address format. Must be a valid Ethereum address.' 
      });
    }
    
    console.log(`Received request to get transactions for wallet: ${walletAddress}`);
    
    // Call the agent's getAllTransactions method
    const transactions = await agent.getAllTransactions(walletAddress);
    
    // Return the transactions
    return res.status(200).json({ 
      walletAddress,
      transactionCount: transactions.length,
      transactions 
    });
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    return res.status(500).json({ 
      error: 'An error occurred while retrieving transactions',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/generate');
  console.log('  GET  /api/transactions/:walletAddress');
}); 