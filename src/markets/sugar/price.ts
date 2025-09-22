import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { readMintDecimals, roundLamports, roundPercent } from '../../helpers/price';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SugarMoneyProgram, SugarMoneyProgramConfig } = require('sugar-money/program');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AnchorProvider, Wallet } = require('@coral-xyz/anchor');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { mints: MintConstants } = require('../../helpers/constants');
import { MarketPriceResult } from '../../interfaces/price';

export async function getSugarPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const owner = new PublicKey(MintConstants.WSOL);
	const provider = new AnchorProvider(connection, new Wallet({ publicKey: owner } as any), { commitment: 'processed' } as any);
	const cluster = 'production';
	const config = new SugarMoneyProgramConfig(cluster);
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { SugarMoneyTradeTypeEnum, SugarMoneyTradeDirectionEnum } = require('sugar-money/program');
	const program = new SugarMoneyProgram(provider, cluster, config);

	const decimals = await readMintDecimals(connection, mint);
	const oneTokenBase = new BN(Math.round(Math.pow(10, Math.max(0, Math.min(12, decimals)))));
	const [tradeInfo, error] = await program.getTrade({
		tradeType: SugarMoneyTradeTypeEnum.ExactIn,
		tradeDirection: SugarMoneyTradeDirectionEnum.Sell,
		amountToTrade: oneTokenBase,
		slippage: 0,
		mint,
		receiver: owner,
	});
	if (error) throw error;

	let lamportsPerToken = 0;
	if (tradeInfo?.price != null) {
		const priceScaled = Number(tradeInfo.price.toString?.() ?? tradeInfo.price);
		const priceSol = priceScaled / 1_000_000_000_000_000_000;
		lamportsPerToken = roundLamports(Math.max(0, priceSol * LAMPORTS_PER_SOL));
	} else if (tradeInfo?.minmaxOutputAmount?.min != null) {
		lamportsPerToken = roundLamports(Math.max(0, Number(tradeInfo.minmaxOutputAmount.min.toString?.() ?? tradeInfo.minmaxOutputAmount.min)));
	}

	let bondingCurvePercent: number | null = null;
	try {
		const [curvePda] = program.getBondingCurveAccounts(mint);
		const percent: number = await program.getCompletionPercent(curvePda.publicKey ?? curvePda);
		bondingCurvePercent = roundPercent(Math.max(0, Math.min(100, percent)));
	} catch (_) {
		bondingCurvePercent = null;
	}
	return { lamportsPerToken, bondingCurvePercent };
}


