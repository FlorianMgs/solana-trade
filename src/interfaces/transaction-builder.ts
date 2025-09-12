import { Connection, Keypair, PublicKey } from '@solana/web3.js';

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
  tipAmountSol?: number; // default 0
}


