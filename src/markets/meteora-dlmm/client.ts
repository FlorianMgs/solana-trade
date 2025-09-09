import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import BN from 'bn.js';
import DLMM from '@meteora-ag/dlmm';
import { mints } from '../../helpers/constants';
import fs from 'fs';
import path from 'path';

export class MeteoraDlmmClient {
  private readonly connection: Connection;
  private static pairCache: Map<string, string> = new Map(); // key: tokenMint:WSOL -> lbPair address
  private static cacheLoadedAt = 0;
  private static CACHE_TTL_MS_DEFAULT = 5 * 60 * 1000;
  private static rawPairs: any[] = [];
  private static rawLoadedAt = 0;
  private static CACHE_FILE = path.resolve(process.cwd(), '.cache', 'dlmm_pairs.json');

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // For DLMM we require the pool (lb pair) address. We infer it via helper or expect mint+WSOL pair in known LB pairs list.
  // Minimal approach: discover by scanning DLMM program filters is heavy; here we accept a mint and try to use DLMM token metadata to resolve pool via API.
  // If not resolvable via API, user should pass the canonical LB pair address in mintAddress param.

  private async getDlmmPoolForMint(mint: PublicKey): Promise<DLMM> {
    const pair = await this.findMintWsolPair(mint);
    return await DLMM.create(this.connection, pair);
  }

  private normalizeKey(a: string, b: string): string {
    return `${a}:${b}`;
  }

  private static getCacheTtlMs(): number {
    const fromEnv = Number(process.env.PAIRS_CACHE_TTL_MSCACHE_TTL_MS);
    return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : MeteoraDlmmClient.CACHE_TTL_MS_DEFAULT;
  }

  private async ensureRawPairs(): Promise<any[]> {
    const now = Date.now();
    // try memory first
    if (now - MeteoraDlmmClient.rawLoadedAt < MeteoraDlmmClient.getCacheTtlMs() && MeteoraDlmmClient.rawPairs.length > 0) return MeteoraDlmmClient.rawPairs;
    // then disk cache
    try {
      const stat = fs.existsSync(MeteoraDlmmClient.CACHE_FILE) ? fs.statSync(MeteoraDlmmClient.CACHE_FILE) : null;
      if (stat && now - stat.mtimeMs < MeteoraDlmmClient.getCacheTtlMs()) {
        const txt = fs.readFileSync(MeteoraDlmmClient.CACHE_FILE, 'utf8');
        const data = JSON.parse(txt);
        if (Array.isArray(data)) {
          MeteoraDlmmClient.rawPairs = data;
          MeteoraDlmmClient.rawLoadedAt = now;
          return MeteoraDlmmClient.rawPairs;
        }
      }
    } catch {}
    // network fetch
    const res = await fetch('https://dlmm-api.meteora.ag/pair/all', { method: 'GET' });
    if (!res.ok) throw new Error(`DLMM API status ${res.status}`);
    const json: any = await res.json();
    const items: any[] = Array.isArray(json) ? json : json?.data || json?.rows || [];
    MeteoraDlmmClient.rawPairs = items;
    MeteoraDlmmClient.rawLoadedAt = now;
    // write disk cache (best-effort)
    try {
      const dir = path.dirname(MeteoraDlmmClient.CACHE_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(MeteoraDlmmClient.CACHE_FILE, JSON.stringify(items));
    } catch {}
    return MeteoraDlmmClient.rawPairs;
  }

  private async loadPairsFromApiIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - MeteoraDlmmClient.cacheLoadedAt < MeteoraDlmmClient.getCacheTtlMs() && MeteoraDlmmClient.pairCache.size > 0) return;
    try {
      const items = await this.ensureRawPairs();
      const wsol = mints.WSOL;
      // Single pass over 100k entries; only store mint_x/mint_y pairs that include WSOL
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const mx: string | undefined = it?.mint_x;
        const my: string | undefined = it?.mint_y;
        if (!mx || !my) continue;
        if (mx !== wsol && my !== wsol) continue;
        const other = mx === wsol ? my : mx;
        const address: string | undefined = it?.address;
        if (!other || !address) continue;
        // cache both directions to avoid additional checks later
        MeteoraDlmmClient.pairCache.set(this.normalizeKey(other, wsol), address);
        MeteoraDlmmClient.pairCache.set(this.normalizeKey(wsol, other), address);
      }
      MeteoraDlmmClient.cacheLoadedAt = Date.now();
    } catch (_e) {
      // ignore; fallback to SDK methods
    }
  }

  private async findMintWsolPair(mint: PublicKey): Promise<PublicKey> {
    const token = mint.toBase58();
    const wsol = mints.WSOL;
    const key = this.normalizeKey(token, wsol);

    // Load raw pairs, then filter efficiently and pick highest liquidity token-side
    const items = await this.ensureRawPairs();
    // First pass: subset by exact mints (strict equality)
    const subset = items.filter(it => (it?.mint_x === token && it?.mint_y === wsol) || (it?.mint_y === token && it?.mint_x === wsol));
    if (subset.length > 0) {
      // Second pass: pick with max token-side reserve, fallback to total liquidity
      const best = subset.reduce((acc: any, it: any) => {
        const tokenIsX = it.mint_x === token;
        const tokenReserve = Number(tokenIsX ? it.reserve_x_amount : it.reserve_y_amount) || 0;
        const totalLiq = typeof it.liquidity === 'string' ? parseFloat(it.liquidity) : Number(it.liquidity) || 0;
        const score = tokenReserve > 0 ? tokenReserve : totalLiq;
        if (!acc || score > acc.score) return { address: it.address, score };
        return acc;
      }, null);
      if (best?.address) return new PublicKey(best.address);
    }

    // Fallback to prebuilt cache (if any)
    await this.loadPairsFromApiIfNeeded();
    const cached = MeteoraDlmmClient.pairCache.get(key);
    if (cached) return new PublicKey(cached);

    // Fallback 1: SDK helper for permissionless lb pairs
    let pair = await DLMM.getCustomizablePermissionlessLbPairIfExists(this.connection, new PublicKey(token), new PublicKey(wsol));
    if (!pair) {
      pair = await DLMM.getCustomizablePermissionlessLbPairIfExists(this.connection, new PublicKey(wsol), new PublicKey(token));
    }
    if (pair) return pair;

    // Fallback 2: scan all lb pairs (last resort)
    try {
      const all = await DLMM.getLbPairs(this.connection);
      for (const acc of all) {
        const info: any = acc.account;
        const x: string | undefined = info?.tokenXMint?.toBase58?.();
        const y: string | undefined = info?.tokenYMint?.toBase58?.();
        if (!x || !y) continue;
        if ((x === token && y === wsol) || (y === token && x === wsol)) {
          return acc.publicKey;
        }
      }
    } catch (_e) {}

    throw new Error('Meteora DLMM pool for mint-WSOL not found');
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;
    const dlmmPool = await this.getDlmmPoolForMint(mintAddress);

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

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;
    const dlmmPool = await this.getDlmmPoolForMint(mintAddress);

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
