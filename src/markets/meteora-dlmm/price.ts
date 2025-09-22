import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import DLMM from '@meteora-ag/dlmm';
import { mints } from '../../helpers/constants';
import { roundLamports } from '../../helpers/price';
import { MarketPriceResult } from '../../interfaces/price';
import { findDlmmMintWsolPair } from './pool-utils';

export async function getMeteoraDlmmPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const pair = await findDlmmMintWsolPair(connection, mint);
	const dlmmPool = await DLMM.create(connection, pair);
	const wsolMint = mints.WSOL;
	const isXWsol = (dlmmPool.tokenX.mint as any).address?.toBase58?.() === wsolMint || (dlmmPool.tokenX.mint as any).toBase58?.() === wsolMint;
	const inputIsX = !isXWsol; // token side
	const swapForY = inputIsX; // sell token -> WSOL
	const binArrays = await dlmmPool.getBinArrayForSwap(swapForY, 8);
	const decimalsIn = (inputIsX ? (dlmmPool.tokenX.mint as any) : (dlmmPool.tokenY.mint as any)).decimals ?? 6;
	const inAmount = new BN(Math.round(Math.pow(10, decimalsIn)));
	const maxFeeBps = new BN(0);
	const quote = await dlmmPool.swapQuote(inAmount, swapForY, maxFeeBps, binArrays, false, 3);
	const lamportsPerToken = roundLamports(Math.max(0, Number(quote.minOutAmount.toString?.() ?? quote.minOutAmount)));
	return { lamportsPerToken, bondingCurvePercent: null };
}


