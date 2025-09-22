import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Raydium, CurveCalculator, FeeOn } from '@raydium-io/raydium-sdk-v2';
import { roundLamports } from '../../helpers/price';
import { MarketPriceResult } from '../../interfaces/price';
import { assertCpmmHasMintAndWsol, findCpmmPoolInfo } from './pool-utils';

export async function getRaydiumCpmmPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const owner = mint;
	const raydium = await Raydium.load({ connection, owner });
	const poolInfo: any = await findCpmmPoolInfo(raydium, mint);
	assertCpmmHasMintAndWsol(poolInfo, mint);

	const rpc = await raydium.cpmm.getPoolInfoFromRpc(String(poolInfo.id));
	const rpcData = rpc.rpcData;

	// Input is the provided token mint; map reserves accordingly (mintA -> baseReserve, mintB -> quoteReserve)
	const baseIn = poolInfo.mintA.address === mint.toBase58();
	const decimals = Number((baseIn ? poolInfo.mintA : poolInfo.mintB).decimals);
	const inputAmount = new BN(Math.round(Math.pow(10, decimals))); // 1 token

	const swapResult = CurveCalculator.swapBaseInput(
		inputAmount,
		baseIn ? rpcData.baseReserve : rpcData.quoteReserve,
		baseIn ? rpcData.quoteReserve : rpcData.baseReserve,
		rpcData.configInfo!.tradeFeeRate,
		rpcData.configInfo!.creatorFeeRate,
		rpcData.configInfo!.protocolFeeRate,
		rpcData.configInfo!.fundFeeRate,
		rpcData.feeOn === FeeOn.BothToken || rpcData.feeOn === FeeOn.OnlyTokenB
	);

const lamportsPerToken = roundLamports(Math.max(0, Number(swapResult.outputAmount.toString())));
	return { lamportsPerToken, bondingCurvePercent: null };
}


