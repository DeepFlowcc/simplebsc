# BSC Operations Web App

A web application for interacting with the Binance Smart Chain (BSC) network, featuring transaction management, PancakeSwap integration, and batch swap functionality.

## Features

- Send BNB transactions
- Token swaps via PancakeSwap
- Batch token swaps
- Wallet connection support
- Modern and responsive UI

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask or another Web3 wallet
- BSC network configured in your wallet

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd simplebsc
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

The application will open in your default browser at `http://localhost:3000`.

## Usage

1. Connect your Web3 wallet (MetaMask recommended)
2. Choose the operation you want to perform:
   - Transactions: Send BNB to other addresses
   - PancakeSwap: Swap tokens using PancakeSwap
   - Batch Swap: Execute multiple swaps in sequence

## Supported Tokens

The application supports the following tokens by default:
- WBNB
- BUSD
- USDT
- CAKE

## Security Notes

- Never share your private keys or seed phrases
- Always verify transaction details before confirming
- Use the application at your own risk
- Make sure you're connected to the correct network (BSC Mainnet)

## License

MIT 
