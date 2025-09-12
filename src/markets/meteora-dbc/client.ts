import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { DynamicBondingCurveClient, getCurrentPoint } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { mints } from '../../helpers/constants';
import { makePairKey, readPair, writePair } from '../../helpers/disk-cache';

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

  private async resolvePoolByBaseMint(baseMint: PublicKey): Promise<{ poolAddress: PublicKey; virtualPool: any; poolConfig: any; }> {
    const token = baseMint.toBase58();
    const wsol = mints.WSOL;
    const pairKey = makePairKey(token, wsol);
    const pairCached = readPair('dbc', pairKey);
    const client = new DynamicBondingCurveClient(this.connection, 'confirmed');
    if (pairCached?.address) {
      const poolAddress = new PublicKey(pairCached.address);
      const virtualPool = await client.state.getPool(poolAddress);
      if (!virtualPool) throw new Error('DBC virtual pool state not found');
      const poolConfig = await client.state.getPoolConfig(virtualPool.config);
      const quoteMintFromConfig = (poolConfig as any)?.quoteMint?.toBase58?.() ?? String((poolConfig as any)?.quoteMint);
      if (quoteMintFromConfig !== mints.WSOL) throw new Error('DBC pool quote mint is not WSOL (SOL)');
      return { poolAddress, virtualPool, poolConfig };
    }

    const programAccount = await client.state.getPoolByBaseMint(baseMint);
    if (!programAccount) throw new Error('DBC pool for base mint not found');

    const poolAddress = (programAccount as any).publicKey as PublicKey;
    const virtualPool = (programAccount as any).account ?? await client.state.getPool(poolAddress);
    if (!virtualPool) throw new Error('DBC virtual pool state not found');

    const poolConfig = await client.state.getPoolConfig(virtualPool.config);

    const quoteMintFromConfig = (poolConfig as any)?.quoteMint?.toBase58?.() ?? String((poolConfig as any)?.quoteMint);
    if (quoteMintFromConfig !== mints.WSOL) {
      throw new Error('DBC pool quote mint is not WSOL (SOL)');
    }

    writePair('dbc', pairKey, poolAddress.toBase58());
    return { poolAddress, virtualPool, poolConfig };
  }

  private async resolvePoolById(poolAddress: PublicKey): Promise<{ poolAddress: PublicKey; virtualPool: any; poolConfig: any; }> {
    const client = new DynamicBondingCurveClient(this.connection, 'confirmed');
    const virtualPool = await client.state.getPool(poolAddress);
    if (!virtualPool) throw new Error('Pool not found for provided poolAddress');
    const poolConfig = await client.state.getPoolConfig(virtualPool.config);
    const quoteMintFromConfig = (poolConfig as any)?.quoteMint?.toBase58?.() ?? String((poolConfig as any)?.quoteMint);
    if (quoteMintFromConfig !== mints.WSOL) throw new Error('Incompatible poolAddress for Meteora DBC: expected WSOL quote');
    return { poolAddress, virtualPool, poolConfig };
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage, poolAddress } = params;
    const resolved = poolAddress
      ? await this.resolvePoolById(poolAddress)
      : await this.resolvePoolByBaseMint(mintAddress);
    const { poolAddress: poolId, virtualPool, poolConfig } = resolved;
    const dbc = new DynamicBondingCurveClient(this.connection, 'confirmed');

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
      ? await this.resolvePoolById(poolAddress)
      : await this.resolvePoolByBaseMint(mintAddress);
    const { poolAddress: poolId, virtualPool, poolConfig } = resolved;
    const dbc = new DynamicBondingCurveClient(this.connection, 'confirmed');

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
