import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { PROGRAM_IDS_PUBLIC_KEYS as PROGRAM_IDS } from '../../helpers/program-ids';
import { readMintDecimals, roundLamports, roundPercent } from '../../helpers/price';
import { MarketPriceResult } from '../../interfaces/price';

export async function getBoopFunPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const programId = new PublicKey(PROGRAM_IDS.BOOP_FUN_PROGRAM_ID);
	const bondingCurvePda = PublicKey.findProgramAddressSync([Buffer.from('bonding_curve'), mint.toBuffer()], programId)[0];
	const accInfo = await connection.getAccountInfo(bondingCurvePda, 'processed');
	if (!accInfo) throw new Error('Boop bonding curve account not found');
	const parsed = decodeBoopBondingCurve(accInfo.data);
	if (!parsed) throw new Error('Boop bonding curve decode failed');

	const decimals = await readMintDecimals(connection, mint);
	const xLamports = Number(parsed.virtualSolReserves) + Number(parsed.solReserves);
	const yBaseUnits = Number(parsed.tokenReserves);
	const priceSol = yBaseUnits > 0 ? (xLamports / LAMPORTS_PER_SOL) / (yBaseUnits / Math.pow(10, decimals)) : 0;
	const lamportsPerToken = roundLamports(Math.max(0, priceSol * LAMPORTS_PER_SOL));

	let bondingCurvePercent: number | null = null;
	if (parsed.graduationTarget && Number(parsed.graduationTarget) > 0) {
		const ratio = Math.max(0, Math.min(1, Number(parsed.solReserves) / Number(parsed.graduationTarget)));
		bondingCurvePercent = roundPercent(ratio * 100);
	}
	return { lamportsPerToken, bondingCurvePercent };
}

function decodeBoopBondingCurve(data: Buffer): {
	dampingTerm: number;
	virtualTokenReserves: bigint;
	virtualSolReserves: bigint;
	solReserves: bigint;
	tokenReserves: bigint;
	swapFeeBasisPoints: number;
	graduationTarget: bigint;
} | null {
	try {
		const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
		let o = 0;
		o += 8; // anchor discriminator
		// creator(32) + mint(32)
		o += 64;
		const virtualSolReserves = readU64LE(dv, o); o += 8;
		const virtualTokenReserves = readU64LE(dv, o); o += 8;
		const graduationTarget = readU64LE(dv, o); o += 8;
		o += 8; // graduationFee u64 (skip)
		const solReserves = readU64LE(dv, o); o += 8;
		const tokenReserves = readU64LE(dv, o); o += 8;
		const dampingTerm = dv.getUint8(o); o += 1;
		const swapFeeBasisPoints = dv.getUint16(o, true); o += 2;
		return { dampingTerm, virtualTokenReserves, virtualSolReserves, solReserves, tokenReserves, swapFeeBasisPoints, graduationTarget };
	} catch {
		return null;
	}
}

function readU64LE(dv: DataView, o: number): bigint {
	const lo = BigInt(dv.getUint32(o, true));
	const hi = BigInt(dv.getUint32(o + 4, true));
	return (hi << 32n) + lo;
}


