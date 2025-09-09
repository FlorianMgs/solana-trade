import { PublicKey } from "@solana/web3.js";
import { TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";


/**
 * Creates a tip instruction to send SOL to a specified address
 * @param tipAddress - The address to send the tip to
 * @param payer - The payer's public key
 * @param tipAmountSol - Amount to tip in SOL
 * @returns A transaction instruction for the tip
 */
export const createTipInstruction = (
  tipAddress: PublicKey,
  payer: PublicKey,
  tipAmountSol: number
): TransactionInstruction => {
  return SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: tipAddress,
    lamports: tipAmountSol * LAMPORTS_PER_SOL,
  });
}
