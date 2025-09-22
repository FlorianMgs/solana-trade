import { Connection, PublicKey } from '@solana/web3.js';
import { PROGRAM_IDS_PUBLIC_KEYS as PROGRAM_IDS } from '../../helpers/program-ids';
import { mints as MintConstants } from '../../helpers/constants';
import { readMintDecimals, roundLamports, roundPercent } from '../../helpers/price';
import { MarketPriceResult } from '../../interfaces/price';

export async function getHeavenPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const programId = new PublicKey(PROGRAM_IDS.HEAVEN_PROGRAM_ID);
	const wsol = new PublicKey(MintConstants.WSOL);
	const [poolPda] = PublicKey.findProgramAddressSync(
		[Buffer.from('liquidity_pool_state'), mint.toBuffer(), wsol.toBuffer()],
		programId,
	);
	const acc = await connection.getAccountInfo(poolPda, 'processed');
	if (!acc || !acc.data) throw new Error('Heaven liquidity pool state not found');

	const reserve = decodeHeavenReserve(acc.data);
	if (!reserve) throw new Error('Failed to decode Heaven LiquidityPoolReserve');

	const decimals = await readMintDecimals(connection, mint);
	const tokenA = Number(reserve.tokenA);
	const tokenB = Number(reserve.tokenB);
	const lamportsPerToken = tokenA > 0 ? roundLamports((tokenB * Math.pow(10, decimals)) / tokenA) : 0;

	const initialA = Number(reserve.initialA);
	let bondingCurvePercent = 0;
	if (initialA > 0) {
		const sold = Math.max(0, initialA - tokenA);
		bondingCurvePercent = roundPercent(Math.max(0, Math.min(1, sold / initialA)) * 100);
	}
	return { lamportsPerToken, bondingCurvePercent };
}

function decodeHeavenReserve(data: Buffer): { tokenA: bigint; tokenB: bigint; initialA: bigint; initialB: bigint } | null {
	try {
		// Anchor discriminator (8) + LiquidityPoolInfo (88) + LiquidityPoolMarketCapBasedFees (360)
		const base = 8 + 88 + 360;
		const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
		const tokenA = readU64LE(dv, base + 0);
		const tokenB = readU64LE(dv, base + 8);
		const initialA = readU64LE(dv, base + 48);
		const initialB = readU64LE(dv, base + 56);
		return { tokenA, tokenB, initialA, initialB };
	} catch {
		return null;
	}
}

function readU64LE(dv: DataView, o: number): bigint {
	const lo = BigInt(dv.getUint32(o, true));
	const hi = BigInt(dv.getUint32(o + 4, true));
	return (hi << 32n) + lo;
}


