import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { OrcaPercentage as Percentage, buildWhirlpoolSdk, resolveWhirlpoolForPair } from './pool-utils';
import { PROGRAM_IDS_PUBLIC_KEYS } from '../../helpers/program-ids';
import { roundLamports } from '../../helpers/price';
import { MarketPriceResult } from '../../interfaces/price';

// unified via pool-utils

export async function getOrcaWhirlpoolPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const wsol = new PublicKey('So11111111111111111111111111111111111111112');
    const whirlpoolPk = await resolveWhirlpoolForPair(connection, mint, wsol);
    const sdk = buildWhirlpoolSdk(connection, wsol);
	const whirlpool = await sdk.getPool(whirlpoolPk);

	const tokenA = whirlpool.getTokenAInfo();
	const tokenB = whirlpool.getTokenBInfo();
	const mintsInPool = [tokenA.mint.toBase58(), tokenB.mint.toBase58()];
	if (!mintsInPool.includes(mint.toBase58()) || !mintsInPool.includes(wsol.toBase58())) {
		throw new Error('Incompatible poolAddress for Orca Whirlpool: expected token-WSOL pair');
	}

	const sellingIsA = tokenA.mint.equals(mint);
	const decimals = sellingIsA ? tokenA.decimals : tokenB.decimals;
	const amount = new BN(Math.round(Math.pow(10, decimals))); // 1 token
	const slippagePct = Percentage.fromFraction(0, 10000);
	const fetcher = sdk.getFetcher();
	const quoteMod = await import('@orca-so/whirlpools-sdk/dist/quotes/public/swap-quote');
	const quote = await quoteMod.swapQuoteByInputToken(
		whirlpool,
		sellingIsA ? tokenA.mint : tokenB.mint,
		amount,
		slippagePct,
		PROGRAM_IDS_PUBLIC_KEYS.ORCA_WHIRLPOOL_PROGRAM_ID as unknown as PublicKey,
		fetcher,
	);

	const lamportsPerToken = roundLamports(Math.max(0, Number(quote.otherAmountThreshold.toString())));
	return { lamportsPerToken, bondingCurvePercent: null };
}


