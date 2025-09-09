import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { Raydium, TxVersion } from '@raydium-io/raydium-sdk-v2';
import { mints } from '../../helpers/constants';

export class RaydiumAmmClient {
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

    const poolInfo: any = await this.findPoolInfo(raydium, mintAddress);
    const poolKeys: any = await raydium.liquidity.getAmmPoolKeys(poolInfo.id);
    const rpcData: any = await raydium.liquidity.getRpcPoolInfo(poolInfo.id);

    const inputMint = new PublicKey(mints.WSOL).toBase58();
    const baseIn = poolInfo.mintA.address === inputMint;
    const mintIn = baseIn ? poolInfo.mintA : poolInfo.mintB;
    const mintOut = baseIn ? poolInfo.mintB : poolInfo.mintA;

    const amountIn = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));

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
      mintOut: mintOut.address,
      slippage,
    });

    const make = await raydium.liquidity.swap({
      poolInfo,
      poolKeys,
      amountIn,
      amountOut: out.minAmountOut,
      fixedSide: 'in',
      inputMint: mintIn.address,
      txVersion: TxVersion.LEGACY,
    });

    return make.transaction.instructions;
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;
    const raydium = await this.getRaydium(wallet);

    const poolInfo: any = await this.findPoolInfo(raydium, mintAddress);
    const poolKeys: any = await raydium.liquidity.getAmmPoolKeys(poolInfo.id);
    const rpcData: any = await raydium.liquidity.getRpcPoolInfo(poolInfo.id);

    const baseIn = poolInfo.mintA.address === mintAddress.toBase58();
    const mintIn = baseIn ? poolInfo.mintA : poolInfo.mintB;
    const mintOut = baseIn ? poolInfo.mintB : poolInfo.mintA;

    const decimals = mintIn.decimals;
    const amountIn = new BN(Math.round(tokenAmount * Math.pow(10, decimals)));

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
      mintOut: mintOut.address,
      slippage,
    });

    const make = await raydium.liquidity.swap({
      poolInfo,
      poolKeys,
      amountIn,
      amountOut: out.minAmountOut,
      fixedSide: 'in',
      inputMint: mintIn.address,
      txVersion: TxVersion.LEGACY,
    });

    return make.transaction.instructions;
  }

  private async findPoolInfo(raydium: Raydium, baseMint: PublicKey) {
    const resp: any = await raydium.api.fetchPoolByMints({ mint1: baseMint.toBase58(), mint2: mints.WSOL });
    const list: any[] = Array.isArray(resp) ? resp : resp?.data || resp?.items || [];
    if (!list || list.length === 0) {
      throw new Error('Raydium pool not found for pair');
    }
    return list[0];
  }
}


