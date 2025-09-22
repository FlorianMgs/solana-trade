import { Connection, PublicKey } from '@solana/web3.js';
import DLMM from '@meteora-ag/dlmm';
import { mints } from '../../helpers/constants';
import { makePairKey, readPair, writePair, readGlobal, writeGlobal } from '../../helpers/disk-cache';

export async function findDlmmMintWsolPair(connection: Connection, mint: PublicKey): Promise<PublicKey> {
	const token = mint.toBase58();
	const wsol = mints.WSOL;
	const pairKey = makePairKey(token, wsol);
	const pairCached = readPair('dlmm', pairKey);
	if (pairCached?.address) return new PublicKey(pairCached.address);

	let global = readGlobal('dlmm');
	if (!global) {
		try {
			const res = await fetch('https://dlmm-api.meteora.ag/pair/all', { method: 'GET' });
			if (res.ok) {
				const json: any = await res.json();
				const items: any[] = Array.isArray(json) ? json : json?.data || json?.rows || [];
				writeGlobal('dlmm', items);
				global = items;
			}
		} catch {}
	}
	if (global) {
		const items = global as any[];
		const subset = items.filter(it => (it?.mint_x === token && it?.mint_y === wsol) || (it?.mint_y === token && it?.mint_x === wsol));
		if (subset.length > 0) {
			const best = subset.reduce((acc: any, it: any) => {
				const tokenIsX = it.mint_x === token;
				const tokenReserve = Number(tokenIsX ? it.reserve_x_amount : it.reserve_y_amount) || 0;
				const totalLiq = typeof it.liquidity === 'string' ? parseFloat(it.liquidity) : Number(it.liquidity) || 0;
				const score = tokenReserve > 0 ? tokenReserve : totalLiq;
				if (!acc || score > acc.score) return { address: it.address, score };
				return acc;
			}, null);
			if (best?.address) {
				writePair('dlmm', pairKey, best.address);
				return new PublicKey(best.address);
			}
		}
	}

	let pair = await DLMM.getCustomizablePermissionlessLbPairIfExists(connection, new PublicKey(token), new PublicKey(wsol));
	if (!pair) pair = await DLMM.getCustomizablePermissionlessLbPairIfExists(connection, new PublicKey(wsol), new PublicKey(token));
	if (pair) {
		writePair('dlmm', pairKey, pair.toBase58());
		return pair;
	}

	const all = await DLMM.getLbPairs(connection);
	for (const acc of all) {
		const info: any = acc.account;
		const x: string | undefined = info?.tokenXMint?.toBase58?.();
		const y: string | undefined = info?.tokenYMint?.toBase58?.();
		if (!x || !y) continue;
		if ((x === token && y === wsol) || (y === token && x === wsol)) {
			writePair('dlmm', pairKey, acc.publicKey.toBase58());
			return acc.publicKey;
		}
	}

	throw new Error('Meteora DLMM pool for mint-WSOL not found');
}


