import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { buildTransaction } from './builder';
import { markets as Markets, swapDirection as SwapDirection } from './helpers/constants';
import { StandardClient } from './senders/standard';

export class SolanaTrade {
  private readonly connection: Connection;

  constructor(rpcUrl?: string) {
    const url = rpcUrl || process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(url, 'processed');
  }

  async buy(params: {
    market: string;
    wallet: Keypair;
    mint: PublicKey | string;
    amount: number;
    slippage: number; // 0..100
    priorityFeeSol?: number;
    tipAmountSol?: number;
    poolAddress?: PublicKey | string;
    send?: boolean;
  }): Promise<string | Transaction> {
    return this.trade({ ...params, direction: SwapDirection.BUY });
  }

  async sell(params: {
    market: string;
    wallet: Keypair;
    mint: PublicKey | string;
    amount: number;
    slippage: number; // 0..100
    priorityFeeSol?: number;
    tipAmountSol?: number;
    poolAddress?: PublicKey | string;
    send?: boolean;
  }): Promise<string | Transaction> {
    return this.trade({ ...params, direction: SwapDirection.SELL });
  }

  private async trade(params: {
    market: string;
    direction: string;
    wallet: Keypair;
    mint: PublicKey | string;
    amount: number;
    slippage: number; // 0..100
    priorityFeeSol?: number;
    tipAmountSol?: number;
    poolAddress?: PublicKey | string;
    send?: boolean;
  }): Promise<string | Transaction> {
    const {
      market,
      direction,
      wallet,
      amount,
      priorityFeeSol = 0.0001,
      tipAmountSol = 0,
      send = true,
    } = params;

    const mint = this.normalizeMint(params.mint);
    const poolAddress = this.normalizePoolAddress(params.poolAddress);
    const slippageFraction = this.normalizeSlippage(params.slippage);

    const tx = await buildTransaction({
      connection: this.connection,
      market,
      direction,
      wallet,
      mint,
      poolAddress,
      amount,
      slippage: slippageFraction,
      priorityFeeSol,
      tipAmountSol,
    });

    if (!send) {
      return tx;
    }

    const sender = new StandardClient(this.connection);
    const sig = await sender.sendTransaction(
      tx,
      wallet,
      priorityFeeSol,
      tipAmountSol,
      false,
      { preflightCommitment: 'processed' }
    );
    return sig;
  }

  private normalizeMint(mint: PublicKey | string): PublicKey {
    if (mint instanceof PublicKey) return mint;
    return new PublicKey(mint);
  }

  private normalizeSlippage(slippagePercent: number): number {
    if (!Number.isFinite(slippagePercent)) throw new Error('Invalid slippage');
    const clamped = Math.max(0, Math.min(100, slippagePercent));
    return clamped / 100;
  }

  private normalizePoolAddress(pool?: PublicKey | string): PublicKey | undefined {
    if (pool === undefined || pool === null) return undefined;
    if (pool instanceof PublicKey) return pool;
    try {
      return new PublicKey(pool);
    } catch (_) {
      throw new Error('Invalid poolAddress');
    }
  }
}


