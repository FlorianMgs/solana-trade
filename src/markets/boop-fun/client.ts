import { Connection, PublicKey, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountIdempotentInstruction } from '@solana/spl-token';

export class BoopFunClient {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;
    this.assertNonNegativeFinite(solAmount, 'solAmount');
    this.assertSlippage(slippage);

    const programId = new PublicKey('boop8hVGQGqehUK2iVEMEnMrL5RbjywRzHKBmBE7ry4');
    const bondingCurve = this.findPda(['bonding_curve', mintAddress.toBuffer()], programId);
    const tradingFeesVault = this.findPda(['trading_fees_vault', mintAddress.toBuffer()], programId);
    const bondingCurveVault = this.findPda(['bonding_curve_vault', mintAddress.toBuffer()], programId);
    const bondingCurveSolVault = this.findPda(['bonding_curve_sol_vault', mintAddress.toBuffer()], programId);
    const vaultAuthority = this.findPda(['vault_authority'], programId);
    const configPda = this.findPda(['config'], programId);

    let ata: PublicKey;
    try {
      ata = getAssociatedTokenAddressSync(mintAddress, wallet, false);
    } catch (e) {
      throw e;
    }
    const createAtaIx = createAssociatedTokenAccountIdempotentInstruction(wallet, ata, wallet, mintAddress);

    const inputLamports = new BN(Math.round(solAmount * LAMPORTS_PER_SOL));
    const minOut = await this.quoteBuyMinOut(programId, mintAddress, inputLamports, this.toBpsFromFraction(slippage));

    const accounts = {
      mint: mintAddress,
      bondingCurve,
      tradingFeesVault,
      bondingCurveVault,
      bondingCurveSolVault,
      recipientTokenAccount: ata,
      buyer: wallet,
      config: configPda,
      vaultAuthority,
      wsol: new PublicKey('So11111111111111111111111111111111111111112'),
    };

    const buyIx = this.buildBuyInstruction(programId, accounts as any, inputLamports, minOut);

    return [createAtaIx, buyIx];
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;
    this.assertNonNegativeFinite(tokenAmount, 'tokenAmount');
    this.assertSlippage(slippage);

    const programId = new PublicKey('boop8hVGQGqehUK2iVEMEnMrL5RbjywRzHKBmBE7ry4');
    const bondingCurve = this.findPda(['bonding_curve', mintAddress.toBuffer()], programId);
    const tradingFeesVault = this.findPda(['trading_fees_vault', mintAddress.toBuffer()], programId);
    const bondingCurveVault = this.findPda(['bonding_curve_vault', mintAddress.toBuffer()], programId);
    const vaultAuthority = this.findPda(['vault_authority'], programId);

    const tokensBase = await this.toTokenBaseUnitsBN(mintAddress, tokenAmount);
    const minOutLamports = await this.quoteSellMinOut(programId, mintAddress, tokensBase, this.toBpsFromFraction(slippage));

    const accounts = {
      mint: mintAddress,
      bondingCurve,
      tradingFeesVault,
      bondingCurveVault,
      bondingCurveSolVault: this.findPda(['bonding_curve_sol_vault', mintAddress.toBuffer()], programId),
      sellerTokenAccount: getAssociatedTokenAddressSync(mintAddress, wallet, false),
      seller: wallet,
      recipient: wallet,
      config: this.findPda(['config'], programId),
      systemProgram: new PublicKey('11111111111111111111111111111111'),
      tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
    } as any;

    const sellIx = this.buildSellInstruction(programId, accounts as any, tokensBase, minOutLamports);

