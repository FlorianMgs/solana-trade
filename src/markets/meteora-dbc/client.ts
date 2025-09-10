import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { getMint } from '@solana/spl-token';
import { mints } from '../../helpers/constants';

export class MeteoraDbcClient {
  private readonly connection: Connection;
  private static CACHE_TTL_MS_DEFAULT = 5 * 60 * 1000;
  private static baseMintToPool: Map<string, { pool: string; loadedAt: number }> = new Map();

  constructor(connection: Connection) {
    this.connection = connection;
  }

  private static getCacheTtlMs(): number {
    const fromEnv = Number(process.env.PAIRS_CACHE_TTL_MS);
    return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : MeteoraDbcClient.CACHE_TTL_MS_DEFAULT;
  }

  private async resolvePoolAddressForBaseMint(baseMint: PublicKey): Promise<PublicKey> {
    const key = baseMint.toBase58();
    const mem = MeteoraDbcClient.baseMintToPool.get(key);
    const now = Date.now();
    if (mem && now - mem.loadedAt < MeteoraDbcClient.getCacheTtlMs()) {
      return new PublicKey(mem.pool);
    }

    // Resolve via SDK helper by base mint
    const client = new DynamicBondingCurveClient(this.connection, 'processed');
    const pa = await client.state.getPoolByBaseMint(baseMint);
    if (!pa) throw new Error('Meteora DBC pool for base mint not found');
    MeteoraDbcClient.baseMintToPool.set(key, { pool: pa.publicKey.toBase58(), loadedAt: now });
    return pa.publicKey as PublicKey;
  }

  private stripNonEssentialInstructions(ixs: TransactionInstruction[]): TransactionInstruction[] {
    return ixs.filter(ix => !ix.programId.equals(ComputeBudgetProgram.programId));
  }

  private toBpsFromFraction(slippage: number): number {
    // input slippage in [0,1]; convert to bps in [0,10000]
    const bps = Math.max(0, Math.min(10000, Math.round(slippage * 10000)));
    return bps;
  }

  private async getCurrentPoint(activationType: number): Promise<BN> {
    // 0: Slot, 1: Timestamp
    if (activationType === 0) {
      const slot = await this.connection.getSlot('confirmed');
      return new BN(slot);
    }
    return new BN(Math.floor(Date.now() / 1000));
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;

    const poolAddress = await this.resolvePoolAddressForBaseMint(mintAddress);
    const client = new DynamicBondingCurveClient(this.connection, 'processed');

    const virtualPoolState = await client.state.getPool(poolAddress);
    if (!virtualPoolState) throw new Error('Meteora DBC pool not found');
    const poolConfigState = await client.state.getPoolConfig(virtualPoolState.config);

    const amountIn = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));
    const swapBaseForQuote = false; // quote (WSOL) -> base (token)
    const slippageBps = this.toBpsFromFraction(slippage);
    const currentPoint = await this.getCurrentPoint(poolConfigState.activationType);

    const quote = await client.pool.swapQuote({
      virtualPool: virtualPoolState,
      config: poolConfigState,
      swapBaseForQuote,
      amountIn,
      slippageBps,
      hasReferral: false,
      currentPoint,
    });

    const tx = await client.pool.swap({
      owner: wallet,
      amountIn,
      minimumAmountOut: quote.minimumAmountOut,
      swapBaseForQuote,
      pool: poolAddress,
      referralTokenAccount: null,
      payer: wallet,
    });

    return this.stripNonEssentialInstructions(tx.instructions as TransactionInstruction[]);
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;

    const poolAddress = await this.resolvePoolAddressForBaseMint(mintAddress);
    const client = new DynamicBondingCurveClient(this.connection, 'processed');

    const virtualPoolState = await client.state.getPool(poolAddress);
    if (!virtualPoolState) throw new Error('Meteora DBC pool not found');
    const poolConfigState = await client.state.getPoolConfig(virtualPoolState.config);

    // Fetch base token decimals directly from mint to avoid extra config reliance
    const mintInfo = await getMint(this.connection, mintAddress);
    const baseDecimals: number = mintInfo.decimals ?? 6;
    const amountIn = new BN(Math.round(tokenAmount * Math.pow(10, baseDecimals)));
    const swapBaseForQuote = true; // base (token) -> quote (WSOL)
    const slippageBps = this.toBpsFromFraction(slippage);
    const currentPoint = await this.getCurrentPoint(poolConfigState.activationType);

    const quote = await client.pool.swapQuote({
      virtualPool: virtualPoolState,
      config: poolConfigState,
      swapBaseForQuote,
      amountIn,
      slippageBps,
      hasReferral: false,
      currentPoint,
    });

    const tx = await client.pool.swap({
      owner: wallet,
      amountIn,
      minimumAmountOut: quote.minimumAmountOut,
      swapBaseForQuote,
      pool: poolAddress,
      referralTokenAccount: null,
      payer: wallet,
    });

    return this.stripNonEssentialInstructions(tx.instructions as TransactionInstruction[]);
  }
}
