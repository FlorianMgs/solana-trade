import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import BN from 'bn.js';
import { SugarMoneyProgram, SugarMoneyProgramConfig, SugarMoneyTradeDirectionEnum, SugarMoneyTradeTypeEnum } from 'sugar-money/program';
import { getTokenMetadata } from '../../helpers/token-metadata';

export class SugarClient {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;
    this.assertNonNegativeFinite(solAmount, 'solAmount');
    this.assertSlippage(slippage);

    const program = this.createProgram(wallet);
    const amountLamports = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));

    const [tradeInfo, error] = await program.getTrade({
      tradeType: SugarMoneyTradeTypeEnum.ExactIn,
      tradeDirection: SugarMoneyTradeDirectionEnum.Buy,
      amountToTrade: amountLamports,
      slippage: this.toBpsFromFraction(slippage),
      mint: mintAddress,
      receiver: wallet,
    });
    if (error) throw error;
    if (!tradeInfo.ix) throw new Error('Sugar getTrade returned no instruction');
    return [tradeInfo.ix];
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;
    this.assertNonNegativeFinite(tokenAmount, 'tokenAmount');
    this.assertSlippage(slippage);

    const program = this.createProgram(wallet);
    const meta = await getTokenMetadata(this.connection, mintAddress.toBase58());
    const decimals = meta?.decimals ?? 6;
    const tokensBase = this.toTokenBaseUnitsBN(tokenAmount, decimals);

    const [tradeInfo, error] = await program.getTrade({
      tradeType: SugarMoneyTradeTypeEnum.ExactIn,
      tradeDirection: SugarMoneyTradeDirectionEnum.Sell,
      amountToTrade: tokensBase,
      slippage: this.toBpsFromFraction(slippage),
      mint: mintAddress,
      receiver: wallet,
    });
    if (error) throw error;
    if (!tradeInfo.ix) throw new Error('Sugar getTrade returned no instruction');
    return [tradeInfo.ix];
  }

  private createProgram(owner: PublicKey): SugarMoneyProgram {
    const provider = new AnchorProvider(this.connection, new Wallet({ publicKey: owner } as any), { commitment: 'processed' } as any);
    const cluster = this.detectCluster();
    const config = new SugarMoneyProgramConfig(cluster);
    return new SugarMoneyProgram(provider, cluster, config);
  }

  private detectCluster(): 'localnet' | 'devnet' | 'production' | 'mainnet-test' {
    const url = ((this.connection as any)._rpcEndpoint || '').toLowerCase();
    if (url.includes('localhost') || url.includes('127.0.0.1')) return 'localnet';
    if (url.includes('devnet')) return 'devnet';
    // prefer production for mainnet endpoints
    if (url.includes('mainnet') || url.includes('helius') || url.includes('quicknode') || url.includes('rpc') || url.includes('projectserum')) return 'production';
    return 'production';
  }

  private toBpsFromFraction(slippage: number): number {
    let bps = Math.round(slippage * 10000);
    if (bps >= 10000) bps = 9999;
    if (bps < 0) bps = 0;
    return bps;
  }

  private toTokenBaseUnitsBN(tokens: number, decimals: number): BN {
    if (!Number.isFinite(tokens) || tokens < 0) throw new Error('tokenAmount must be a non-negative finite number');
    const factor = Math.pow(10, Math.max(0, Math.min(12, decimals | 0)));
    return new BN(Math.round(tokens * factor));
  }

  private assertSlippage(slippage: number) {
    if (!Number.isFinite(slippage) || slippage < 0 || slippage > 1) {
      throw new Error('slippage must be between 0 and 1');
    }
  }

  private assertNonNegativeFinite(value: number, name: string) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be a non-negative finite number`);
    }
  }
}
