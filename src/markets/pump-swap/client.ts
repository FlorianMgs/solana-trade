import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { PumpAmmSdk, OnlinePumpAmmSdk, canonicalPumpPoolPda, PUMP_AMM_PROGRAM_ID } from '@pump-fun/pump-swap-sdk';

import { BuyParams, SellParams } from '../../interfaces/markets'; 

/**
 * PumpSwapClient wraps Pump Swap SDK to provide simple buy/sell instruction builders.
 */
export class PumpSwapClient {
  private readonly connection: Connection;
  private readonly sdk: PumpAmmSdk;
  private readonly onlineSdk: OnlinePumpAmmSdk;

  constructor(connection: Connection) {
    this.connection = connection;
    this.sdk = new PumpAmmSdk();
    this.onlineSdk = new OnlinePumpAmmSdk(this.connection);
  }

  async getBuyInstructions(params: BuyParams): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage, poolAddress } = params;

    const sdkSlippagePercent = this.normalizeSlippagePercent(slippage);
    const poolKey = poolAddress ?? this.getCanonicalPoolKey(mintAddress);

    // Guard: wait until pool decodes to avoid early "invalid account discriminator" errors
    await this.waitForPoolInitialized(poolKey, this.getPoolReadyTimeoutMs());

    const swapState = await this.onlineSdk.swapSolanaState(poolKey, wallet);

    const quoteLamports = this.toLamportsBN(solAmount);

    const instructions = await this.sdk.buyQuoteInput(
      swapState,
      quoteLamports,
      sdkSlippagePercent,
    );

    // 04/11/2025 Forward-compat: enforce pool account writable per PumpSwap program upgrade
    return this.ensurePoolWritable(instructions, poolKey);
  }

  async getSellInstructions(params: SellParams): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage, poolAddress } = params;
    const sdkSlippagePercent = this.normalizeSlippagePercent(slippage);
    const poolKey = poolAddress ?? this.getCanonicalPoolKey(mintAddress);

    // Guard: wait until pool decodes to avoid early "invalid account discriminator" errors
    await this.waitForPoolInitialized(poolKey, this.getPoolReadyTimeoutMs());

    const swapState = await this.onlineSdk.swapSolanaState(poolKey, wallet);

    const decimals = swapState.baseMintAccount.decimals;
    const baseAmount = this.toBaseUnitsBN(tokenAmount, decimals);

    const instructions = await this.sdk.sellBaseInput(
      swapState,
      baseAmount,
      sdkSlippagePercent,
    );

    // Forward-compat: enforce pool account writable per PumpSwap program upgrade
    return this.ensurePoolWritable(instructions, poolKey);
  }

  private getCanonicalPoolKey(mint: PublicKey): PublicKey {
    const poolKey = canonicalPumpPoolPda(mint);
    return poolKey;
  }

  private toLamportsBN(sol: number): BN {
    if (!Number.isFinite(sol) || sol < 0) throw new Error('solAmount must be a non-negative finite number');
    return new BN(Math.round(sol * LAMPORTS_PER_SOL));
  }

  private toBaseUnitsBN(amount: number, decimals: number): BN {
    if (!Number.isFinite(amount) || amount < 0) throw new Error('tokenAmount must be a non-negative finite number');
    const factor = Math.pow(10, decimals);
    return new BN(Math.round(amount * factor));
  }

  private normalizeSlippagePercent(fraction: number): number {
    if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1) {
      throw new Error('slippage must be between 0 and 1');
    }
    const percent = Math.round(fraction * 100);
    return Math.max(0, Math.min(100, percent));
  }

  // Polls until pool is owned by Pump AMM and decodes successfully; prevents invalid discriminator
  private async waitForPoolInitialized(poolKey: PublicKey, timeoutMs: number = 5000, intervalMs: number = 75): Promise<void> {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const accountInfo = await this.connection.getAccountInfo(poolKey);
      if (accountInfo && accountInfo.owner.equals(PUMP_AMM_PROGRAM_ID) && accountInfo.data.length > 8) {
        try {
          // Validate by attempting a decode; if it throws, pool is not ready yet
          this.sdk.decodePool(accountInfo as any);
          return;
        } catch {
          // continue polling
        }
      }
      await new Promise(r => setTimeout(r, intervalMs));
    }
    throw new Error('PumpSwap pool not initialized or mismatched owner');
  }

  // Mutates instruction metas to set the pool account writable (index defined by IDL)
  private ensurePoolWritable(instructions: TransactionInstruction[], poolKey: PublicKey): TransactionInstruction[] {
    for (const ix of instructions) {
      for (const meta of ix.keys) {
        if (meta.pubkey.equals(poolKey)) {
          meta.isWritable = true;
        }
      }
    }
    return instructions;
  }

  // Allow customizing wait timeout via env var PUMPSWAP_POOL_READY_TIMEOUT_MS (ms)
  private getPoolReadyTimeoutMs(): number {
    const raw = process.env.PUMPSWAP_POOL_READY_TIMEOUT_MS;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && n >= 0 ? n : 5000;
  }
}


