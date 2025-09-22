import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { CpAmm, getTokenDecimals, getTokenProgram } from '@meteora-ag/cp-amm-sdk';
import { mints } from '../../helpers/constants';
import { makePairKey, readPair, writePair, readGlobal, writeGlobal } from '../../helpers/disk-cache';
import { roundLamports } from '../../helpers/price';
import { MarketPriceResult } from '../../interfaces/price';

type DammV2Pool = { pool_address: string; token_a_mint: string; token_b_mint: string; token_a_amount?: number | string; token_b_amount?: number | string; liquidity?: string | number; tvl?: number | string };

async function fetchAllPoolsPaginated(): Promise<DammV2Pool[]> {
	const base = 'https://dammv2-api.meteora.ag/pools';
	const limit = 500;
	let offset = 0;
	const results: DammV2Pool[] = [];
	while (true) {
		const res = await fetch(`${base}?limit=${limit}&offset=${offset}`, { method: 'GET' });
		if (!res.ok) break;
		const json: any = await res.json();
		const batch: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
		if (batch.length === 0) break;
		results.push(...batch as DammV2Pool[]);
		if (batch.length < limit) break;
		offset += limit;
	}
	const map = new Map<string, DammV2Pool>();
	for (const it of results) if ((it as any)?.pool_address) map.set((it as any).pool_address, it);
	return Array.from(map.values());
}

function chooseBestPool(items: DammV2Pool[], targetMint: string, wsolMint: string): DammV2Pool | null {
	const subset = items.filter((it) => {
		const mx = (it as any)?.token_a_mint; const my = (it as any)?.token_b_mint;
		return !!mx && !!my && ((mx === targetMint && my === wsolMint) || (my === targetMint && mx === wsolMint));
	});
	if (subset.length === 0) return null;
	const best = subset.reduce((acc: any, it: DammV2Pool) => {
		const tokenIsA = (it as any).token_a_mint === targetMint;
		const tokenReserveRaw = tokenIsA ? (it as any).token_a_amount : (it as any).token_b_amount;
		const tokenReserve = typeof tokenReserveRaw === 'string' ? parseFloat(tokenReserveRaw) : Number(tokenReserveRaw ?? 0);
		const tvlRaw = (it as any).tvl ?? (it as any).liquidity;
		const tvl = typeof tvlRaw === 'string' ? parseFloat(tvlRaw) : Number(tvlRaw ?? 0);
		const score = tokenReserve > 0 ? tokenReserve : tvl;
		if (!acc || score > acc.score) return { it, score };
		return acc;
	}, null as null | { it: DammV2Pool; score: number });
	return best?.it ?? null;
}

async function findPoolAddressForMint(mint: PublicKey): Promise<PublicKey> {
	const token = mint.toBase58();
	const wsol = mints.WSOL;
	const pairKey = makePairKey(token, wsol);
	const cached = readPair('damm_v2', pairKey);
	if (cached?.address) return new PublicKey(cached.address);

	let global = readGlobal('damm_v2');
	if (!global) {
		try {
			global = await fetchAllPoolsPaginated();
			writeGlobal('damm_v2', global);
		} catch { global = null }
	}
	if (global) {
		const best = chooseBestPool(global as DammV2Pool[], token, wsol);
		if (best?.pool_address) {
			writePair('damm_v2', pairKey, best.pool_address);
			return new PublicKey(best.pool_address);
		}
	}

	// Fallback: direct query by pair
	const res = await fetch(`https://dammv2-api.meteora.ag/pools?token_a_mint=${encodeURIComponent(token)}&token_b_mint=${encodeURIComponent(wsol)}&limit=300`, { method: 'GET' });
	const json: any = await res.json();
	const items: DammV2Pool[] = Array.isArray(json?.data) ? json.data : [];
	const best = chooseBestPool(items, token, wsol);
	if (!best?.pool_address) throw new Error('Meteora DAMM v2 pool for mint-WSOL not found');
	writePair('damm_v2', pairKey, best.pool_address);
	return new PublicKey(best.pool_address);
}

export async function getMeteoraDammV2Price(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const poolPk = await findPoolAddressForMint(mint);
	const sdk = new CpAmm(connection);
	const poolState = await sdk.fetchPoolState(poolPk);
	const tokenAMint = poolState.tokenAMint as PublicKey;
	const tokenBMint = poolState.tokenBMint as PublicKey;
	const pair = [tokenAMint.toBase58(), tokenBMint.toBase58()];
	if (!pair.includes(mint.toBase58()) || !pair.includes(mints.WSOL)) throw new Error('Incompatible poolAddress for DAMM v2: expected token-WSOL pair');

	const tokenADecimalP = getTokenDecimals(connection as any, tokenAMint);
	const tokenBDecimalP = getTokenDecimals(connection as any, tokenBMint);
	const [tokenADecimal, tokenBDecimal] = await Promise.all([tokenADecimalP, tokenBDecimalP]);

	const sellingIsA = tokenAMint.equals(mint);
	const decimalsIn = sellingIsA ? tokenADecimal : tokenBDecimal;
	const inAmount = new BN(Math.round(Math.pow(10, decimalsIn)));
	const inputTokenMint = sellingIsA ? tokenAMint : tokenBMint;

	const currentSlot = await connection.getSlot();
	const currentTime = Math.floor(Date.now() / 1000);
	const quote = sdk.getQuote({
		inAmount,
		inputTokenMint,
		slippage: 0,
		poolState,
		currentTime,
		currentSlot,
		tokenADecimal,
		tokenBDecimal,
	});

	const lamportsPerToken = roundLamports(Math.max(0, Number(quote.minSwapOutAmount.toString?.() ?? quote.minSwapOutAmount)));
	return { lamportsPerToken, bondingCurvePercent: null };
}


