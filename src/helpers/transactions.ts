import { Connection, Transaction, TransactionInstruction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { createComputeBudgetInstructions } from './instructions';


/**
 * Prepares a basic transaction by adding compute budget instructions
 * @param transaction - Original transaction or instructions
 * @param payer - Payer that will sign the transaction
 * @param priorityFeeInSol - Priority fee in SOL
 * @returns Prepared transaction
 */
export const prepareTransaction = (
  transaction: Transaction | TransactionInstruction[],
  payer: PublicKey,
  priorityFeeSol: number = 0.0001
): Transaction => {
  // Create a new transaction
  const tx = new Transaction();
  
  // Add compute budget instructions
  const budgetInstructions = createComputeBudgetInstructions(priorityFeeSol);
  for (const instruction of budgetInstructions) {
    tx.add(instruction);
  }
  
  // Set fee payer
  tx.feePayer = payer;
  
  // Add the original transaction instructions
  if (transaction instanceof Transaction) {
    for (const instruction of transaction.instructions) {
      tx.add(instruction);
    }
  } else {
    for (const instruction of transaction) {
      tx.add(instruction);
    }
  }
  
  return tx;
}


/**
 * Serializes a Transaction to base64 string
 * @param transaction - The transaction to serialize
 * @returns Base64 encoded transaction string
 */
export const serializeTransactionBase64 = (transaction: Transaction): string => {
  return Buffer.from(transaction.serialize()).toString('base64');
}


/**
 * Simulates a transaction to verify it will be accepted by the network.
 *
 * IMPORTANT: The transaction is expected to be fully prepared before calling this:
 * - `recentBlockhash` must already be set
 * - `feePayer` must be set
 * - all required signatures must be present
 *
 * We intentionally avoid the deprecated `connection.simulateTransaction(Transaction|Message)`
 * helper and instead call the raw JSON-RPC `simulateTransaction` method with a
 * base64-encoded, fully-signed transaction.
 *
 * @param transaction - Transaction to simulate (must be signed)
 * @param connection - Connection to use for simulation
 * @returns Detailed simulation results
 */
export const simulateTransaction = async (
  transaction: Transaction,
  connection: Connection
): Promise<{
  success: boolean;
  result: any;
  logs: string[];
  error: any;
}> => {
  console.log('Simulating transaction before sending');

  try {
    let wire: Buffer;
    try {
      // Require all signatures and verify them so we fail fast on malformed txs
      const serialized = transaction.serialize({
        requireAllSignatures: true,
        verifySignatures: true,
      });
      wire = Buffer.from(serialized);
    } catch (e: any) {
      console.error('Failed to serialize transaction for simulation:', e);
      return {
        success: false,
        result: null,
        logs: [],
        error:
          e?.message ||
          'Failed to serialize transaction for simulation. Ensure it is fully signed and has a recent blockhash.',
      };
    }

    const encoded = wire.toString('base64');
    const cfg: any = {
      encoding: 'base64',
      commitment: 'processed',
      sigVerify: true,
    };

    console.log('Running simulation via raw RPC with sigVerify=true');
    const rpc: any = await (connection as any)._rpcRequest('simulateTransaction', [
      encoded,
      cfg,
    ]);

    if (!rpc || typeof rpc !== 'object') {
      console.error('Unexpected simulateTransaction RPC response shape:', rpc);
      return {
        success: false,
        result: rpc,
        logs: [],
        error: 'simulateTransaction RPC returned an unexpected response shape',
      };
    }

    if (rpc.error) {
      console.error('simulateTransaction RPC error:', rpc.error);
      return {
        success: false,
        result: null,
        logs: [],
        error: rpc.error.message ?? rpc.error,
      };
    }

    const res = rpc.result; // { context, value }
    const value = res?.value ?? {};

    const logs = Array.isArray(value.logs) ? value.logs : [];
    const err = value.err ?? null;

    return {
      success: err == null,
      result: res,
      logs,
      error: err,
    };
  } catch (error: any) {
    console.error('Error during transaction simulation:', error);
    return {
      success: false,
      error: error?.message || error,
      result: null,
      logs: [],
    };
  }
}


/**
 * Monitors a transaction to confirm it lands on chain
 * @param signature - Transaction signature to monitor
 * @param connection - Connection to use for monitoring
 * @param lastValidBlockHeight - The block height until which the transaction is valid
 * @returns Promise that resolves when transaction is confirmed or rejects when timeout occurs
 */
export const monitorTransactionConfirmation = async (
  signature: string,
  connection: Connection,
  lastValidBlockHeight: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Start a timeout to detect if the transaction doesn't confirm in time
    const timeoutId = setTimeout(() => {
      console.error(`Transaction ${signature} has not confirmed after 45 seconds. It may have been dropped.`);
      reject(new Error(`Transaction ${signature} has not confirmed after 45 seconds. It may have been dropped.`));
    }, 45000); // 45 seconds timeout

    // Wait for confirmation
    connection.confirmTransaction({
      signature,
      lastValidBlockHeight,
      blockhash: '', // Not needed when we have lastValidBlockHeight
    }, 'processed')
    .then(confirmation => {
      clearTimeout(timeoutId);
      
      if (confirmation.value.err) {
        console.error(`Transaction ${signature} confirmed but with error:`, confirmation.value.err);
        reject(new Error(`Transaction ${signature} confirmed but with error: ${JSON.stringify(confirmation.value.err)}`));
      } else {
        console.log(`Transaction ${signature} confirmed successfully on chain`);
        resolve();
      }
    })
    .catch(error => {
      clearTimeout(timeoutId);
      console.error(`Error monitoring transaction ${signature}:`, error);
      reject(error);
    });
  });
}