    return [sellIx];
  }

  private buildBuyInstruction(programId: PublicKey, acc: any, buyAmount: BN, amountOutMin: BN): TransactionInstruction {
    const disc = Uint8Array.from([138,127,14,91,38,87,115,105]);
    const data = Buffer.concat([Buffer.from(disc), this.encodeU64(buyAmount), this.encodeU64(amountOutMin)]);
    const keys = [
      { pubkey: acc.mint, isSigner: false, isWritable: false },
      { pubkey: acc.bondingCurve, isSigner: false, isWritable: true },
      { pubkey: acc.tradingFeesVault, isSigner: false, isWritable: true },
      { pubkey: acc.bondingCurveVault, isSigner: false, isWritable: true },
      { pubkey: acc.bondingCurveSolVault, isSigner: false, isWritable: true },
      { pubkey: acc.recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: acc.buyer, isSigner: true, isWritable: true },
      { pubkey: acc.config, isSigner: false, isWritable: false },
      { pubkey: acc.vaultAuthority, isSigner: false, isWritable: false },
      { pubkey: acc.wsol, isSigner: false, isWritable: false },
      { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false },
      { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
      { pubkey: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'), isSigner: false, isWritable: false },
    ];
    return new TransactionInstruction({ programId, keys, data });
  }

  private buildSellInstruction(programId: PublicKey, acc: any, tokensIn: BN, minSolOut: BN): TransactionInstruction {
    const disc = Uint8Array.from([109,61,40,187,230,176,135,174]);
    const data = Buffer.concat([Buffer.from(disc), this.encodeU64(tokensIn), this.encodeU64(minSolOut)]);
    const keys = [
      { pubkey: acc.mint, isSigner: false, isWritable: false },
      { pubkey: acc.bondingCurve, isSigner: false, isWritable: true },
      { pubkey: acc.tradingFeesVault, isSigner: false, isWritable: true },
      { pubkey: acc.bondingCurveVault, isSigner: false, isWritable: true },
      { pubkey: acc.bondingCurveSolVault, isSigner: false, isWritable: true },
      { pubkey: acc.sellerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: acc.seller, isSigner: true, isWritable: true },
      { pubkey: acc.recipient, isSigner: false, isWritable: true },
      { pubkey: acc.config, isSigner: false, isWritable: false },
      { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false },
      { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
      { pubkey: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'), isSigner: false, isWritable: false },
    ];
    return new TransactionInstruction({ programId, keys, data });
  }

  private encodeU64(value: BN): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(BigInt(value.toString()));
    return buf;
  }

  private async quoteBuyMinOut(programId: PublicKey, mint: PublicKey, amountInLamports: BN, slippageBps: BN): Promise<BN> {
    const bondingCurve = this.findPda(['bonding_curve', mint.toBuffer()], programId);
    const accInfo = await this.connection.getAccountInfo(bondingCurve, 'confirmed');
    if (!accInfo) return new BN(0);
    const account = this.decodeBondingCurve(accInfo.data);
    if (!account) return new BN(0);

    const swapFeeBps = new BN(account.swapFeeBasisPoints);
    const amountAfterFee = amountInLamports.sub(amountInLamports.mul(swapFeeBps).div(new BN(10_000)));

    let expected: BN;
    if (account.dampingTerm === 30) {
      const scalingFactor = new BN(account.dampingTerm).mul(new BN(account.virtualTokenReserves)).mul(new BN(LAMPORTS_PER_SOL));
      const initialSOL = new BN(account.virtualSolReserves).add(new BN(account.solReserves));
      expected = scalingFactor.div(initialSOL).sub(scalingFactor.div(initialSOL.add(amountAfterFee)));
    } else if (account.dampingTerm === 31) {
      const tokenReserves = new BN(account.tokenReserves);
      const tokenTotalSupply = new BN(LAMPORTS_PER_SOL).mul(new BN(LAMPORTS_PER_SOL));
      const invariant = new BN(account.virtualSolReserves).mul(tokenTotalSupply);
      const totalSol = new BN(account.virtualSolReserves).add(new BN(account.solReserves)).add(amountAfterFee);
      const newY = invariant.div(totalSol);
      expected = tokenReserves.sub(newY);
    } else {
      return new BN(0);
    }
    return expected.mul(new BN(10_000).sub(slippageBps)).div(new BN(10_000));
  }

  private async quoteSellMinOut(programId: PublicKey, mint: PublicKey, tokensInBase: BN, slippageBps: BN): Promise<BN> {
    const bondingCurve = this.findPda(['bonding_curve', mint.toBuffer()], programId);
    const accInfo = await this.connection.getAccountInfo(bondingCurve, 'confirmed');
    if (!accInfo) return new BN(0);
    const account = this.decodeBondingCurve(accInfo.data);
    if (!account) return new BN(0);

    let expected: BN;
    if (account.dampingTerm === 30) {
      const scalingFactor = new BN(account.dampingTerm).mul(new BN(account.virtualTokenReserves)).mul(new BN(LAMPORTS_PER_SOL));
      const tokensIssued = new BN(1_000_000_000).mul(new BN(LAMPORTS_PER_SOL)).sub(new BN(account.tokenReserves));
      const baseDenominator = new BN(account.virtualTokenReserves).sub(tokensIssued);
      const beforeFee = scalingFactor.div(baseDenominator).sub(scalingFactor.div(baseDenominator.add(tokensInBase)));
      expected = beforeFee.mul(new BN(10_000).sub(new BN(account.swapFeeBasisPoints))).div(new BN(10_000));
    } else if (account.dampingTerm === 31) {
      const currentX = new BN(account.virtualSolReserves).add(new BN(account.solReserves));
      const tokenTotalSupply = new BN(1_000_000_000).mul(new BN(LAMPORTS_PER_SOL));
      const invariant = new BN(account.virtualSolReserves).mul(tokenTotalSupply);
      const denominator = new BN(account.tokenReserves).add(tokensInBase);
      const newX = invariant.div(denominator);
      const beforeFee = currentX.sub(newX);
      expected = beforeFee.mul(new BN(10_000).sub(new BN(account.swapFeeBasisPoints))).div(new BN(10_000));
    } else {
      return new BN(0);
    }
    return expected.mul(new BN(10_000).sub(slippageBps)).div(new BN(10_000));
  }

  private decodeBondingCurve(data: Buffer): { dampingTerm: number; virtualTokenReserves: string; virtualSolReserves: string; solReserves: string; tokenReserves: string; swapFeeBasisPoints: number } | null {
    try {
      // Minimal binary reader using layout inferred from on-chain program: we expect small fixed fields.
      // If format drifts, we fail safe to null.
      const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
      let o = 0;
      // Skip anchor account discriminator (8 bytes)
      o += 8;
      // creator (32), mint (32)
      o += 64;
      const virtualSolReserves = this.readU128(dv, o); o += 16;
      const virtualTokenReserves = this.readU128(dv, o); o += 16;
      const graduationTarget = this.readU128(dv, o); o += 16;
      const graduationFee = this.readU64(dv, o); o += 8;
      const solReserves = this.readU128(dv, o); o += 16;
      const tokenReserves = this.readU128(dv, o); o += 16;
      const dampingTerm = dv.getUint8(o); o += 1;
      const swapFeeBasisPoints = dv.getUint16(o, true); o += 2;
      // tokenForStakersBasisPoints u16
      o += 2;
      return {
        dampingTerm,
        virtualTokenReserves,
        virtualSolReserves,
        solReserves,
        tokenReserves,
        swapFeeBasisPoints,
      } as any;
    } catch {
      return null;
    }
  }

  private readU64(dv: DataView, o: number): string {
    const lo = dv.getUint32(o, true);
    const hi = dv.getUint32(o + 4, true);
    return new BN(hi).shln(32).add(new BN(lo)).toString();
  }

  private readU128(dv: DataView, o: number): string {
    const a = dv.getUint32(o, true);
    const b = dv.getUint32(o + 4, true);
    const c = dv.getUint32(o + 8, true);
    const d = dv.getUint32(o + 12, true);
    return new BN(d).shln(96).add(new BN(c).shln(64)).add(new BN(b).shln(32)).add(new BN(a)).toString();
  }

  private findPda(seeds: (string | Buffer)[], programId: PublicKey): PublicKey {
    const buffers = seeds.map(s => typeof s === 'string' ? Buffer.from(s) : s);
    return PublicKey.findProgramAddressSync(buffers, programId)[0];
  }

  private toBpsFromFraction(slippage: number): BN {
    let bps = Math.round(slippage * 10000);
    if (bps >= 10000) bps = 9999;
    if (bps < 0) bps = 0;
    return new BN(bps);
  }

  // TODO: implement slippage-enforced minOut via on-chain curve state once canonical account layout is available

  private async toTokenBaseUnitsBN(mint: PublicKey, amountUi: number): Promise<BN> {
    if (!Number.isFinite(amountUi) || amountUi < 0) throw new Error('tokenAmount must be a non-negative finite number');
    const info = await this.connection.getParsedAccountInfo(mint, 'confirmed');
    const decimals = Number((info.value as any)?.data?.parsed?.info?.decimals ?? 6);
    const factor = Math.pow(10, Math.max(0, Math.min(12, decimals | 0)));
    return new BN(Math.round(amountUi * factor));
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


