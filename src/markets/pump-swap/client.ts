import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { PumpAmmSdk, canonicalPumpPoolPda } from '@pump-fun/pump-swap-sdk';

import { BuyParams, SellParams } from '../../interfaces/markets'; 

/**
 * PumpSwapClient wraps Pump Swap SDK to provide simple buy/sell instruction builders.
 */
export class PumpSwapClient {
  private readonly connection: Connection;
  private readonly sdk: PumpAmmSdk;

  constructor(connection: Connection) {
    this.connection = connection;
    this.sdk = new PumpAmmSdk(this.connection);
  }

  async getBuyInstructions(params: BuyParams): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage, poolAddress } = params;

    const sdkSlippagePercent = this.normalizeSlippagePercent(slippage);
    const poolKey = poolAddress ?? this.getCanonicalPoolKey(mintAddress);
    const swapState = await this.sdk.swapSolanaState(poolKey, wallet);

    const quoteLamports = this.toLamportsBN(solAmount);

    return await this.sdk.buyQuoteInput(swapState, quoteLamports, sdkSlippagePercent);
  }

  async getSellInstructions(params: SellParams): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage, poolAddress } = params;

    const sdkSlippagePercent = this.normalizeSlippagePercent(slippage);
    const poolKey = poolAddress ?? this.getCanonicalPoolKey(mintAddress);
    const swapState = await this.sdk.swapSolanaState(poolKey, wallet);

    const decimals = swapState.baseMintAccount.decimals;
    const baseAmount = this.toBaseUnitsBN(tokenAmount, decimals);

    return await this.sdk.sellBaseInput(swapState, baseAmount, sdkSlippagePercent);
  }

  private getCanonicalPoolKey(mint: PublicKey): PublicKey {
    const [poolKey] = canonicalPumpPoolPda(mint);
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
}


