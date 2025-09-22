import { Connection, PublicKey } from '@solana/web3.js';
import { buildWhirlpoolClient, WhirlpoolContext } from '@orca-so/whirlpools-sdk/dist';
import { Percentage, ReadOnlyWallet } from '@orca-so/common-sdk/dist';
import { PROGRAM_IDS_PUBLIC_KEYS } from '../../helpers/program-ids';
import { makePairKey, readPair, writePair, readGlobal, writeGlobal } from '../../helpers/disk-cache';

export function buildWhirlpoolSdk(connection: Connection, owner?: PublicKey) {
	const programId = PROGRAM_IDS_PUBLIC_KEYS.ORCA_WHIRLPOOL_PROGRAM_ID as unknown as PublicKey;
	const wallet = new ReadOnlyWallet(owner);
	const ctx = WhirlpoolContext.from(connection, wallet as any, programId, undefined, undefined, {
		accountResolverOptions: { createWrappedSolAccountMethod: 'ata', allowPDAOwnerAddress: true },
	});
	return buildWhirlpoolClient(ctx);
}

export async function resolveWhirlpoolForPair(connection: Connection, tokenMint: PublicKey, wsol: PublicKey): Promise<PublicKey> {
	const token = tokenMint.toBase58();
	const wsolB58 = wsol.toBase58();
	const pairKey = makePairKey(token, wsolB58);
	const pairCached = readPair('orca_whirlpool', pairKey);
	if (pairCached?.address) return new PublicKey(pairCached.address);

	let global = readGlobal('orca_whirlpool');
	if (!global) {
		try {
			const url = 'https://api.mainnet.orca.so/v1/whirlpool/list';
			const res = await fetch(url, { method: 'GET' });
			if (res.ok) {
				const json: any = await res.json();
				const items: any[] = Array.isArray(json) ? json : json?.whirlpools || json?.pools || json?.data || [];
				writeGlobal('orca_whirlpool', items);
				global = items;
			}
		} catch {}
	}
	const items = (global ?? []) as any[];
	const subset = items.filter((it: any) => {
		const a = it?.tokenA?.mint || it?.tokenMintA || it?.mintA;
		const b = it?.tokenB?.mint || it?.tokenMintB || it?.mintB;
		return ((a === token && b === wsolB58) || (b === token && a === wsolB58));
	});
	if (subset.length === 0) throw new Error('Orca Whirlpool pool for mint-WSOL not found');
	const best = subset.reduce((acc: any, it: any) => {
		const liqRaw = it?.liquidity ?? it?.tvl ?? it?.tvlUsd;
		const liq = typeof liqRaw === 'string' ? parseFloat(liqRaw) : Number(liqRaw ?? 0);
		if (!acc || liq > acc.score) return { address: it?.address || it?.whirlpoolAddress || it?.poolAddress, score: liq };
		return acc;
	}, null as null | { address: string; score: number });
	if (!best?.address) throw new Error('Orca Whirlpool pool address not found');
	writePair('orca_whirlpool', pairKey, best.address);
	return new PublicKey(best.address);
}

export const OrcaPercentage = Percentage;


