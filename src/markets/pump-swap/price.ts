import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { OnlinePumpAmmSdk, canonicalPumpPoolPda, sellBaseInput } from '@pump-fun/pump-swap-sdk';
import { roundLamports } from '../../helpers/price';
import { MarketPriceResult } from '../../interfaces/price';

export async function getPumpSwapPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const sdk = new OnlinePumpAmmSdk(connection);
	const poolKey = canonicalPumpPoolPda(mint);
	// User address not needed for state fetch; use default public key as placeholder
	const swapState = await sdk.swapSolanaState(poolKey, PublicKey.default);

	const decimals = swapState.baseMintAccount.decimals;
	const baseAmount = new BN(Math.round(Math.pow(10, decimals)));

	const result = sellBaseInput({
		base: baseAmount,
		slippage: 0,
		baseReserve: swapState.poolBaseAmount,
		quoteReserve: swapState.poolQuoteAmount,
		globalConfig: swapState.globalConfig,
		baseMintAccount: swapState.baseMintAccount,
		baseMint: swapState.baseMint,
		coinCreator: swapState.pool.coinCreator,
		creator: swapState.pool.creator,
		feeConfig: swapState.feeConfig,
	});

	const lamportsPerToken = roundLamports(Math.max(0, Number(result.uiQuote.toString())));
	return { lamportsPerToken, bondingCurvePercent: null };
}


