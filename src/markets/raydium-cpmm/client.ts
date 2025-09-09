import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { Raydium, CurveCalculator, FeeOn, TxVersion } from '@raydium-io/raydium-sdk-v2';
import { mints } from '../../helpers/constants';

export class RaydiumCpmmClient {
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

    const poolInfo: any = await this.findCpmmPoolInfo(raydium, mintAddress);
    const rpc = await raydium.cpmm.getPoolInfoFromRpc(String(poolInfo.id));
    const rpcData = rpc.rpcData;
    const poolKeys = rpc.poolKeys;

    const inputMint = new PublicKey(mints.WSOL).toBase58();
    const baseIn = inputMint === poolInfo.mintA.address;
    const inputAmount = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));

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

    const make = await raydium.cpmm.swap({
      poolInfo,
      poolKeys,
      inputAmount,
      swapResult,
      slippage,
      baseIn,
      txVersion: TxVersion.LEGACY,
    });

    return make.transaction.instructions;
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;
    const raydium = await this.getRaydium(wallet);

    const poolInfo: any = await this.findCpmmPoolInfo(raydium, mintAddress);
    const rpc = await raydium.cpmm.getPoolInfoFromRpc(String(poolInfo.id));
    const rpcData = rpc.rpcData;
    const poolKeys = rpc.poolKeys;

    const baseIn = mintAddress.toBase58() === poolInfo.mintA.address;
    const mintIn = baseIn ? poolInfo.mintA : poolInfo.mintB;
    const decimals = mintIn.decimals;
    const inputAmount = new BN(Math.round(tokenAmount * Math.pow(10, decimals)));

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

    const make = await raydium.cpmm.swap({
      poolInfo,
      poolKeys,
      inputAmount,
      swapResult,
      slippage,
      baseIn,
      txVersion: TxVersion.LEGACY,
    });

    return make.transaction.instructions;
  }

  private async findCpmmPoolInfo(raydium: Raydium, baseMint: PublicKey) {
    // Try API by mints (standard pools include CPMM)
    const resp: any = await raydium.api.fetchPoolByMints({ mint1: baseMint.toBase58(), mint2: mints.WSOL, order: 'desc', sort: 'liquidity' });
    const list: any[] = Array.isArray(resp) ? resp : resp?.data || resp?.items || [];
    let target = list.find((p: any) => p?.type === 'Standard' && p?.config && p?.pooltype?.includes('OpenBookMarket') === false);

    // Fallback: query RPC CPMM pools directly and match mints
    if (!target) {
      const pools = await raydium.cpmm.getRpcPoolInfos([]);
      for (const [poolId, info] of Object.entries(pools as Record<string, any>)) {
        if (
          (info.mintA?.toBase58?.() === baseMint.toBase58() && info.mintB?.toBase58?.() === mints.WSOL) ||
          (info.mintB?.toBase58?.() === baseMint.toBase58() && info.mintA?.toBase58?.() === mints.WSOL)
        ) {
          const byId = await raydium.api.fetchPoolById({ ids: poolId });
          target = (Array.isArray(byId) ? byId[0] : byId?.[0]) as any;
          if (target) break;
        }
      }
    }

    if (!target) throw new Error('Raydium CPMM pool not found for pair');
    return target;
  }
}

// code here