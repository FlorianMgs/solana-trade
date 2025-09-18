import { Connection, Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';

export interface BuildTransactionParams {
  connection: Connection;
  market: string;
  direction: string;
  wallet: Keypair;
  mint: PublicKey;
  poolAddress?: PublicKey;
  amount: number;
  slippage: number; // 0..1
  priorityFeeSol?: number; // default 0.0001
  additionalInstructions?: TransactionInstruction[];
}


