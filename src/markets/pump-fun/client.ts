import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import {
  PumpSdk,
  OnlinePumpSdk,
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
  private readonly onlineSdk: OnlinePumpSdk;

  constructor(connection: Connection) {
    this.connection = connection;
    this.sdk = new PumpSdk();
    this.onlineSdk = new OnlinePumpSdk(connection);
  }

  /**
   * Build buy instructions for a given mint and user.
   */
  async getBuyInstructions(params: BuyParams): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;

    const sdkSlippagePercent = this.normalizeSlippagePercent(slippage);
    const global = await this.onlineSdk.fetchGlobal();
    const { bondingCurveAccountInfo, bondingCurve, associatedUserAccountInfo } = await this.onlineSdk.fetchBuyState(mintAddress, wallet);

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
    const global = await this.onlineSdk.fetchGlobal();
    const { bondingCurveAccountInfo, bondingCurve } = await this.onlineSdk.fetchSellState(mintAddress, wallet);

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
    
    const lamports = sol * LAMPORTS_PER_SOL;
    if (!Number.isFinite(lamports)) {
      throw new Error(`Invalid lamports calculation: sol=${sol}, lamports=${lamports}`);
    }
    
    const roundedLamports = Math.round(lamports);
    if (!Number.isFinite(roundedLamports) || roundedLamports > Number.MAX_SAFE_INTEGER) {
      throw new Error(`Lamports value too large or invalid: ${roundedLamports}`);
    }
    
    return new BN(roundedLamports);
  }

  // PumpFun tokens use 6 decimals
  private toTokenBaseUnitsBN(tokens: number): BN {
    if (!Number.isFinite(tokens) || tokens < 0) throw new Error('tokenAmount must be a non-negative finite number');
    
    const baseUnits = tokens * 1_000_000;
    
    if (!Number.isFinite(baseUnits)) {
      throw new Error(`Invalid token base units calculation: tokens=${tokens}, baseUnits=${baseUnits}`);
    }
    
    const roundedBaseUnits = Math.round(baseUnits);
    
    if (!Number.isFinite(roundedBaseUnits) || roundedBaseUnits > Number.MAX_SAFE_INTEGER) {
      throw new Error(`Token base units value too large or invalid: ${roundedBaseUnits}`);
    }
    
    return new BN(roundedBaseUnits);
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


