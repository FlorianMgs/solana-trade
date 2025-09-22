import { Connection, PublicKey } from '@solana/web3.js';
import { mints } from '../../helpers/constants';
import { makePairKey, readPair, writePair } from '../../helpers/disk-cache';

export async function findDammV1PoolAddress(connection: Connection, mint: PublicKey): Promise<PublicKey> {
	const token = mint.toBase58();
	const wsol = mints.WSOL;
	const pairKey = makePairKey(token, wsol);
	const cached = readPair('damm_v1', pairKey);
	if (cached?.address) return new PublicKey(cached.address);
	const base = 'https://damm-api.meteora.ag/pools/search';
	const qs = `page=0&size=300&pool_type=dynamic&include_token_mints=${encodeURIComponent(token)}&include_token_mints=${encodeURIComponent(wsol)}`;
	const res = await fetch(`${base}?${qs}`, { method: 'GET' });
	if (!res.ok) throw new Error(`DAMM v1 API status ${res.status}`);
	const json: any = await res.json();
	const items: any[] = Array.isArray(json?.data) ? json.data : [];
	const subset = items.filter((it: any) => Array.isArray(it.pool_token_mints) && it.pool_token_mints.length === 2 && ((it.pool_token_mints[0] === token && it.pool_token_mints[1] === wsol) || (it.pool_token_mints[1] === token && it.pool_token_mints[0] === wsol)));
	if (subset.length === 0) throw new Error('Meteora DAMM v1 pool for mint-WSOL not found');
	const best = subset.reduce((acc: any, it: any) => {
		const idx = it.pool_token_mints[0] === token ? 0 : 1;
		const tokenUsd = parseFloat(it.pool_token_usd_amounts?.[idx] ?? '0') || 0;
		const tvl = parseFloat(it.pool_tvl ?? '0') || 0;
		const score = tokenUsd > 0 ? tokenUsd : tvl;
		if (!acc || score > acc.score) return { address: it.pool_address, score };
		return acc;
	}, null);
	if (!best?.address) throw new Error('Meteora DAMM v1 pool address not found');
	writePair('damm_v1', pairKey, best.address);
	return new PublicKey(best.address);
}


