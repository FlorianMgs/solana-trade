import { PublicKey } from '@solana/web3.js';
import { Raydium } from '@raydium-io/raydium-sdk-v2';
import { mints } from '../../helpers/constants';

export async function findClmmPoolInfo(raydium: Raydium, baseMint: PublicKey) {
	const resp: any = await raydium.api.fetchPoolByMints({ mint1: baseMint.toBase58(), mint2: mints.WSOL });
	const list: any[] = Array.isArray(resp) ? resp : resp?.data || resp?.items || [];
	const target = list.find((p: any) => p?.type === 'Concentrated');
	if (!target) throw new Error('Raydium CLMM pool not found for pair');
	return target;
}

export async function findClmmPoolInfoById(raydium: Raydium, poolAddress: PublicKey) {
	const resp: any = await raydium.api.fetchPoolById({ ids: poolAddress.toBase58() });
	const list: any[] = Array.isArray(resp) ? resp : resp?.data || resp?.items || [];
	if (!list || list.length === 0) throw new Error('Pool not found for provided poolAddress');
	return list[0];
}

export function assertClmmPool(poolInfo: any) {
	if (poolInfo?.type !== 'Concentrated') throw new Error('Incompatible poolAddress for Raydium CLMM: expected Concentrated pool');
}

export function assertClmmHasMintAndWsol(poolInfo: any, mintAddress: PublicKey) {
	const token = mintAddress.toBase58();
	const wsol = new PublicKey(mints.WSOL).toBase58();
	const pair = [poolInfo?.mintA?.address, poolInfo?.mintB?.address];
	if (!pair.includes(token) || !pair.includes(wsol)) {
		throw new Error('Incompatible poolAddress for Raydium CLMM: expected token-WSOL pair');
	}
}


