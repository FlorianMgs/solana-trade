import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { roundLamports, roundPercent } from '../../helpers/price';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DynamicBondingCurveClient, getCurrentPoint } = require('@meteora-ag/dynamic-bonding-curve-sdk');
import { resolveDbcPoolByBaseMint } from './pool-utils';
import { MarketPriceResult } from '../../interfaces/price';

export async function getMeteoraDbcPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const dbc = new DynamicBondingCurveClient(connection, 'processed');
	const resolved = await resolveDbcPoolByBaseMint(connection, mint);
	const { poolAddress, virtualPool, poolConfig } = resolved;

	const baseDecimals: number = Number(poolConfig.tokenDecimal ?? 6);
	const amountIn = new BN(Math.round(Math.pow(10, baseDecimals)));
	const swapBaseForQuote = true;
	const currentPoint = await getCurrentPoint(connection as any, poolConfig.activationType);
	const quote = await dbc.pool.swapQuote({ virtualPool, config: poolConfig, swapBaseForQuote, amountIn, slippageBps: 0, hasReferral: false, currentPoint });
	const lamportsPerToken = roundLamports(Math.max(0, Number((quote?.minimumAmountOut ?? new BN(0)).toString())));

	let bondingCurvePercent: number | null = null;
	try {
		const ratio = await dbc.state.getPoolCurveProgress(poolAddress);
		bondingCurvePercent = roundPercent(Math.max(0, Math.min(1, Number(ratio))) * 100);
	} catch (_) {
		bondingCurvePercent = null;
	}
	return { lamportsPerToken, bondingCurvePercent };
}


