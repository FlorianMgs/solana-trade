import { Connection, PublicKey } from '@solana/web3.js';
import { markets as Markets } from './constants';
import { MarketPriceResult } from '../interfaces/price';
import { getPumpFunPrice } from '../markets/pump-fun/price';
import { getBoopFunPrice } from '../markets/boop-fun/price';
import { getHeavenPrice } from '../markets/heaven-xyz/price';
import { getMeteoraDbcPrice } from '../markets/meteora-dbc/price';
import { getMoonitPrice } from '../markets/moonit/price';
import { getSugarPrice } from '../markets/sugar/price';
import { getRaydiumLaunchpadPrice } from '../markets/raydium-launchpad/price';
import { getMeteoraDammV1Price } from '../markets/meteora-damm-v1/price';
import { getMeteoraDammV2Price } from '../markets/meteora-damm-v2/price';
import { getMeteoraDlmmPrice } from '../markets/meteora-dlmm/price';
import { getOrcaWhirlpoolPrice } from '../markets/orca-whirlpool/price';
import { getPumpSwapPrice } from '../markets/pump-swap/price';
import { getRaydiumAmmPrice } from '../markets/raydium-amm/price';
import { getRaydiumClmmPrice } from '../markets/raydium-clmm/price';
import { getRaydiumCpmmPrice } from '../markets/raydium-cpmm/price';

export type PriceUnit = 'SOL' | 'LAMPORTS';

export async function readMintDecimals(connection: Connection, mint: PublicKey): Promise<number> {
	const info = await connection.getParsedAccountInfo(mint, 'processed');
	const parsed: any = (info.value as any)?.data?.parsed;
	const decimals = Number(parsed?.info?.decimals ?? parsed?.parsed?.info?.decimals);
	return Number.isFinite(decimals) ? decimals : 9;
}

export function roundPercent(v: number): number {
	return Math.round(v * 100) / 100;
}

export function roundLamports(v: number): number {
	const f = Math.floor(v);
	const frac = v - f;
	if (frac > 0.5) return f + 1;
	return f;
}

export async function getPriceForMarket(
	connection: Connection,
	market: string,
	mint: PublicKey,
): Promise<MarketPriceResult> {
  const key = (market || '').toUpperCase();

  if (key === Markets.PUMP_FUN) return getPumpFunPrice(connection, mint);
  if (key === Markets.BOOP_FUN) return getBoopFunPrice(connection, mint);
  if (key === Markets.HEAVEN) return getHeavenPrice(connection, mint);
  if (key === Markets.METEORA_DBC) return getMeteoraDbcPrice(connection, mint);
  if (key === Markets.MOONIT) return getMoonitPrice(connection, mint);
  if (key === Markets.SUGAR) return getSugarPrice(connection, mint);
  if (key === Markets.RAYDIUM_LAUNCHPAD) return getRaydiumLaunchpadPrice(connection, mint);
  if (key === Markets.METEORA_DAMM_V1) return getMeteoraDammV1Price(connection, mint);
  if (key === Markets.METEORA_DAMM_V2) return getMeteoraDammV2Price(connection, mint);
  if (key === Markets.METEORA_DLMM) return getMeteoraDlmmPrice(connection, mint);
  if (key === Markets.ORCA_WHIRLPOOL) return getOrcaWhirlpoolPrice(connection, mint);
  if (key === Markets.PUMP_SWAP) return getPumpSwapPrice(connection, mint);
  if (key === Markets.RAYDIUM_AMM) return getRaydiumAmmPrice(connection, mint);
  if (key === Markets.RAYDIUM_CLMM) return getRaydiumClmmPrice(connection, mint);
  if (key === Markets.RAYDIUM_CPMM) return getRaydiumCpmmPrice(connection, mint);

  throw new Error(`Price resolver not implemented for market ${market}`);
}
 


