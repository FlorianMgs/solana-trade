import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Raydium } from '@raydium-io/raydium-sdk-v2';
import { roundLamports } from '../../helpers/price';
import { MarketPriceResult } from '../../interfaces/price';
import { assertAmmPoolHasMintAndWsol, findAmmPoolInfo } from './pool-utils';

export async function getRaydiumAmmPrice(connection: Connection, mint: PublicKey): Promise<MarketPriceResult> {
	const owner = mint; // any public key, unused for price
	const raydium = await Raydium.load({ connection, owner });
	const poolInfo: any = await findAmmPoolInfo(raydium, mint);
	assertAmmPoolHasMintAndWsol(poolInfo, mint);
	const rpcData: any = await raydium.liquidity.getRpcPoolInfo(poolInfo.id);

	const baseIn = poolInfo.mintA.address === poolInfo.mintB.address ? false : (poolInfo.mintA.address !== poolInfo.mintB.address && poolInfo.mintA.address !== mint.toBase58());
	const mintIn = baseIn ? poolInfo.mintB : poolInfo.mintA; // token side
	const decimals = Number(mintIn.decimals);
	const amountIn = new BN(Math.round(Math.pow(10, decimals))); // 1 token in base units

	const out = raydium.liquidity.computeAmountOut({
		poolInfo: {
			...poolInfo,
			baseReserve: rpcData.baseReserve,
			quoteReserve: rpcData.quoteReserve,
			status: rpcData.status.toNumber(),
			version: 4,
		},
		amountIn,
		mintIn: mintIn.address,
		mintOut: (mintIn.address === poolInfo.mintA.address ? poolInfo.mintB : poolInfo.mintA).address,
		slippage: 0,
	});

	const lamportsPerToken = roundLamports(Math.max(0, Number(out.minAmountOut.toString())));
	return { lamportsPerToken, bondingCurvePercent: null };
}


