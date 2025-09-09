import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { Raydium, LAUNCHPAD_PROGRAM, PlatformConfig, getPdaLaunchpadPoolId, TxVersion } from '@raydium-io/raydium-sdk-v2';
import { NATIVE_MINT } from '@solana/spl-token';

export class RaydiumLaunchpadClient {
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

  private async derivePool(raydium: Raydium, mintA: PublicKey) {
    const programId = LAUNCHPAD_PROGRAM;
    const poolId = getPdaLaunchpadPoolId(programId, mintA, NATIVE_MINT).publicKey;
    const poolInfo = await raydium.launchpad.getRpcPoolInfo({ poolId });
    const platformAcc = await raydium.connection.getAccountInfo(poolInfo.platformId);
    const platformInfo = PlatformConfig.decode(platformAcc!.data);
    const mintInfo = await raydium.token.getTokenInfo(mintA);
    return { programId, poolId, poolInfo, platformInfo, mintInfo };
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;
    const raydium = await this.getRaydium(wallet);

    const { programId, poolInfo, platformInfo, mintInfo } = await this.derivePool(raydium, mintAddress);

    const inAmount = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));
    const slippageBps = new BN(Math.max(0, Math.min(10000, Math.round(slippage * 10000))));

    const make = await raydium.launchpad.buyToken({
      programId,
      mintA: mintAddress,
      mintAProgram: new PublicKey(mintInfo.programId),
      poolInfo,
      // mintB defaults to SOL
      // minMintAAmount optional (SDK computes)
      slippage: slippageBps,
      configInfo: poolInfo.configInfo,
      platformFeeRate: platformInfo.feeRate,
      txVersion: TxVersion.LEGACY,
      buyAmount: inAmount,
    });

    return make.transaction.instructions;
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;
    const raydium = await this.getRaydium(wallet);

    const { programId, poolInfo, platformInfo, mintInfo } = await this.derivePool(raydium, mintAddress);

    const decimals: number = mintInfo.decimals ?? 6;
    const inAmount = new BN(Math.round(tokenAmount * Math.pow(10, decimals)));
    const slippageBps = new BN(Math.max(0, Math.min(10000, Math.round(slippage * 10000))));

    const make = await raydium.launchpad.sellToken({
      programId,
      mintA: mintAddress,
      mintAProgram: new PublicKey(mintInfo.programId),
      poolInfo,
      configInfo: poolInfo.configInfo,
      platformFeeRate: platformInfo.feeRate,
      txVersion: TxVersion.LEGACY,
      sellAmount: inAmount,
      // mintB defaults to SOL
      // slippage for sell is handled inside SDK using config/platform data
    });

    return make.transaction.instructions;
  }
}

// code here