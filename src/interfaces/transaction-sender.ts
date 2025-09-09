import { Transaction, Keypair, SendOptions } from '@solana/web3.js';

// Define the Transaction Sender Interface
export interface TransactionSenderClient {
  simulateTransaction(
    transaction: Transaction,
  ): Promise<any>;
  
  sendTransaction(
    transaction: Transaction,
    payer: Keypair,
    priorityFee: number,
    tipAmount: number,
    skipSimulation: boolean,
    options?: SendOptions
  ): Promise<string>;
}


