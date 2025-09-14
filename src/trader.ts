import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { buildTransaction } from './builder';
import { markets as Markets, swapDirection as SwapDirection } from './helpers/constants';
import { StandardClient } from './senders/standard';
import { NozomiSenderClient } from './senders/nozomi';
import { AstralaneSenderClient } from './senders/astralane';
import { JitoSenderClient } from './senders/jito';
import { createTipInstruction } from './helpers/instructions';
import { 
  NOZOMI_TIP_ADDRESSES,
  ASTRALANE_TIP_ADDRESSES,
  NOZOMI_MIN_TIP_SOL,
  ASTRALANE_MIN_TIP_SOL,
  NOZOMI_REGIONS,
  ASTRALANE_REGIONS,
  JITO_TIP_ADDRESSES,
  JITO_MIN_TIP_SOL,
  JITO_REGIONS,
  senders as Providers
} from './helpers/constants';
import { DEV_TIP_ADDRESS, DEV_TIP_RATE } from './helpers/constants';

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
    sender?: 'ASTRALANE' | 'NOZOMI' | 'JITO';
    antimev?: boolean;
    region?: string;
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
    sender?: 'ASTRALANE' | 'NOZOMI' | 'JITO';
    antimev?: boolean;
    region?: string;
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
    sender?: 'ASTRALANE' | 'NOZOMI' | 'JITO';
    antimev?: boolean;
    region?: string;
  }): Promise<string | Transaction> {
    const {
      market,
      direction,
      wallet,
      amount,
      priorityFeeSol = 0.0001,
      tipAmountSol = 0,
      send = true,
      sender: providedSender,
      antimev,
      region,
    } = params;

    const mint = this.normalizeMint(params.mint);
    const poolAddress = this.normalizePoolAddress(params.poolAddress);
    const slippageFraction = this.normalizeSlippage(params.slippage);

    // Determine provider based on inputs (tip-based thresholds when not explicitly provided)
    const provider = this.chooseProvider(providedSender, tipAmountSol);
    const regionSelected = this.chooseRegion(provider, region);

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
    });

    if (direction === SwapDirection.BUY) {
      const devTipSol = (amount || 0) * DEV_TIP_RATE;
      if (devTipSol > 0) {
        const tipIx = createTipInstruction(DEV_TIP_ADDRESS, wallet.publicKey, devTipSol);
        tx.add(tipIx);
      }
    }

    // If using a special provider AND user provided a tip, add provider tip instruction
    if (provider && (tipAmountSol || 0) > 0) {
      const { tipAddress, finalTip } = this.computeProviderTip(provider, tipAmountSol);
      if (finalTip > 0) {
        const tipIx = createTipInstruction(tipAddress, wallet.publicKey, finalTip);
        tx.add(tipIx);
      }
    }

    if (!send) {
      return tx;
    }

    // Route to appropriate sender
    if (!provider) {
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

    if (provider === Providers.NOZOMI) {
      const sender = new NozomiSenderClient(this.connection);
      return sender.sendTransaction(
        tx,
        wallet,
        priorityFeeSol,
        tipAmountSol,
        false,
        { preflightCommitment: 'processed' },
        { provider: 'NOZOMI', region: regionSelected, antimev }
      );
    }

    if (provider === Providers.ASTRALANE) {
      const sender = new AstralaneSenderClient(this.connection);
      return sender.sendTransaction(
        tx,
        wallet,
        priorityFeeSol,
        tipAmountSol,
        false,
        { preflightCommitment: 'processed' },
        { provider: 'ASTRALANE', region: regionSelected, antimev }
      );
    }

    if (provider === Providers.JITO) {
      const sender = new JitoSenderClient(this.connection);
      return sender.sendTransaction(
        tx,
        wallet,
        priorityFeeSol,
        tipAmountSol,
        false,
        { preflightCommitment: 'processed' },
        { provider: 'JITO', region: regionSelected, antimev }
      );
    }

    // Fallback to standard (should not reach here)
    const sender = new StandardClient(this.connection);
    return sender.sendTransaction(
      tx,
      wallet,
      priorityFeeSol,
      tipAmountSol,
      false,
      { preflightCommitment: 'processed' }
    );
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

  private chooseProvider(provided?: 'ASTRALANE' | 'NOZOMI' | 'JITO', tipAmountSol?: number): 'ASTRALANE' | 'NOZOMI' | 'JITO' | undefined {
    const tip = tipAmountSol || 0;
    // Always use standard sender if no tip provided
    if (tip <= 0) return undefined;
    // If explicitly provided, respect it (now that we know a tip is present)
    if (provided === Providers.ASTRALANE || provided === Providers.NOZOMI || provided === Providers.JITO) return provided;
    // Threshold-based routing when sender not provided:
    // - <= 0.001 goes Astralane (min 0.00001)
    // - >= 0.001 goes Nozomi (min 0.001)
    // - Below 0.001: choose Astralane by default for lower tips.
    if (tip >= 0.001) return Providers.NOZOMI;
    return Providers.ASTRALANE;
  }

  private chooseRegion(provider?: 'ASTRALANE' | 'NOZOMI' | 'JITO', desiredRegion?: string): string | undefined {
    if (!provider) return undefined;
    const map = provider === Providers.NOZOMI
      ? NOZOMI_REGIONS
      : provider === Providers.ASTRALANE
      ? ASTRALANE_REGIONS
      : JITO_REGIONS;
    const entries = Object.keys(map);
    if (!entries.length) return undefined;
    if (desiredRegion) {
      const key = desiredRegion.toUpperCase();
      if (map[key]) return key;
    }
    const idx = Math.floor(Math.random() * entries.length);
    return entries[idx];
  }

  private computeProviderTip(provider: 'ASTRALANE' | 'NOZOMI' | 'JITO', userTip: number): { tipAddress: PublicKey; finalTip: number } {
    const list = provider === Providers.NOZOMI
      ? NOZOMI_TIP_ADDRESSES
      : provider === Providers.ASTRALANE
      ? ASTRALANE_TIP_ADDRESSES
      : JITO_TIP_ADDRESSES;
    const min = provider === Providers.NOZOMI
      ? NOZOMI_MIN_TIP_SOL
      : provider === Providers.ASTRALANE
      ? ASTRALANE_MIN_TIP_SOL
      : JITO_MIN_TIP_SOL;
    const finalTip = Math.max(userTip || 0, min);
    const addr = list[Math.floor(Math.random() * list.length)];
    return { tipAddress: new PublicKey(addr), finalTip };
  }
}


