# 🚀 Solana Trade

A comprehensive, production-ready Solana trading library supporting 15+ DEXs with advanced MEV protection, built for both programmatic integration and CLI usage. Perfect for your trading bots / Solana dApps!

<div align="center">

[![npm version](https://badge.fury.io/js/solana-trade.svg)](https://badge.fury.io/js/solana-trade)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

</div>

## ✨ Features

- 🏪 **15+ DEX Support**: Pump.fun, PumpSwap, Raydium (AMM/CLMM/CPMM/Launchpad), Orca, Meteora (DLMM/DAMM/DBC), Moonit, Heaven, Sugar, Boop.fun
- 🛡️ **Advanced MEV Protection**: Jito, Nozomi, Astralane with regional optimization
- ⚡ **High Performance**: Optimized transaction building with automatic pool discovery
- 🎯 **Smart Routing**: Intelligent provider selection based on tip amounts and availability  
- 💻 **Dual Interface**: Full-featured programmatic API + powerful CLI
- 📦 **TypeScript**: Complete type definitions
- 🔧 **Configurable**: Extensive customization options for advanced users
- 📊 **Transaction Control**: Priority fees, slippage protection, simulation control
- 🌐 **Multi-Region**: Global MEV protection endpoints for optimal performance

## 📋 Supported Markets & Protocols
| Protocol | Market ID |
|----------|-----------|
| **Pump.fun** | `PUMP_FUN` |
| **Pump Swap** | `PUMP_SWAP` |
| **Raydium AMM** | `RAYDIUM_AMM` |
| **Raydium CLMM** | `RAYDIUM_CLMM` |
| **Raydium CPMM** | `RAYDIUM_CPMM` |
| **Raydium Launchpad** | `RAYDIUM_LAUNCHPAD` |
| **Orca Whirlpool** | `ORCA_WHIRLPOOL` |
| **Meteora DLMM** | `METEORA_DLMM` |
| **Meteora DAMM V1** | `METEORA_DAMM_V1` |
| **Meteora DAMM V2** | `METEORA_DAMM_V2` |
| **Meteora DBC** | `METEORA_DBC` |
| **Moonit** | `MOONIT` |
| **Heaven XYZ** | `HEAVEN` |
| **Sugar** | `SUGAR` |
| **Boop.fun** | `BOOP_FUN` |

## 🛡️ Transaction Senders / MEV Protection Services

### Jito Labs
- **Minimum Tip**: No minimum (bundles require ≥1000 lamports)
- **Environment**: `JITO_UUID`
- **Regions**: `MAINNET`, `AMS`, `DUB`, `FRA`, `LON`, `NY`, `SLC`, `SG`, `TYO`

### Nozomi
- **Minimum Tip**: 0.001 SOL
- **Environment**: `NOZOMI_API_KEY` (standard), `NOZOMI_API_KEY_ANTIMEV` (anti-MEV)
- **Regions**: `PITT`, `TYO`, `SG`, `EWR`, `AMS`, `FRA`

### Astralane
- **Minimum Tip**: 0.00001 SOL
- **Environment**: `ASTRALANE_API_KEY`
- **Regions**: `FR`, `LAX`, `JP`, `NY`, `AMS`, `LIM`

## 🚀 Installation

```bash
npm install solana-trade
# or
yarn add solana-trade
# or
pnpm add solana-trade
```

## ⚡ Quick Start

### Programmatic Usage

```typescript
import { SolanaTrade } from 'solana-trade';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// Initialize with custom RPC (optional)
const trader = new SolanaTrade('https://your-premium-rpc.com');

// Create wallet from private key
const wallet = Keypair.fromSecretKey(bs58.decode('your-private-key-base58'));

// Buy 0.1 SOL worth of tokens
const buySignature = await trader.buy({
  market: 'PUMP_FUN',
  wallet: wallet,
  mint: 'So11111111111111111111111111111111111111112',
  amount: 0.1,
  slippage: 5, // 5%
  sender: 'JITO', // Optional MEV protection
  region: 'NY', // Optional region preference
  antimev: true // Enable anti-MEV features
});

console.log('Buy transaction:', buySignature);

// Sell 1,000,000 tokens
const sellSignature = await trader.sell({
  market: 'PUMP_FUN',
  wallet: wallet,
  mint: 'So11111111111111111111111111111111111111112',
  amount: 1000000,
  slippage: 5,
  priorityFeeSol: 0.001, // Higher priority fee
  tipAmountSol: 0.01 // MEV protection tip
});

console.log('Sell transaction:', sellSignature);

// Get transaction object without sending (Legacy Transaction)
const transaction = await trader.buy({
  market: 'PUMP_FUN',
  wallet: wallet,
  mint: 'So11111111111111111111111111111111111111112',
  amount: 0.1,
  slippage: 5,
  send: false // Returns Transaction object instead of sending
});

console.log('Transaction object:', transaction);
// You can then send it manually or modify it further
```

### CLI Usage

```bash
# Install globally for CLI access
npm install -g solana-trade

# Buy tokens with Jito MEV protection
solana-trade \
  --market PUMP_FUN \
  --direction buy \
  --mint So11111111111111111111111111111111111111112 \
  --amount 0.1 \
  --slippage 5 \
  --private-key your-base58-private-key \
  --sender JITO \
  --tip 0.001 \
  --region NY

# Sell tokens with custom priority fee
solana-trade \
  --market RAYDIUM_CLMM \
  --direction sell \
  --mint TokenMintAddress \
  --amount 1000000 \
  --slippage 3 \
  --private-key your-base58-private-key \
  --priority-fee 0.005 \
  --skip-simulation true
```

## 📖 API Documentation

### SolanaTrade Class

#### Constructor

```typescript
new SolanaTrade(rpcUrl?: string)
```

**Parameters:**
- `rpcUrl` (optional): Custom RPC endpoint URL. Defaults to `process.env.RPC_URL` or Solana mainnet-beta.

#### Methods

##### `buy(params: BuyParams): Promise<string | Transaction>`

Execute a buy transaction.

**Parameters:**
```typescript
interface BuyParams {
  market: string;                    // Market identifier (see supported markets)
  wallet: Keypair;                   // Solana wallet keypair
  mint: PublicKey | string;          // Token mint address
  amount: number;                    // SOL amount to spend
  slippage: number;                  // Slippage tolerance (0-100)
  priorityFeeSol?: number;           // Priority fee in SOL (default: 0.0001)
  tipAmountSol?: number;             // MEV protection tip in SOL (default: 0)
  poolAddress?: PublicKey | string;  // Specific pool address (optional, will skip pool discovery if provided)
  send?: boolean;                    // Whether to send transaction (default: true)
  sender?: 'ASTRALANE' | 'NOZOMI' | 'JITO'; // MEV protection service
  antimev?: boolean;                 // Enable anti-MEV features (default: false)
  region?: string;                   // Preferred region for MEV service
  skipSimulation?: boolean;          // Skip transaction simulation (default: false)
  skipConfirmation?: boolean;        // Skip confirmation waiting (default: false)
}
```

##### `sell(params: SellParams): Promise<string | Transaction>`

Execute a sell transaction. Same parameters as `buy()`, except `amount` represents token quantity.

## 🌍 Environment Variables

### Core Configuration

```bash
# RPC Endpoint (optional, defaults to public mainnet)
RPC_URL=https://your-rpc-endpoint.com
```

### MEV Protection Services

```bash
# Jito Labs
JITO_UUID=your-jito-uuid

# Nozomi
NOZOMI_API_KEY=your-nozomi-api-key
NOZOMI_API_KEY_ANTIMEV=your-nozomi-antimev-key  # Optional: for enhanced protection

# Astralane
ASTRALANE_API_KEY=your-astralane-api-key
```

## 💰 Fees & Development Support

### Development Fee
- **Rate**: 0.15% on buy transactions only
- **Purpose**: Supports ongoing development and maintenance
- **Recipient**: `CDuvRTHRaPFEQJYdHsEWpuE3yRB49Azi9e5g8Yi9Xm4d`
- **Disable**: Set env var `DISABLE_DEV_TIP=true` (but please consider keeping it to support development! 🙏)

### MEV Protection Tips
- **Jito**: Variable, no minimum enforced
- **Nozomi**: 0.001 SOL minimum  
- **Astralane**: 0.00001 SOL minimum

## 📝 CLI Reference

### Required Arguments
- `--market`: Market identifier (see supported markets table)
- `--direction`: Transaction direction (`buy` or `sell`)
- `--mint`: Token mint address
- `--amount`: Amount (SOL for buy, tokens for sell)
- `--slippage`: Slippage tolerance (0-100)
- `--private-key`: Base58-encoded private key

### Optional Arguments
- `--priority-fee`: Priority fee in SOL (default: 0.0001)
- `--tip`: MEV protection tip in SOL (default: 0)
- `--pool-address`: Specific pool address
- `--sender`: MEV protection service (`JITO`, `NOZOMI`, `ASTRALANE`)
- `--antimev`: Enable anti-MEV features (`true`, `false`)
- `--region`: Preferred region code
- `--skip-simulation`: Skip transaction simulation (`true`, `false`)
- `--skip-confirmation`: Skip confirmation waiting (`true`, `false`)

## 🛠️ Error Handling

```typescript
try {
  const result = await trader.buy({
    market: 'PUMP_FUN',
    wallet: wallet,
    mint: 'invalid-mint-address',
    amount: 0.1,
    slippage: 5,
  });
  console.log('Success:', result);
} catch (error) {
  if (error.message.includes('Simulation failed')) {
    console.error('Transaction would fail:', error);
    // Handle simulation failure
  } else if (error.message.includes('HTTP')) {
    console.error('Network error:', error);
    // Handle network issues
  } else {
    console.error('Unknown error:', error);
    // Handle other errors
  }
}
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

```bash
git clone https://github.com/FlorianMgs/solana-trade.git
cd solana-trade
npm install

# Build the project
npm run build

# Test the CLI
npm run cli -- --help
```

### Contribution Guidelines

1. **Fork the repository** and create your feature branch
2. **Follow TypeScript best practices** and existing code style
3. **Update documentation** for any API changes
4. **Test thoroughly** across different markets and scenarios
5. **Submit a pull request** with a clear description

### Areas We Need Help With

- 🚀 **New DEX/Launchpad Integrations**: We more than welcome new launchpads and DEXs to integrate their protocols into the project! This helps expand trading opportunities for all users.
- 🔥 **Transaction senders**: If you're running a transaction provider service, don't hesitate to add it!
- 📚 **Documentation**: Examples, tutorials, API documentation
- 🐛 **Bug Reports**: Issue identification and reproduction steps
- ✨ **New Features**: Optimization improvements, additional functionality

### DEX/Launchpad Integration

**New protocols are more than welcome!** If you're a DEX or launchpad team looking to integrate:

1. **Contact us** via GitHub Issues or email to discuss integration
2. **Provide SDK/API documentation** for your protocol
3. **Share test environments** and pool addresses for testing
4. **Collaborate on implementation** - we'll help build the integration
5. **Benefit from exposure** to our user base once integrated

## ☕ Buy Me a Coffee

If this library helps your project, consider supporting its development:

### Donate SOL
**Address**: `CDuvRTHRaPFEQJYdHsEWpuE3yRB49Azi9e5g8Yi9Xm4d`

*This is the same address used for the 0.15% development fee. Your donations help maintain and improve this project! 🙏*

### Why Support?

- 🔬 **Research & development**: New DEX integrations, optimization
- 🛠️ **Maintenance**: Bug fixes, security updates, dependency management  
- 📖 **Documentation**: Tutorials, examples, comprehensive guides
- 🆘 **Support**: Community assistance, issue resolution

### Keep the Fee Active

The easiest way to support development is to **keep the 0.15% fee active** by not setting `DISABLE_DEV_TIP=true`. This small fee on buy transactions only helps ensure the project remains maintained and improved.

## 📜 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: [https://github.com/FlorianMgs/solana-trade](https://github.com/FlorianMgs/solana-trade)
- **NPM**: [https://www.npmjs.com/package/solana-trade](https://www.npmjs.com/package/solana-trade)
- **Issues**: [https://github.com/FlorianMgs/solana-trade/issues](https://github.com/FlorianMgs/solana-trade/issues)
- **Discussions**: [https://github.com/FlorianMgs/solana-trade/discussions](https://github.com/FlorianMgs/solana-trade/discussions)

## 🆘 Support & Community

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/FlorianMgs/solana-trade/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/FlorianMgs/solana-trade/discussions)  

## ⚠️ Disclaimer

**Important**: Trading cryptocurrencies involves substantial risk of loss and is not suitable for all investors. This software is provided "as-is" without any warranties or guarantees. The authors and contributors are not responsible for any financial losses incurred through the use of this software.

**Key Risks:**
- **Market Risk**: Cryptocurrency prices are highly volatile
- **Technical Risk**: Smart contract bugs, network issues, transaction failures
- **MEV Risk**: Sandwich attacks, front-running despite protection measures  
- **Slippage Risk**: Price movement during transaction execution

**Best Practices:**
- Only trade with funds you can afford to lose
- Test with small amounts first
- Understand the risks of each DEX and token
- Keep your private keys secure
- Monitor transactions carefully

---

<div align="center">

**Made with ❤️ by [FlorianMgs (Madgic)](https://github.com/FlorianMgs)**

*Pls leave a ⭐ star on GitHub!*

</div>