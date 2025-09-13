import { 
  Transaction, 
  SendOptions, 
  Connection, 
  Keypair,
  TransactionInstruction
} from '@solana/web3.js';

import { simulateTransaction as simulateTx, monitorTransactionConfirmation } from '../helpers/transactions';

import { TransactionSenderClient, SenderExtras } from '../interfaces/transaction-sender';

/**
 * StandardClient class for sending transactions via standard Solana RPC
 */
export class StandardClient implements TransactionSenderClient {
  private connection: Connection;

  /**
   * Creates a new StandardClient
   * 
   * @param priorityFee Priority fee in SOL (default: 0.0001)
   */
  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Prepares a transaction for sending by adding necessary instructions
   * 
   * @param transaction Transaction to prepare
   * @param payer Payer that will sign the transaction
   * @returns Prepared transaction
   */
  /**
   * Simulates a transaction to verify it will be accepted by the network
   * 
   * @param transaction Transaction to simulate
   * @returns Detailed simulation results
   */
  async simulateTransaction(
    transaction: Transaction,
  ): Promise<any> {
    return simulateTx(transaction, this.connection);
  }

  /**
   * Sends a transaction via standard Solana RPC
   * 
   * @param transaction Transaction to send
   * @param payer Payer that will sign the transaction
   * @param skipSimulation Whether to skip transaction simulation
   * @param options Send options
   * @returns Transaction signature
   */
  async sendTransaction(
    transaction: Transaction,
    payer: Keypair,
    priorityFee: number = 0.0001,
    tipAmount: number = 0.001,
    skipSimulation: boolean = false,
    options: SendOptions = {},
    _extras?: SenderExtras
  ): Promise<string> {
    try {
      // Get a fresh blockhash immediately before sending
      if (!skipSimulation) {
        const simulationResult = await this.simulateTransaction(transaction);
        
        if (!simulationResult.success) {
          console.error('Transaction simulation failed:', simulationResult.error);
          console.error('Simulation logs:', simulationResult.logs);
          throw new Error(`Transaction simulation failed: ${JSON.stringify(simulationResult.error)}`);
        }
        console.log('Transaction simulation successful. Proceeding with sending...');
      }
      
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('processed');
      transaction.recentBlockhash = blockhash;
      console.log(`Using fresh blockhash: ${blockhash}, valid until height: ${lastValidBlockHeight}`);

      transaction.sign(payer);

      // Send the transaction
      const signature = await this.connection.sendTransaction(
        transaction,
        [payer],
        {
          skipPreflight: options.skipPreflight,
          preflightCommitment: options.preflightCommitment || 'processed',
          maxRetries: options.maxRetries,
        }
      );
      
      console.log(`Transaction sent via standard RPC: ${signature}`);
      
      // Monitor for confirmation
      try {
        await monitorTransactionConfirmation(signature, this.connection, lastValidBlockHeight);
        console.log(`Transaction ${signature} confirmed successfully`);
      } catch (confirmError) {
        // If the error is a timeout, log it but still return the signature
        // This allows the caller to handle the transaction as if it were sent
        // even if we can't confirm it landed on chain within our timeout window
        console.warn(`Warning: Could not confirm transaction ${signature}: ${confirmError}`);
        console.warn('Returning signature but transaction confirmation is uncertain');
      }
      
      return signature;
    } catch (error: any) {
      console.error('Error sending transaction via standard RPC:', error);
      throw new Error(`Failed to send transaction via standard RPC: ${error.message || 'Unknown error'}`);
    }
  }
} 