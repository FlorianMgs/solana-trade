import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createComputeBudgetInstructions, createTipInstruction } from './helpers/instructions';
import { markets as Markets, swapDirection as SwapDirection } from './helpers/constants';
import { PumpFunClient } from './markets/pump-fun/client';
import { PumpSwapClient } from './markets/pump-swap/client';
import { RaydiumAmmClient } from './markets/raydium-amm/client';
import { RaydiumClmmClient } from './markets/raydium-clmm/client';
import { RaydiumCpmmClient } from './markets/raydium-cpmm/client';
import { RaydiumLaunchpadClient } from './markets/raydium-launchpad/client';
import { MeteoraDlmmClient } from './markets/meteora-dlmm/client';
import { MeteoraDammV1Client } from './markets/meteora-damm-v1/client';
import { MeteoraDammV2Client } from './markets/meteora-damm-v2/client';
import { MeteoraDbcClient } from './markets/meteora-dbc/client';
import { OrcaWhirlpoolClient } from './markets/orca-whirlpool/client';
import { MoonitClient } from './markets/moonit/client';
import { HeavenClient } from './markets/heaven-xyz/client';
import { SugarClient } from './markets/sugar/client';
import { BoopFunClient } from './markets/boop-fun/client';
import { BuildTransactionParams } from './interfaces/transaction-builder';

/**
 * Builds a Transaction with compute budget (priority fees), optional tip, and market buy/sell instructions.
 * Does not send the transaction.
 */
export async function buildTransaction(params: BuildTransactionParams): Promise<Transaction> {
  const {
    connection,
    market,
    direction,
    wallet,
    mint,
    amount,
    slippage,
    priorityFeeSol = 0.0001,
    tipAmountSol = 0,
  } = params;

  if (slippage < 0 || slippage > 1) {
    throw new Error('slippage must be between 0 and 1');
  }

  const tx = new Transaction();

  // Add compute budget instructions (priority fee)
  const budgetIx = createComputeBudgetInstructions(priorityFeeSol);
  budgetIx.forEach(ix => tx.add(ix));

  // Optional tip (TIP_ADDRESS via env if provided)
  if (tipAmountSol > 0) {
    const tipAddressEnv = process.env.TIP_ADDRESS;
    if (tipAddressEnv) {
      try {
        const tipAddress = new PublicKey(tipAddressEnv);
        const tipIx = createTipInstruction(tipAddress, wallet.publicKey, tipAmountSol);
        tx.add(tipIx);
      } catch (_) {
        // Ignore invalid TIP_ADDRESS
      }
    }
  }

  // Market-specific instructions
  const client = createMarketClient(connection, market);
  const invocation = createDirectionInvoker(client, direction);
  const marketInstructions = await invocation({
    mintAddress: mint,
    wallet: wallet.publicKey,
    solAmount: amount,
    tokenAmount: amount,
    slippage,
  });

  for (const ix of marketInstructions) {
    tx.add(ix);
  }

  tx.feePayer = wallet.publicKey;
  return tx;
}

type MarketClient = {
  getBuyInstructions: (args: {
    mintAddress: PublicKey;
    wallet: PublicKey;
    solAmount: number;
    slippage: number;
  }) => Promise<TransactionInstruction[]>;
  getSellInstructions: (args: {
    mintAddress: PublicKey;
    wallet: PublicKey;
    tokenAmount: number;
    slippage: number;
  }) => Promise<TransactionInstruction[]>;
};

function createMarketClient(connection: Connection, market: string): MarketClient {
  switch (market) {
    case Markets.PUMP_FUN:
      return new PumpFunClient(connection);
    case Markets.PUMP_SWAP:
      return new PumpSwapClient(connection);
    case Markets.RAYDIUM_AMM:
      return new RaydiumAmmClient(connection) as unknown as MarketClient;
    case Markets.RAYDIUM_CLMM:
      return new RaydiumClmmClient(connection) as unknown as MarketClient;
    case Markets.RAYDIUM_CPMM:
      return new RaydiumCpmmClient(connection) as unknown as MarketClient;
    case Markets.RAYDIUM_LAUNCHPAD:
      return new RaydiumLaunchpadClient(connection) as unknown as MarketClient;
    case Markets.METEORA_DLMM:
      return new MeteoraDlmmClient(connection) as unknown as MarketClient;
    case Markets.METEORA_DAMM_V1:
      return new MeteoraDammV1Client(connection) as unknown as MarketClient;
    case Markets.METEORA_DAMM_V2:
      return new MeteoraDammV2Client(connection) as unknown as MarketClient;
    case Markets.METEORA_DBC:
      return new MeteoraDbcClient(connection) as unknown as MarketClient;
    case Markets.ORCA_WHIRLPOOL:
      return new OrcaWhirlpoolClient(connection) as unknown as MarketClient;
    case Markets.MOONIT:
      return new MoonitClient(connection) as unknown as MarketClient;
    case Markets.HEAVEN:
      return new HeavenClient(connection) as unknown as MarketClient;
    case Markets.SUGAR:
      return new SugarClient(connection) as unknown as MarketClient;
    case Markets.BOOP_FUN:
      return new BoopFunClient(connection) as unknown as MarketClient;
    default:
      throw new Error(`Unsupported market: ${market}`);
  }
}

function createDirectionInvoker(client: MarketClient, direction: string) {
  if (direction === SwapDirection.BUY) {
    return async ({ mintAddress, wallet, solAmount, slippage }: { 
      mintAddress: PublicKey; 
      wallet: PublicKey; 
      solAmount: number; 
      slippage: number; 
    }) => {
      return client.getBuyInstructions({ mintAddress, wallet, solAmount, slippage });
    }
  }
  if (direction === SwapDirection.SELL) {
    return async ({ mintAddress, wallet, tokenAmount, slippage }: { 
      mintAddress: PublicKey; 
      wallet: PublicKey; 
      tokenAmount: number; 
      slippage: number; 
    }) => {
      return client.getSellInstructions({ mintAddress, wallet, tokenAmount, slippage });
    }
  }
  throw new Error(`Unsupported direction: ${direction}`);
}


