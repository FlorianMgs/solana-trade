import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { Raydium, CurveCalculator, FeeOn, TxVersion } from '@raydium-io/raydium-sdk-v2';
import { mints } from '../../helpers/constants';
import { assertCpmmHasMintAndWsol, findCpmmPoolInfo, findCpmmPoolInfoById } from './pool-utils';

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

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage, poolAddress } = params;
    const raydium = await this.getRaydium(wallet);

    const poolInfo: any = poolAddress
      ? await findCpmmPoolInfoById(raydium, poolAddress)
      : await findCpmmPoolInfo(raydium, mintAddress);
    assertCpmmHasMintAndWsol(poolInfo, mintAddress);

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

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage, poolAddress } = params;
    const raydium = await this.getRaydium(wallet);

    const poolInfo: any = poolAddress
      ? await findCpmmPoolInfoById(raydium, poolAddress)
      : await findCpmmPoolInfo(raydium, mintAddress);
    assertCpmmHasMintAndWsol(poolInfo, mintAddress);

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
}
