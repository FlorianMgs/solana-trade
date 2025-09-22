import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import BN from 'bn.js';
import DLMM from '@meteora-ag/dlmm';
import { mints } from '../../helpers/constants';
import { findDlmmMintWsolPair } from './pool-utils';

export class MeteoraDlmmClient {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // For DLMM we require the pool (lb pair) address. We infer it via helper or expect mint+WSOL pair in known LB pairs list.
  // Minimal approach: discover by scanning DLMM program filters is heavy; here we accept a mint and try to use DLMM token metadata to resolve pool via API.
  // If not resolvable via API, user should pass the canonical LB pair address in mintAddress param.

  private async getDlmmPoolForMint(mint: PublicKey): Promise<DLMM> {
    const pair = await findDlmmMintWsolPair(this.connection, mint);
    return await DLMM.create(this.connection, pair);
  }

  private async getDlmmPoolWithOptionalAddress(mint: PublicKey, poolAddress?: PublicKey): Promise<DLMM> {
    if (poolAddress) {
      try {
        const pool = await DLMM.create(this.connection, poolAddress);
        const tokenXMint = (pool.tokenX.mint as any).address?.toBase58?.() ?? (pool.tokenX.mint as any).toBase58?.();
        const tokenYMint = (pool.tokenY.mint as any).address?.toBase58?.() ?? (pool.tokenY.mint as any).toBase58?.();
        const token = mint.toBase58();
        const wsol = mints.WSOL;
        if (!tokenXMint || !tokenYMint || !([tokenXMint, tokenYMint].includes(token) && [tokenXMint, tokenYMint].includes(wsol))) {
          throw new Error('Incompatible poolAddress for Meteora DLMM: expected token-WSOL pair');
        }
        return pool;
      } catch (e) {
        throw new Error('Pool not found for provided poolAddress');
      }
    }
    return this.getDlmmPoolForMint(mint);
  }

  // discovery moved to pool-utils

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage, poolAddress } = params;
    const dlmmPool = await this.getDlmmPoolWithOptionalAddress(mintAddress, poolAddress);

    const wsolMint = new PublicKey(mints.WSOL).toBase58();
    const isXWsol = (dlmmPool.tokenX.mint as any).address?.toBase58?.() === wsolMint || (dlmmPool.tokenX.mint as any).toBase58?.() === wsolMint;
    const swapForY = isXWsol; // true means X->Y; if X is WSOL, we want X(WSOL)->Y(token)
    const binArrays = await dlmmPool.getBinArrayForSwap(swapForY, 8);

    const inAmount = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));
    const maxFeeBps = new BN(Math.max(0, Math.min(10_000, Math.round(slippage * 10_000))));

    const quote = await dlmmPool.swapQuote(inAmount, swapForY, maxFeeBps, binArrays, false, 3);

    const inToken = isXWsol ? dlmmPool.tokenX.publicKey : dlmmPool.tokenY.publicKey;
    const outToken = isXWsol ? dlmmPool.tokenY.publicKey : dlmmPool.tokenX.publicKey;

    const tx = await dlmmPool.swap({
      inToken,
      binArraysPubkey: quote.binArraysPubkey,
      inAmount,
      lbPair: dlmmPool.pubkey,
      user: wallet,
      minOutAmount: quote.minOutAmount,
      outToken,
    });

    return this.stripNonEssentialInstructions(tx.instructions as TransactionInstruction[]);
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage, poolAddress } = params;
    const dlmmPool = await this.getDlmmPoolWithOptionalAddress(mintAddress, poolAddress);

    const wsolMint = new PublicKey(mints.WSOL).toBase58();
    const isXWsol = (dlmmPool.tokenX.mint as any).address?.toBase58?.() === wsolMint || (dlmmPool.tokenX.mint as any).toBase58?.() === wsolMint;
    // We sell target token for WSOL: if X is WSOL, input is Y; else input is X
    const inputIsX = !isXWsol; // true if tokenX is the target token
    const swapForY = inputIsX; // true means X->Y; when input is X (target), out is WSOL (Y)
    const binArrays = await dlmmPool.getBinArrayForSwap(swapForY, 8);

    const decimalsIn = (inputIsX ? (dlmmPool.tokenX.mint as any) : (dlmmPool.tokenY.mint as any)).decimals ?? 6;
    const inAmount = new BN(Math.round(tokenAmount * Math.pow(10, decimalsIn)));
    const maxFeeBps = new BN(Math.max(0, Math.min(10_000, Math.round(slippage * 10_000))));

    const quote = await dlmmPool.swapQuote(inAmount, swapForY, maxFeeBps, binArrays, false, 3);

    const inToken = inputIsX ? dlmmPool.tokenX.publicKey : dlmmPool.tokenY.publicKey;
    const outToken = inputIsX ? dlmmPool.tokenY.publicKey : dlmmPool.tokenX.publicKey;

    // Follow official recommendation to use swapExactOut for sells when feasible
    // We'll request the quoted out amount and allow a small tolerance for inAmount (equal to computed inAmount)
    const tx = await dlmmPool.swapExactOut({
      inToken,
      outToken,
      outAmount: quote.outAmount, // exact out from quote
      maxInAmount: inAmount, // do not exceed user's specified input
      lbPair: dlmmPool.pubkey,
      user: wallet,
      binArraysPubkey: quote.binArraysPubkey,
    });

    return this.stripNonEssentialInstructions(tx.instructions as TransactionInstruction[]);
  }

  private stripNonEssentialInstructions(ixs: TransactionInstruction[]): TransactionInstruction[] {
    // remove compute budget instructions; builder sets them
    return ixs.filter(ix => !ix.programId.equals(ComputeBudgetProgram.programId));
  }
}
