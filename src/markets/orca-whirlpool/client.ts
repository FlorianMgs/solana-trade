import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { buildWhirlpoolClient, WhirlpoolContext } from '@orca-so/whirlpools-sdk/dist';
import { Percentage, ReadOnlyWallet } from '@orca-so/common-sdk/dist';
import { PROGRAM_IDS_PUBLIC_KEYS } from '../../helpers/program-ids';
import { makePairKey, readPair, writePair, readGlobal, writeGlobal } from '../../helpers/disk-cache';

export class OrcaWhirlpoolClient {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  private stripNonEssentialInstructions(ixs: TransactionInstruction[]): TransactionInstruction[] {
    return ixs.filter(ix => !ix.programId.equals(ComputeBudgetProgram.programId));
  }

  private async fetchWhirlpoolsList(): Promise<any[]> {
    // Orca public list endpoint
    const url = 'https://api.mainnet.orca.so/v1/whirlpool/list';
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`Orca list API status ${res.status}`);
    const json: any = await res.json();
    const items: any[] = Array.isArray(json) ? json : json?.whirlpools || json?.pools || json?.data || [];
    return items;
  }

  private async resolveWhirlpoolForPair(tokenMint: PublicKey, wsol: PublicKey): Promise<PublicKey> {
    const token = tokenMint.toBase58();
    const wsolB58 = wsol.toBase58();
    const pairKey = makePairKey(token, wsolB58);
    const pairCached = readPair('orca_whirlpool', pairKey);
    if (pairCached?.address) return new PublicKey(pairCached.address);

    // Try global list (TTL cache)
    let global = readGlobal('orca_whirlpool');
    if (!global) {
      try {
        global = await this.fetchWhirlpoolsList();
        writeGlobal('orca_whirlpool', global);
      } catch (_e) {
        global = null;
      }
    }
    const items = (global ?? await this.fetchWhirlpoolsList()) as any[];
    const subset = items.filter((it: any) => {
      const a = it?.tokenA?.mint || it?.tokenMintA || it?.mintA
      const b = it?.tokenB?.mint || it?.tokenMintB || it?.mintB;
      return (
        (a === token && b === wsolB58) ||
        (b === token && a === wsolB58)
      );
    });
    if (subset.length === 0) throw new Error('Orca Whirlpool pool for mint-WSOL not found');

    // Select best by highest liquidity or tvl if available
    const best = subset.reduce((acc: any, it: any) => {
      const liqRaw = it?.liquidity ?? it?.tvl ?? it?.tvlUsd;
      const liq = typeof liqRaw === 'string' ? parseFloat(liqRaw) : Number(liqRaw ?? 0);
      if (!acc || liq > acc.score) return { address: it?.address || it?.whirlpoolAddress || it?.poolAddress, score: liq };
      return acc;
    }, null as null | { address: string; score: number });

    if (!best?.address) throw new Error('Orca Whirlpool pool address not found');
    writePair('orca_whirlpool', pairKey, best.address);
    return new PublicKey(best.address);
  }

  private buildSdk(owner?: PublicKey): ReturnType<typeof buildWhirlpoolClient> {
    const programId = PROGRAM_IDS_PUBLIC_KEYS.ORCA_WHIRLPOOL_PROGRAM_ID as unknown as PublicKey;
    const wallet = new ReadOnlyWallet(owner);
    const ctx = WhirlpoolContext.from(
      this.connection,
      wallet as any,
      programId,
      undefined,
      undefined,
      {
        accountResolverOptions: {
          createWrappedSolAccountMethod: 'ata',
          allowPDAOwnerAddress: true,
        },
      },
    );
    return buildWhirlpoolClient(ctx);
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;
    const wsol = new PublicKey('So11111111111111111111111111111111111111112');
    const whirlpoolPk = await this.resolveWhirlpoolForPair(mintAddress, wsol);

    const sdk = this.buildSdk(wallet);
    const whirlpool = await sdk.getPool(whirlpoolPk);

    // Determine direction: aToB = true means token A -> token B
    const tokenA = whirlpool.getTokenAInfo();
    const tokenB = whirlpool.getTokenBInfo();
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

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;
    const wsol = new PublicKey('So11111111111111111111111111111111111111112');
    const whirlpoolPk = await this.resolveWhirlpoolForPair(mintAddress, wsol);

    const sdk = this.buildSdk(wallet);
    const whirlpool = await sdk.getPool(whirlpoolPk);

    const tokenA = whirlpool.getTokenAInfo();
    const tokenB = whirlpool.getTokenBInfo();
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
