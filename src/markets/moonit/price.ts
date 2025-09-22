import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { roundLamports } from '../../helpers/price';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Moonit, Environment } = require('@moonit/sdk');
import { MarketPriceResult } from '../../interfaces/price';

export async function getMoonitPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const rpcUrl: string = (connection as any)._rpcEndpoint || '';
	const moonit = new Moonit({ rpcUrl, environment: Environment.MAINNET, chainOptions: { solana: { confirmOptions: { commitment: 'processed' } } } });
	const token = moonit.Token({ mintAddress: mint.toBase58() });

	const curve = await token.getCurveAccount();
	const decimals: number = Number(curve?.decimals ?? 9);
	const oneTokenBase: bigint = BigInt(Math.round(Math.pow(10, decimals)));
	const collateralLamports: bigint = await token.getCollateralAmountByTokens({ tokenAmount: oneTokenBase, tradeDirection: 'SELL' });
	const lamportsPerToken = roundLamports(Math.max(0, Number(collateralLamports.toString())));

	let bondingCurvePercent: number | null = null;
	try {
		const position: bigint = await token.getCurvePosition();
		const totalSupply: bigint = BigInt(curve.totalSupply ?? 0);
		if (totalSupply === 0n) {
			bondingCurvePercent = 0;
		} else {
			const hundredthPercent: bigint = (position * 10000n + totalSupply / 2n) / totalSupply;
			bondingCurvePercent = Number(hundredthPercent) / 100;
		}
	} catch (_) {
		bondingCurvePercent = null;
	}
	return { lamportsPerToken, bondingCurvePercent };
}


