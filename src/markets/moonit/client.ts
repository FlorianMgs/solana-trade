import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import { Environment, FixedSide, Moonit } from '@moonit/sdk';

export class MoonitClient {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;
    this.assertNonNegativeFinite(solAmount, 'solAmount');
    this.assertSlippage(slippage);

    const { moonit } = this.createMoonit();
    const token = moonit.Token({ mintAddress: mintAddress.toBase58() });

    const collateralLamports = this.toLamportsBigInt(solAmount);

    const tokenAmount = await token.getTokenAmountByCollateral({
      collateralAmount: collateralLamports,
      tradeDirection: 'BUY',
    });

    const { ixs } = await token.prepareIxs({
      slippageBps: this.toBpsFromFraction(slippage),
      creatorPK: wallet.toBase58(),
      tokenAmount,
      collateralAmount: collateralLamports,
      tradeDirection: 'BUY',
      fixedSide: FixedSide.OUT,
    });

    return this.stripComputeBudget(ixs);
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;
    this.assertNonNegativeFinite(tokenAmount, 'tokenAmount');
    this.assertSlippage(slippage);

    const { moonit } = this.createMoonit();
    const token = moonit.Token({ mintAddress: mintAddress.toBase58() });

    const curve = await token.getCurveAccount();
    const baseUnits = this.toBaseUnitsBigInt(tokenAmount, Number(curve.decimals ?? 9));

    const collateralLamports = await token.getCollateralAmountByTokens({
      tokenAmount: baseUnits,
      tradeDirection: 'SELL',
    });

    const { ixs } = await token.prepareIxs({
      slippageBps: this.toBpsFromFraction(slippage),
      creatorPK: wallet.toBase58(),
      tokenAmount: baseUnits,
      collateralAmount: collateralLamports,
      tradeDirection: 'SELL',
      fixedSide: FixedSide.IN,
    });

    return this.stripComputeBudget(ixs);
  }

  private stripComputeBudget(ixs: TransactionInstruction[]): TransactionInstruction[] {
    return ixs.filter(ix => !ix.programId.equals(ComputeBudgetProgram.programId));
  }

  private toLamportsBigInt(sol: number): bigint {
    return BigInt(Math.round(sol * LAMPORTS_PER_SOL));
  }

  private toBaseUnitsBigInt(amount: number, decimals: number): bigint {
    const factor = Math.pow(10, Math.max(0, Math.min(12, decimals | 0)));
    return BigInt(Math.round(amount * factor));
  }

  private toBpsFromFraction(slippage: number): number {
    let bps = Math.round(slippage * 10000);
    if (bps >= 10000) bps = 9999; // Moonit program requires slippage < 100%
    if (bps < 0) bps = 0;
    return bps;
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

  private createMoonit(): { moonit: Moonit } {
    const rpcUrl: string = (this.connection as any)._rpcEndpoint || '';
    const moonit = new Moonit({
      rpcUrl,
      environment: Environment.MAINNET,
      chainOptions: { solana: { confirmOptions: { commitment: 'processed' } } },
    });
    return { moonit };
  }

}
