# FaceBuddy: Your Verifiable AI Social Assistant 🤖💬

## 🌟 Overview

FaceBuddy is a cutting-edge AI assistant that helps you manage social connections and transactions with **verifiable proof** on the blockchain. Built on EigenLayer's AVS, it provides transparent and trustworthy AI interactions.

Whether you're sending crypto to friends, connecting on social media, or just chatting, FaceBuddy handles it all with cryptographic verification that proves your AI interactions happened exactly as you experienced them!

## ✨ Key Features

- 🔐 **Verifiable AI Responses** - Every interaction is cryptographically proven using Opacity's zkTLS technology
- 💸 **Secure Transactions** - Send cryptocurrency with confidence
- 🔗 **Social Connections** - Connect with friends on Telegram, LinkedIn, and Twitter
- 📊 **Transaction History** - View your complete transaction history stored on EthStorage
- 🧠 **Smart Assistant** - Helpful AI responses powered by Claude

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm or pnpm
- Ethereum wallet with private key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/facebuddy.git
cd facebuddy

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configuration
```

### Configuration

Edit your `.env` file with the following credentials:

```
# Opacity (for verifiable AI)
OPACITY_OPENAI_KEY=your_opacity_key
OPACITY_TEAM_ID=your_team_id
OPACITY_TEAM_NAME=your_team_name
OPACITY_PROVER_URL=https://prover.opacity.io

# EthStorage (for transaction storage)
ETHSTORAGE_PRIVATE_KEY=your_private_key
ETHSTORAGE_RPC_URL=https://rpc.beta.testnet.l2.quarkchain.io:8545
ETHSTORAGE_DIRECTORY_ADDRESS=0xA460C70b474cA4125c35dFaFfC1e83B0122efcaB
ETHSTORAGE_ENABLED=true
```

### Running the Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 🔧 API Endpoints

### Generate AI Response

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Send 5 ETH to 0x123..."}'
```

### Get Transaction History

```bash
curl http://localhost:3000/api/transactions/0x0E5d299236647563649526cfa25c39d6848101f5
```

### Health Check

```bash
curl http://localhost:3000/health
```

## 🧩 Architecture

FaceBuddy leverages several powerful technologies:

- **Opacity** - Provides verifiable AI inference with zkTLS proofs
- **EthStorage** - Stores transaction records on-chain for transparency
- **Express.js** - Powers the API server

## 🛠️ Development

### Project Structure

```
facebuddy/
├── src/
│   ├── agent/
│   │   ├── createAgent.ts    # Core agent implementation
│   │   └── ethStorage.ts     # EthStorage adapter
│   ├── types/                # TypeScript type definitions
│   ├── server.ts             # Express API server
│   └── index.ts              # Entry point
├── package.json
└── tsconfig.json
```

### Adding New Features

1. Implement your feature in the appropriate file
2. Add any new API endpoints to `server.ts`
3. Update types as needed
4. Test thoroughly before submitting a PR

## 🔍 How It Works

1. **User Request** - You send a request to FaceBuddy
2. **Verifiable Processing** - Opacity generates a response with cryptographic proof
3. **Blockchain Storage** - The interaction is stored on EthStorage with a unique ID
4. **Response Delivery** - You receive the AI response with verification data
5. **Verification** - Anyone can verify the interaction happened exactly as recorded

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [EigenLayer](https://www.eigenlayer.xyz/) - For providing the restaking infrastructure
- [Opacity](https://opacity.io/) - For verifiable AI technology
- [EthStorage](https://ethstorage.io/) - For decentralized storage solutions

---

Built with ❤️ by the FaceBuddy Team
