import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Raydium, PoolUtils } from '@raydium-io/raydium-sdk-v2';
import { roundLamports } from '../../helpers/price';
import { MarketPriceResult } from '../../interfaces/price';
import { assertClmmHasMintAndWsol, assertClmmPool, findClmmPoolInfo } from './pool-utils';

export async function getRaydiumClmmPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const owner = mint; // any pk
	const raydium = await Raydium.load({ connection, owner });
	const poolInfo: any = await findClmmPoolInfo(raydium, mint);
	assertClmmPool(poolInfo);
	assertClmmHasMintAndWsol(poolInfo, mint);

	const poolId: string = String(poolInfo.id);
	const rpc = await raydium.clmm.getPoolInfoFromRpc(poolId);
	const compute = rpc.computePoolInfo;
	const tickCache = rpc.tickData[poolId];

	const baseIn = poolInfo.mintA.address !== mint.toBase58(); // token side is input
	const mintIn = baseIn ? poolInfo.mintB : poolInfo.mintA;
	const decimals = Number(mintIn.decimals);
	const amountIn = new BN(Math.round(Math.pow(10, decimals)));

	const { minAmountOut } = await PoolUtils.computeAmountOutFormat({
		poolInfo: compute,
		tickArrayCache: tickCache,
		amountIn,
		tokenOut: poolInfo[baseIn ? 'mintA' : 'mintB'],
		slippage: 0,
		epochInfo: await raydium.fetchEpochInfo(),
	});

	const lamportsPerToken = roundLamports(Math.max(0, Number(minAmountOut.amount.raw.toString())));
	return { lamportsPerToken, bondingCurvePercent: null };
}


