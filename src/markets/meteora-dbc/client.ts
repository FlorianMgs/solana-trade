import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { DynamicBondingCurveClient, getCurrentPoint } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { mints } from '../../helpers/constants';
import { resolveDbcPoolByBaseMint, resolveDbcPoolById } from './pool-utils';

export class MeteoraDbcClient {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  private stripNonEssentialInstructions(ixs: TransactionInstruction[]): TransactionInstruction[] {
    return ixs.filter(ix => !ix.programId.equals(ComputeBudgetProgram.programId));
  }

  private toBpsFromFraction(slippage: number): number {
    // input slippage in [0,1]; convert to basis points [0,10000]
    const bps = Math.max(0, Math.min(10000, Math.round(slippage * 10000)));
    return bps;
  }

  // pool discovery moved to pool-utils

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage, poolAddress } = params;
    const resolved = poolAddress
      ? await resolveDbcPoolById(this.connection, poolAddress)
      : await resolveDbcPoolByBaseMint(this.connection, mintAddress);
    const { poolAddress: poolId, virtualPool, poolConfig } = resolved;
    const dbc = new DynamicBondingCurveClient(this.connection, 'processed');

    const amountIn = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));
    const swapBaseForQuote = false; // quote(SOL) -> base(token)
    const currentPoint = await getCurrentPoint(this.connection as any, poolConfig.activationType);

    const quote = await dbc.pool.swapQuote({
      virtualPool,
      config: poolConfig,
      swapBaseForQuote,
      amountIn,
      slippageBps: this.toBpsFromFraction(slippage),
      hasReferral: false,
      currentPoint,
    });

    const tx = await dbc.pool.swap({
      owner: wallet,
      amountIn,
      minimumAmountOut: quote.minimumAmountOut,
      swapBaseForQuote,
      pool: poolId,
      referralTokenAccount: null,
      payer: wallet,
    });

    return this.stripNonEssentialInstructions(tx.instructions as TransactionInstruction[]);
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage, poolAddress } = params;
    const resolved = poolAddress
      ? await resolveDbcPoolById(this.connection, poolAddress)
      : await resolveDbcPoolByBaseMint(this.connection, mintAddress);
    const { poolAddress: poolId, virtualPool, poolConfig } = resolved;
    const dbc = new DynamicBondingCurveClient(this.connection, 'processed');

    const baseDecimals: number = Number(poolConfig.tokenDecimal ?? 6);
    const amountIn = new BN(Math.round(tokenAmount * Math.pow(10, baseDecimals)));
    const swapBaseForQuote = true; // base(token) -> quote(SOL)
    const currentPoint = await getCurrentPoint(this.connection as any, poolConfig.activationType);

    const quote = await dbc.pool.swapQuote({
      virtualPool,
      config: poolConfig,
      swapBaseForQuote,
      amountIn,
      slippageBps: this.toBpsFromFraction(slippage),
      hasReferral: false,
      currentPoint,
    });

    const tx = await dbc.pool.swap({
      owner: wallet,
      amountIn,
      minimumAmountOut: quote.minimumAmountOut,
      swapBaseForQuote,
      pool: poolId,
      referralTokenAccount: null,
      payer: wallet,
    });

    return this.stripNonEssentialInstructions(tx.instructions as TransactionInstruction[]);
  }
}
