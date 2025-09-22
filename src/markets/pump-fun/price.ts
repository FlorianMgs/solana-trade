import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { roundLamports, roundPercent } from '../../helpers/price';
import { MarketPriceResult } from '../../interfaces/price';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PumpSdk } = require('@pump-fun/pump-sdk');

export async function getPumpFunPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const sdk = new PumpSdk(connection);
	const bondingCurve = await sdk.fetchBondingCurve(mint);

	// Price from virtual reserves (instantaneous price)
	const vSolLamports = Number(bondingCurve.virtualSolReserves.toString());
	const vTokenBase = Number(bondingCurve.virtualTokenReserves.toString());
	const priceSol = vTokenBase > 0 ? (vSolLamports / LAMPORTS_PER_SOL) / (vTokenBase / 1_000_000) : 0;
	const lamportsPerToken = roundLamports(Math.max(0, priceSol * LAMPORTS_PER_SOL));

	// Progress based on real token reserves vs initial baseline
	const INITIAL_REAL_TOKEN_RESERVES = 793_100_000_000_000n;
	const realTokenReserves = BigInt(bondingCurve.realTokenReserves.toString());
	let percent = Number(INITIAL_REAL_TOKEN_RESERVES - realTokenReserves) / Number(INITIAL_REAL_TOKEN_RESERVES) * 100;
	if (bondingCurve.complete) percent = 100;
	const bondingCurvePercent = roundPercent(Math.max(0, Math.min(100, percent)));

	return { lamportsPerToken, bondingCurvePercent };
}


