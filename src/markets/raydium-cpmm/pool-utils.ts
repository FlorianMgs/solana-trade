import { PublicKey } from '@solana/web3.js';
import { Raydium } from '@raydium-io/raydium-sdk-v2';
import { mints } from '../../helpers/constants';

export async function findCpmmPoolInfo(raydium: Raydium, baseMint: PublicKey) {
	const resp: any = await raydium.api.fetchPoolByMints({ mint1: baseMint.toBase58(), mint2: mints.WSOL, order: 'desc', sort: 'liquidity' });
	const list: any[] = Array.isArray(resp) ? resp : resp?.data || resp?.items || [];
	let target = list.find((p: any) => p?.type === 'Standard' && p?.config && p?.pooltype?.includes('OpenBookMarket') === false);
	if (!target) {
		const pools = await raydium.cpmm.getRpcPoolInfos([]);
		for (const [poolId, info] of Object.entries(pools as Record<string, any>)) {
			if (
				(info.mintA?.toBase58?.() === baseMint.toBase58() && info.mintB?.toBase58?.() === mints.WSOL) ||
				(info.mintB?.toBase58?.() === baseMint.toBase58() && info.mintA?.toBase58?.() === mints.WSOL)
			) {
				const byId = await raydium.api.fetchPoolById({ ids: poolId as string });
				target = (Array.isArray(byId) ? byId[0] : (byId as any)?.[0]) as any;
				if (target) break;
			}
		}
	}
	if (!target) throw new Error('Raydium CPMM pool not found for pair');
	return target;
}

export async function findCpmmPoolInfoById(raydium: Raydium, poolAddress: PublicKey) {
	const resp: any = await raydium.api.fetchPoolById({ ids: poolAddress.toBase58() });
	const list: any[] = Array.isArray(resp) ? resp : resp?.data || resp?.items || [];
	if (!list || list.length === 0) throw new Error('Pool not found for provided poolAddress');
	return list[0];
}

export function assertCpmmHasMintAndWsol(poolInfo: any, mintAddress: PublicKey) {
	const token = mintAddress.toBase58();
	const wsol = new PublicKey(mints.WSOL).toBase58();
	const pair = [poolInfo?.mintA?.address, poolInfo?.mintB?.address];
	if (!pair.includes(token) || !pair.includes(wsol)) {
		throw new Error('Incompatible poolAddress for Raydium CPMM: expected token-WSOL pair');
	}
}


