import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { Raydium, PoolUtils, TxVersion } from '@raydium-io/raydium-sdk-v2';
import { mints } from '../../helpers/constants';

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

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;
    const raydium = await this.getRaydium(wallet);

    const poolInfo: any = await this.findClmmPoolInfo(raydium, mintAddress);

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

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;
    const raydium = await this.getRaydium(wallet);

    const poolInfo: any = await this.findClmmPoolInfo(raydium, mintAddress);

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

  // helper: fetch pool info by mints (token, WSOL)
  private async findClmmPoolInfo(raydium: Raydium, baseMint: PublicKey) {
    const resp: any = await raydium.api.fetchPoolByMints({ mint1: baseMint.toBase58(), mint2: mints.WSOL });
    const list: any[] = Array.isArray(resp) ? resp : resp?.data || resp?.items || [];
    const target = list.find((p: any) => p?.type === 'Concentrated');
    if (!target) throw new Error('Raydium CLMM pool not found for pair');
    return target;
  }
}


