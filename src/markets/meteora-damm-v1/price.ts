import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import AmmImpl from '@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm';
import { mints } from '../../helpers/constants';
import { roundLamports } from '../../helpers/price';
import { MarketPriceResult } from '../../interfaces/price';
import { findDammV1PoolAddress } from './pool-utils';

export async function getMeteoraDammV1Price(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const resolved = await findDammV1PoolAddress(connection, mint);
	const pool = await AmmImpl.create(connection as any, resolved);

	// Validate pool tokens
	const tokenA = new PublicKey(pool.tokenAMint.address).toBase58();
	const tokenB = new PublicKey(pool.tokenBMint.address).toBase58();
	const m = mint.toBase58();
	if (!([tokenA, tokenB].includes(m) && [tokenA, tokenB].includes(mints.WSOL))) {
		throw new Error('Incompatible poolAddress for DAMM v1: expected token-WSOL pair');
	}

	const sellingX = new PublicKey(pool.tokenAMint.address).toBase58() === m;
	const decimals = sellingX ? pool.tokenAMint.decimals : pool.tokenBMint.decimals;
	const oneToken = new BN(Math.round(Math.pow(10, decimals)));
	const inMint = new PublicKey(sellingX ? pool.tokenAMint.address : pool.tokenBMint.address);
	const quote = pool.getSwapQuote(inMint, oneToken, 0);

	const lamportsPerToken = roundLamports(Math.max(0, Number(quote.minSwapOutAmount.toString?.() ?? quote.minSwapOutAmount)));
	return { lamportsPerToken, bondingCurvePercent: null };
}


