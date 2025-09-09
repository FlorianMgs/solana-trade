import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import {
  PumpSdk,
  getBuyTokenAmountFromSolAmount,
  getSellSolAmountFromTokenAmount,
} from '@pump-fun/pump-sdk';

import { BuyParams, SellParams } from '../../interfaces/markets';

/**
 * PumpFunClient wraps Pump SDK to produce buy/sell instructions with simple params.
 */
export class PumpFunClient {
  private readonly connection: Connection;
  private readonly sdk: PumpSdk;

  constructor(connection: Connection) {
    this.connection = connection;
    this.sdk = new PumpSdk(connection);
  }

  /**
   * Build buy instructions for a given mint and user.
   */
  async getBuyInstructions(params: BuyParams): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;

    const sdkSlippagePercent = this.normalizeSlippagePercent(slippage);
    const global = await this.sdk.fetchGlobal();
    const { bondingCurveAccountInfo, bondingCurve, associatedUserAccountInfo } = await this.sdk.fetchBuyState(mintAddress, wallet);

    const solAmountLamports = this.toLamportsBN(solAmount);

    const tokenAmount = getBuyTokenAmountFromSolAmount({
      global,
      feeConfig: null,
      mintSupply: bondingCurve.tokenTotalSupply,
      bondingCurve,
      amount: solAmountLamports,
    });

    return await this.sdk.buyInstructions({
      global,
      bondingCurveAccountInfo,
      bondingCurve,
      associatedUserAccountInfo,
      mint: mintAddress,
      user: wallet,
      solAmount: solAmountLamports,
      amount: tokenAmount,
      slippage: sdkSlippagePercent,
    });
  }

  /**
   * Build sell instructions for a given mint and user.
   */
  async getSellInstructions(params: SellParams): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;

    const sdkSlippagePercent = this.normalizeSlippagePercent(slippage);
    const global = await this.sdk.fetchGlobal();
    const { bondingCurveAccountInfo, bondingCurve } = await this.sdk.fetchSellState(mintAddress, wallet);

    const tokenAmountBaseUnits = this.toTokenBaseUnitsBN(tokenAmount);

    const solAmountLamports = getSellSolAmountFromTokenAmount({
      global,
      feeConfig: null,
      mintSupply: bondingCurve.tokenTotalSupply,
      bondingCurve,
      amount: tokenAmountBaseUnits,
    });

    return await this.sdk.sellInstructions({
      global,
      bondingCurveAccountInfo,
      bondingCurve,
      mint: mintAddress,
      user: wallet,
      amount: tokenAmountBaseUnits,
      solAmount: solAmountLamports,
      slippage: sdkSlippagePercent,
    });
  }

  private toLamportsBN(sol: number): BN {
    if (!Number.isFinite(sol) || sol < 0) throw new Error('solAmount must be a non-negative finite number');
    return new BN(Math.round(sol * LAMPORTS_PER_SOL));
  }

  // PumpFun tokens use 6 decimals
  private toTokenBaseUnitsBN(tokens: number): BN {
    if (!Number.isFinite(tokens) || tokens < 0) throw new Error('tokenAmount must be a non-negative finite number');
    return new BN(Math.round(tokens * 1_000_000));
  }

  // SDK expects slippage in percent units (1 => 1%)
  private normalizeSlippagePercent(fraction: number): number {
    if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1) {
      throw new Error('slippage must be between 0 and 1');
    }
    const percent = Math.round(fraction * 100);
    return Math.max(0, Math.min(100, percent));
  }
}


