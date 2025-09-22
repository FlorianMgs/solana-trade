import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { CpAmm, getTokenDecimals, getTokenProgram } from '@meteora-ag/cp-amm-sdk';
import { mints } from '../../helpers/constants';
import { findDammV2PoolAddress } from './pool-utils';

// pool discovery moved to pool-utils

export class MeteoraDammV2Client {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // discovery moved to pool-utils

  private stripNonEssentialInstructions(ixs: TransactionInstruction[]): TransactionInstruction[] {
    return ixs.filter(ix => !ix.programId.equals(ComputeBudgetProgram.programId));
  }

  private toPercentFromFraction(slippage: number): number {
    // input slippage in [0,1]; convert to percent in [0,100]
    const pct = Math.max(0, Math.min(100, slippage * 100));
    // round to 2 decimals per SDK note
    return Math.round(pct * 100) / 100;
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage, poolAddress } = params;
    const poolPk = poolAddress ?? await findDammV2PoolAddress(mintAddress);
    const sdk = new CpAmm(this.connection);
    const poolState = await sdk.fetchPoolState(poolPk);

    // Validate mint-WSOL pair
    const tokenAMint = poolState.tokenAMint as PublicKey;
    const tokenBMint = poolState.tokenBMint as PublicKey;
    const pair = [tokenAMint.toBase58(), tokenBMint.toBase58()];
    if (!pair.includes(mintAddress.toBase58()) || !pair.includes(mints.WSOL)) {
      throw new Error('Incompatible poolAddress for DAMM v2: expected token-WSOL pair');
    }

    const tokenADecimalP = getTokenDecimals(this.connection as any, tokenAMint);
    const tokenBDecimalP = getTokenDecimals(this.connection as any, tokenBMint);
    const [tokenADecimal, tokenBDecimal] = await Promise.all([tokenADecimalP, tokenBDecimalP]);

    const inAmount = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));
    const wsol = new PublicKey(mints.WSOL);
    const inputIsA = tokenAMint.equals(wsol);
    const inputTokenMint = inputIsA ? tokenAMint : tokenBMint;
    const outputTokenMint = inputIsA ? tokenBMint : tokenAMint;

    const currentSlot = await this.connection.getSlot();
    const currentTime = Math.floor(Date.now() / 1000);
    const quote = sdk.getQuote({
      inAmount,
      inputTokenMint,
      slippage: this.toPercentFromFraction(slippage),
      poolState,
      currentTime,
      currentSlot,
      tokenADecimal,
      tokenBDecimal,
    });

    const tokenAProgram = getTokenProgram(poolState.tokenAFlag);
    const tokenBProgram = getTokenProgram(poolState.tokenBFlag);

    const tx = await sdk.swap({
      payer: wallet,
      pool: poolPk,
      inputTokenMint,
      outputTokenMint,
      amountIn: inAmount,
      minimumAmountOut: quote.minSwapOutAmount,
      tokenAVault: poolState.tokenAVault,
      tokenBVault: poolState.tokenBVault,
      tokenAMint,
      tokenBMint,
      tokenAProgram,
      tokenBProgram,
      referralTokenAccount: null,
    });

    return this.stripNonEssentialInstructions(tx.instructions as TransactionInstruction[]);
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage, poolAddress } = params;
    const poolPk = poolAddress ?? await findDammV2PoolAddress(mintAddress);
    const sdk = new CpAmm(this.connection);
    const poolState = await sdk.fetchPoolState(poolPk);

    const tokenAMint = poolState.tokenAMint as PublicKey;
    const tokenBMint = poolState.tokenBMint as PublicKey;
    const pair = [tokenAMint.toBase58(), tokenBMint.toBase58()];
    if (!pair.includes(mintAddress.toBase58()) || !pair.includes(mints.WSOL)) {
      throw new Error('Incompatible poolAddress for DAMM v2: expected token-WSOL pair');
    }

    const tokenADecimalP = getTokenDecimals(this.connection as any, tokenAMint);
    const tokenBDecimalP = getTokenDecimals(this.connection as any, tokenBMint);
    const [tokenADecimal, tokenBDecimal] = await Promise.all([tokenADecimalP, tokenBDecimalP]);

    const sellingIsA = tokenAMint.equals(mintAddress);
    const decimalsIn = sellingIsA ? tokenADecimal : tokenBDecimal;
    const inAmount = new BN(Math.round(tokenAmount * Math.pow(10, decimalsIn)));

    const inputTokenMint = sellingIsA ? tokenAMint : tokenBMint;
    const outputTokenMint = sellingIsA ? tokenBMint : tokenAMint; // should be WSOL side

    const currentSlot = await this.connection.getSlot();
    const currentTime = Math.floor(Date.now() / 1000);
    const quote = sdk.getQuote({
      inAmount,
      inputTokenMint,
      slippage: this.toPercentFromFraction(slippage),
      poolState,
      currentTime,
      currentSlot,
      tokenADecimal,
      tokenBDecimal,
    });

    const tokenAProgram = getTokenProgram(poolState.tokenAFlag);
    const tokenBProgram = getTokenProgram(poolState.tokenBFlag);

    const tx = await sdk.swap({
      payer: wallet,
      pool: poolPk,
      inputTokenMint,
      outputTokenMint,
      amountIn: inAmount,
      minimumAmountOut: quote.minSwapOutAmount,
      tokenAVault: poolState.tokenAVault,
      tokenBVault: poolState.tokenBVault,
      tokenAMint,
      tokenBMint,
      tokenAProgram,
      tokenBProgram,
      referralTokenAccount: null,
    });

    return this.stripNonEssentialInstructions(tx.instructions as TransactionInstruction[]);
  }
}
