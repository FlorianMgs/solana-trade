import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { mints as MintConstants } from '../../helpers/constants';
import { roundLamports, roundPercent } from '../../helpers/price';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { LAUNCHPAD_PROGRAM } = require('@raydium-io/raydium-sdk-v2');
import { MarketPriceResult } from '../../interfaces/price';

export async function getRaydiumLaunchpadPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const mintPk = mint instanceof PublicKey ? mint : new PublicKey(mint as any);
	const wsolPk = new PublicKey(MintConstants.WSOL);
	const POOL_SEED = Buffer.from('pool', 'utf8');
	const launchpadProgramPk = new PublicKey(LAUNCHPAD_PROGRAM);
	const [poolId] = PublicKey.findProgramAddressSync([POOL_SEED, mintPk.toBuffer(), wsolPk.toBuffer()], launchpadProgramPk);

	const acc = await connection.getAccountInfo(poolId, 'processed');
	if (!acc || !acc.data) throw new Error('Raydium Launchpad pool not found');
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { LaunchpadPool, LaunchpadConfig } = require('@raydium-io/raydium-sdk-v2/lib/raydium/launchpad/layout');
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { Curve } = require('@raydium-io/raydium-sdk-v2/lib/raydium/launchpad/curve/curve');
	const poolInfo: any = LaunchpadPool.decode(acc.data);

	const realB = new BN(poolInfo.realB?.toString?.() ?? poolInfo.realB ?? 0);
	const totalFundRaisingB = new BN(poolInfo.totalFundRaisingB?.toString?.() ?? poolInfo.totalFundRaisingB ?? 0);
	const ratio = totalFundRaisingB.isZero() ? 0 : Math.max(0, Math.min(1, realB.toNumber() / totalFundRaisingB.toNumber()));
	const bondingCurvePercent = roundPercent(ratio * 100);

	const decimalA: number = Number(poolInfo.mintDecimalsA ?? 9);
	const decimalB: number = Number(poolInfo.mintDecimalsB ?? 9);
	let lamportsPerToken = 0;
	try {
		const cfgAcc = await connection.getAccountInfo(poolInfo.configId, 'processed');
		if (!cfgAcc?.data) throw new Error('config not found');
		const configInfo: any = LaunchpadConfig.decode(cfgAcc.data);
		const curveType: number = Number(configInfo.curveType ?? 0);
		const priceDecimal = Curve.getPrice({ poolInfo, decimalA, decimalB, curveType });
		const priceSolPerToken = Number(priceDecimal.toString());
		lamportsPerToken = roundLamports(Math.max(0, priceSolPerToken * LAMPORTS_PER_SOL));
	} catch (_) {
		try {
			const vB = new BN(poolInfo.virtualB?.toString?.() ?? poolInfo.virtualB ?? 0);
			const rB = new BN(poolInfo.realB?.toString?.() ?? poolInfo.realB ?? 0);
			const vA = new BN(poolInfo.virtualA?.toString?.() ?? poolInfo.virtualA ?? 0);
			const rA = new BN(poolInfo.realA?.toString?.() ?? poolInfo.realA ?? 0);
			const num = vB.add(rB).toNumber();
			const den = Math.max(1, vA.sub(rA).toNumber());
			const priceSolPerToken = (num / den) * Math.pow(10, decimalA - decimalB);
			lamportsPerToken = roundLamports(Math.max(0, priceSolPerToken * LAMPORTS_PER_SOL));
		} catch {
			lamportsPerToken = 0;
		}
	}
	return { lamportsPerToken, bondingCurvePercent };
}


