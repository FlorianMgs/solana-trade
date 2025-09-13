import { Transaction, Keypair, SendOptions } from '@solana/web3.js';

export type SpecialSender = 'NOZOMI' | 'ASTRALANE' | 'JITO';

export interface SenderExtras {
  provider?: SpecialSender;
  region?: string;
  antimev?: boolean;
}

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
    options?: SendOptions,
    extras?: SenderExtras
  ): Promise<string>;
}


