import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import BN from 'bn.js';
import AmmImpl from '@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm';
import { mints } from '../../helpers/constants';
import { findDammV1PoolAddress } from './pool-utils';

export class MeteoraDammV1Client {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }



  private stripNonEssentialInstructions(ixs: TransactionInstruction[]): TransactionInstruction[] {
    return ixs.filter(ix => !ix.programId.equals(ComputeBudgetProgram.programId));
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage, poolAddress } = params;
    const resolved = poolAddress ?? await findDammV1PoolAddress(this.connection, mintAddress);
    const pool = await AmmImpl.create(this.connection as any, resolved);

    // Validate pool tokens
    const tokenA = new PublicKey(pool.tokenAMint.address).toBase58();
    const tokenB = new PublicKey(pool.tokenBMint.address).toBase58();
    const m = mintAddress.toBase58();
    if (!([tokenA, tokenB].includes(m) && [tokenA, tokenB].includes(mints.WSOL))) {
      throw new Error('Incompatible poolAddress for DAMM v1: expected token-WSOL pair');
    }

    const swapAtoB = new PublicKey(pool.tokenAMint.address).toBase58() === mints.WSOL; // A=WSOL -> buy B
    const inAmount = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));
    const inMint = new PublicKey(swapAtoB ? pool.tokenAMint.address : pool.tokenBMint.address);
    const quote = pool.getSwapQuote(inMint, inAmount, Math.max(1, Math.min(100, Math.round(slippage * 100))));

    const tx = await pool.swap(wallet, inMint, inAmount, quote.minSwapOutAmount);
    return this.stripNonEssentialInstructions((tx as any).instructions as TransactionInstruction[]);
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage, poolAddress } = params;
    const resolved = poolAddress ?? await findDammV1PoolAddress(this.connection, mintAddress);
    const pool = await AmmImpl.create(this.connection as any, resolved);

    const tokenA = new PublicKey(pool.tokenAMint.address).toBase58();
    const tokenB = new PublicKey(pool.tokenBMint.address).toBase58();
    const m = mintAddress.toBase58();
    if (!([tokenA, tokenB].includes(m) && [tokenA, tokenB].includes(mints.WSOL))) {
      throw new Error('Incompatible poolAddress for DAMM v1: expected token-WSOL pair');
    }

    const sellingX = new PublicKey(pool.tokenAMint.address).toBase58() === mintAddress.toBase58();
    const decimals = sellingX ? pool.tokenAMint.decimals : pool.tokenBMint.decimals;
    const inAmount = new BN(Math.round(tokenAmount * Math.pow(10, decimals)));
    const inMint = new PublicKey(sellingX ? pool.tokenAMint.address : pool.tokenBMint.address);
    const quote = pool.getSwapQuote(inMint, inAmount, Math.max(1, Math.min(100, Math.round(slippage * 100))));

    const tx = await pool.swap(wallet, inMint, inAmount, quote.minSwapOutAmount);
    return this.stripNonEssentialInstructions((tx as any).instructions as TransactionInstruction[]);
  }
}
