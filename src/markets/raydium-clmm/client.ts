import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { Raydium, PoolUtils, TxVersion } from '@raydium-io/raydium-sdk-v2';
import { mints } from '../../helpers/constants';
import { assertClmmHasMintAndWsol, assertClmmPool, findClmmPoolInfo, findClmmPoolInfoById } from './pool-utils';

export class RaydiumClmmClient {
  private readonly connection: Connection;
  private raydiumPromise: Promise<Raydium> | null = null;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  private async getRaydium(owner: PublicKey): Promise<Raydium> {
    if (!this.raydiumPromise) {
      this.raydiumPromise = Raydium.load({ connection: this.connection, owner });
    }
    return this.raydiumPromise;
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage, poolAddress } = params;
    const raydium = await this.getRaydium(wallet);

    const poolInfo: any = poolAddress
      ? await findClmmPoolInfoById(raydium, poolAddress)
      : await findClmmPoolInfo(raydium, mintAddress);
    assertClmmPool(poolInfo);
    assertClmmHasMintAndWsol(poolInfo, mintAddress);

    const inputMint = new PublicKey(mints.WSOL);

    // Prefer RPC bundle for reliability (poolKeys + compute + ticks)
    const poolId: string = String(poolInfo.id);
    const rpc = await raydium.clmm.getPoolInfoFromRpc(poolId);
    const compute = rpc.computePoolInfo;
    const poolKeys = rpc.poolKeys;
    const tickCache = rpc.tickData[poolId];

    const amountIn = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));
    const baseIn = inputMint.toBase58() === poolInfo.mintA.address;
    const { minAmountOut, remainingAccounts } = await PoolUtils.computeAmountOutFormat({
      poolInfo: compute,
      tickArrayCache: tickCache,
      amountIn,
      tokenOut: poolInfo[baseIn ? 'mintB' : 'mintA'],
      slippage,
      epochInfo: await raydium.fetchEpochInfo(),
    });

    const make = await raydium.clmm.swap({
      poolInfo,
      poolKeys,
      inputMint: (baseIn ? poolInfo.mintA : poolInfo.mintB).address,
      amountIn,
      amountOutMin: minAmountOut.amount.raw,
      observationId: compute.observationId,
      ownerInfo: { useSOLBalance: true },
      remainingAccounts,
      txVersion: TxVersion.LEGACY,
    });

    return make.transaction.instructions;
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage, poolAddress } = params;
    const raydium = await this.getRaydium(wallet);

    const poolInfo: any = poolAddress
      ? await findClmmPoolInfoById(raydium, poolAddress)
      : await findClmmPoolInfo(raydium, mintAddress);
    assertClmmPool(poolInfo);
    assertClmmHasMintAndWsol(poolInfo, mintAddress);

    // Prefer RPC bundle for reliability (poolKeys + compute + ticks)
    const poolId: string = String(poolInfo.id);
    const rpc = await raydium.clmm.getPoolInfoFromRpc(poolId);
    const compute = rpc.computePoolInfo;
    const poolKeys = rpc.poolKeys;
    const tickCache = rpc.tickData[poolId];

    const baseIn = mintAddress.toBase58() === poolInfo.mintA.address;
    const mintIn = baseIn ? poolInfo.mintA : poolInfo.mintB;
    const decimals = mintIn.decimals;
    const amountIn = new BN(Math.round(tokenAmount * Math.pow(10, decimals)));

    const { minAmountOut, remainingAccounts } = await PoolUtils.computeAmountOutFormat({
      poolInfo: compute,
      tickArrayCache: tickCache,
      amountIn,
      tokenOut: poolInfo[baseIn ? 'mintB' : 'mintA'],
      slippage,
      epochInfo: await raydium.fetchEpochInfo(),
    });

    const make = await raydium.clmm.swap({
      poolInfo,
      poolKeys,
      inputMint: mintIn.address,
      amountIn,
      amountOutMin: minAmountOut.amount.raw,
      observationId: compute.observationId,
      ownerInfo: { useSOLBalance: true },
      remainingAccounts,
      txVersion: TxVersion.LEGACY,
    });

    return make.transaction.instructions;
  }

  // discovery and assertions moved to pool-utils
}


