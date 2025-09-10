import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import BN from 'bn.js';
import AmmImpl from '@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm';
import fs from 'fs';
import path from 'path';
import { mints } from '../../helpers/constants';

export class MeteoraDammV1Client {
  private readonly connection: Connection;
  private static CACHE_TTL_MS_DEFAULT = 5 * 60 * 1000;
  private static pairCache: Map<string, { data: any[]; loadedAt: number }> = new Map();

  constructor(connection: Connection) {
    this.connection = connection;
  }

  private static getCacheTtlMs(): number {
    const fromEnv = Number(process.env.PAIRS_CACHE_TTL_MS);
    return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : MeteoraDammV1Client.CACHE_TTL_MS_DEFAULT;
  }

  private static getPairCacheKey(a: string, b: string): string {
    const [x, y] = [a, b].sort();
    return `${x}-${y}`;
  }

  private static getPairCacheFile(pairKey: string): string {
    return path.resolve(process.cwd(), '.cache', `damm_v1_pools_${pairKey}.json`);
  }

  private async fetchPoolsForTokenPair(tokenMint: string, otherMint: string): Promise<any[]> {
    const now = Date.now();
    const pairKey = MeteoraDammV1Client.getPairCacheKey(tokenMint, otherMint);
    const mem = MeteoraDammV1Client.pairCache.get(pairKey);
    if (mem && now - mem.loadedAt < MeteoraDammV1Client.getCacheTtlMs()) return mem.data;

    // Try disk cache
    const cacheFile = MeteoraDammV1Client.getPairCacheFile(pairKey);
    try {
      const stat = fs.existsSync(cacheFile) ? fs.statSync(cacheFile) : null;
      if (stat && now - stat.mtimeMs < MeteoraDammV1Client.getCacheTtlMs()) {
        const txt = fs.readFileSync(cacheFile, 'utf8');
        const data = JSON.parse(txt);
        if (Array.isArray(data)) {
          MeteoraDammV1Client.pairCache.set(pairKey, { data, loadedAt: now });
          return data;
        }
      }
    } catch {}

    // Fetch using include_token_mints (token + WSOL), one call only
    const base = 'https://damm-api.meteora.ag/pools/search';
    const qs = `page=0&size=300&pool_type=dynamic&include_token_mints=${encodeURIComponent(tokenMint)}&include_token_mints=${encodeURIComponent(otherMint)}`;
    const res = await fetch(`${base}?${qs}`, { method: 'GET' });
    if (!res.ok) throw new Error(`DAMM v1 API status ${res.status}`);
    const json: any = await res.json();
    const items: any[] = Array.isArray(json?.data) ? json.data : [];

    MeteoraDammV1Client.pairCache.set(pairKey, { data: items, loadedAt: now });
    try {
      const dir = path.dirname(cacheFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(cacheFile, JSON.stringify(items));
    } catch {}
    return items;
  }

  private async findPoolAddressForMint(mint: PublicKey): Promise<PublicKey> {
    const token = mint.toBase58();
    const wsol = mints.WSOL;
    const items = await this.fetchPoolsForTokenPair(token, wsol);
    // Subset by exact mints (pool_token_mints contains 2 mints)
    const subset = items.filter((it: any) => Array.isArray(it.pool_token_mints) && it.pool_token_mints.length === 2 && (
      (it.pool_token_mints[0] === token && it.pool_token_mints[1] === wsol) ||
      (it.pool_token_mints[1] === token && it.pool_token_mints[0] === wsol)
    ));
    if (subset.length === 0) throw new Error('Meteora DAMM v1 pool for mint-WSOL not found');
    // Pick highest token-side usd amount if available, else tvl
    const best = subset.reduce((acc: any, it: any) => {
      const idx = it.pool_token_mints[0] === token ? 0 : 1;
      const tokenUsd = parseFloat(it.pool_token_usd_amounts?.[idx] ?? '0') || 0;
      const tvl = parseFloat(it.pool_tvl ?? '0') || 0;
      const score = tokenUsd > 0 ? tokenUsd : tvl;
      if (!acc || score > acc.score) return { address: it.pool_address, score };
      return acc;
    }, null);
    if (!best?.address) throw new Error('Meteora DAMM v1 pool address not found');
    return new PublicKey(best.address);
  }

  private stripNonEssentialInstructions(ixs: TransactionInstruction[]): TransactionInstruction[] {
    return ixs.filter(ix => !ix.programId.equals(ComputeBudgetProgram.programId));
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;
    const poolAddress = await this.findPoolAddressForMint(mintAddress);
    const pool = await AmmImpl.create(this.connection as any, poolAddress);

    const swapAtoB = new PublicKey(pool.tokenAMint.address).toBase58() === mints.WSOL; // A=WSOL -> buy B
    const inAmount = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));
    const inMint = new PublicKey(swapAtoB ? pool.tokenAMint.address : pool.tokenBMint.address);
    const quote = pool.getSwapQuote(inMint, inAmount, Math.max(1, Math.min(100, Math.round(slippage * 100))));

    const tx = await pool.swap(wallet, inMint, inAmount, quote.minSwapOutAmount);
    return this.stripNonEssentialInstructions((tx as any).instructions as TransactionInstruction[]);
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;
    const poolAddress = await this.findPoolAddressForMint(mintAddress);
    const pool = await AmmImpl.create(this.connection as any, poolAddress);

    const sellingX = new PublicKey(pool.tokenAMint.address).toBase58() === mintAddress.toBase58();
    const decimals = sellingX ? pool.tokenAMint.decimals : pool.tokenBMint.decimals;
    const inAmount = new BN(Math.round(tokenAmount * Math.pow(10, decimals)));
    const inMint = new PublicKey(sellingX ? pool.tokenAMint.address : pool.tokenBMint.address);
    const quote = pool.getSwapQuote(inMint, inAmount, Math.max(1, Math.min(100, Math.round(slippage * 100))));

    const tx = await pool.swap(wallet, inMint, inAmount, quote.minSwapOutAmount);
    return this.stripNonEssentialInstructions((tx as any).instructions as TransactionInstruction[]);
  }
}

// code here