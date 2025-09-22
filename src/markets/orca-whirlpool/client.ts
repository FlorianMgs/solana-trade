import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { Percentage } from '@orca-so/common-sdk/dist';
import { PROGRAM_IDS_PUBLIC_KEYS } from '../../helpers/program-ids';
import { buildWhirlpoolSdk, resolveWhirlpoolForPair } from './pool-utils';

export class OrcaWhirlpoolClient {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  private stripNonEssentialInstructions(ixs: TransactionInstruction[]): TransactionInstruction[] {
    return ixs.filter(ix => !ix.programId.equals(ComputeBudgetProgram.programId));
  }

  private buildSdk(owner?: PublicKey) { return buildWhirlpoolSdk(this.connection, owner); }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage, poolAddress } = params;
    const wsol = new PublicKey('So11111111111111111111111111111111111111112');
    const whirlpoolPk = poolAddress ?? await resolveWhirlpoolForPair(this.connection, mintAddress, wsol);

    const sdk = this.buildSdk(wallet);
    const whirlpool = await sdk.getPool(whirlpoolPk);

    // Validate tokens include mint and WSOL
    const tokenA = whirlpool.getTokenAInfo();
    const tokenB = whirlpool.getTokenBInfo();
    const mintsInPool = [tokenA.mint.toBase58(), tokenB.mint.toBase58()];
    if (!mintsInPool.includes(mintAddress.toBase58()) || !mintsInPool.includes(wsol.toBase58())) {
      throw new Error('Incompatible poolAddress for Orca Whirlpool: expected token-WSOL pair');
    }

    // Determine direction: aToB = true means token A -> token B
    const aIsWSOL = tokenA.mint.equals(wsol);
    const inputIsA = aIsWSOL; // buy target token using WSOL
    const aToB = inputIsA; // if input is A, A->B, else B->A
    const amount = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));
    const slippagePct = Percentage.fromFraction(Math.max(0, Math.min(10000, Math.round(slippage * 10000))), 10000);

    const fetcher = sdk.getFetcher();
    const quoteMod = await import('@orca-so/whirlpools-sdk/dist/quotes/public/swap-quote');
    const quote = await quoteMod.swapQuoteByInputToken(
      whirlpool,
      aIsWSOL ? wsol : tokenB.mint,
      amount,
      slippagePct,
      PROGRAM_IDS_PUBLIC_KEYS.ORCA_WHIRLPOOL_PROGRAM_ID as unknown as PublicKey,
      fetcher,
    );

    const txBuilder = await whirlpool.swap({
      amount: quote.amount,
      otherAmountThreshold: quote.otherAmountThreshold,
      sqrtPriceLimit: quote.sqrtPriceLimit,
      amountSpecifiedIsInput: true,
      aToB: aToB,
      tickArray0: quote.tickArray0,
      tickArray1: quote.tickArray1,
      tickArray2: quote.tickArray2,
      supplementalTickArrays: quote.supplementalTickArrays,
    }, wallet);

    // Extract TransactionInstructions from TransactionBuilder without building a tx
    const ixGroup = txBuilder.compressIx(true);
    const combined = [...ixGroup.instructions, ...ixGroup.cleanupInstructions];
    return this.stripNonEssentialInstructions(combined);
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; poolAddress?: PublicKey; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage, poolAddress } = params;
    const wsol = new PublicKey('So11111111111111111111111111111111111111112');
    const whirlpoolPk = poolAddress ?? await resolveWhirlpoolForPair(this.connection, mintAddress, wsol);

    const sdk = this.buildSdk(wallet);
    const whirlpool = await sdk.getPool(whirlpoolPk);

    const tokenA = whirlpool.getTokenAInfo();
    const tokenB = whirlpool.getTokenBInfo();
    const mintsInPool = [tokenA.mint.toBase58(), tokenB.mint.toBase58()];
    if (!mintsInPool.includes(mintAddress.toBase58()) || !mintsInPool.includes(wsol.toBase58())) {
      throw new Error('Incompatible poolAddress for Orca Whirlpool: expected token-WSOL pair');
    }

    const sellingIsA = tokenA.mint.equals(mintAddress);
    const decimals = sellingIsA ? tokenA.decimals : tokenB.decimals;
    const amount = new BN(Math.round(tokenAmount * Math.pow(10, decimals)));
    const slippagePct = Percentage.fromFraction(Math.max(0, Math.min(10000, Math.round(slippage * 10000))), 10000);

    const fetcher = sdk.getFetcher();
    const quoteMod = await import('@orca-so/whirlpools-sdk/dist/quotes/public/swap-quote');
    const quote = await quoteMod.swapQuoteByInputToken(
      whirlpool,
      sellingIsA ? tokenA.mint : tokenB.mint,
      amount,
      slippagePct,
      PROGRAM_IDS_PUBLIC_KEYS.ORCA_WHIRLPOOL_PROGRAM_ID as unknown as PublicKey,
      fetcher,
    );

    const aToB = sellingIsA; // if input is A, A->B else B->A
    const txBuilder = await whirlpool.swap({
      amount: quote.amount,
      otherAmountThreshold: quote.otherAmountThreshold,
      sqrtPriceLimit: quote.sqrtPriceLimit,
      amountSpecifiedIsInput: true,
      aToB: aToB,
      tickArray0: quote.tickArray0,
      tickArray1: quote.tickArray1,
      tickArray2: quote.tickArray2,
      supplementalTickArrays: quote.supplementalTickArrays,
    }, wallet);
    const ixGroup = txBuilder.compressIx(true);
    const combined = [...ixGroup.instructions, ...ixGroup.cleanupInstructions];
    return this.stripNonEssentialInstructions(combined);
  }
}
