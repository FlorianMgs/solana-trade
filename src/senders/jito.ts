import {
  Connection,
  Keypair,
  Transaction
} from '@solana/web3.js';
import { serializeTransactionBase64, simulateTransaction as simulateTx, monitorTransactionConfirmation } from '../helpers/transactions';
import { TransactionSenderClient, SenderExtras } from '../interfaces/transaction-sender';
import { JITO_REGIONS } from '../helpers/constants';

export class JitoSenderClient implements TransactionSenderClient {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async simulateTransaction(transaction: Transaction): Promise<any> {
    return simulateTx(transaction, this.connection);
  }

  async sendTransaction(
    transaction: Transaction,
    payer: Keypair,
    _priorityFee: number = 0.0001,
    _tipAmount: number = 0,
    skipSimulation: boolean = false,
    _options: any = {},
    extras?: SenderExtras,
    skipConfirmation: boolean = false
  ): Promise<string> {
    try {
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('processed');
      transaction.recentBlockhash = blockhash;
      if (!transaction.feePayer) {
        transaction.feePayer = payer.publicKey;
      }
      transaction.sign(payer);

      if (!skipSimulation) {
        const sim = await this.simulateTransaction(transaction);
        if (!sim.success) {
          throw new Error(`Simulation failed: ${JSON.stringify(sim.error)}`);
        }
      }

      const encodedTx = serializeTransactionBase64(transaction);

      const regionKey = (extras?.region || '').toUpperCase();
      const regionEntries = Object.entries(JITO_REGIONS_SAFE());
      const baseUrl = JITO_REGIONS_SAFE()[regionKey] || regionEntries[Math.floor(Math.random() * regionEntries.length)][1];
      const url = `${baseUrl}/api/v1/transactions`;

      const body = {
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [
          encodedTx,
          { encoding: 'base64' },
        ],
      };

      const headers: Record<string, string> = {
        'content-type': 'application/json',
        'accept': 'application/json',
      };
      const uuid = process.env.JITO_UUID;
      if (uuid) {
        headers['x-jito-auth'] = uuid;
      } else {
        console.warn('JITO_UUID not set; proceeding without x-jito-auth header');
      }

      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Jito HTTP ${resp.status}: ${text}`);
      }
      const json: any = await resp.json();
      if (json.error) {
        throw new Error(`Jito RPC error: ${JSON.stringify(json.error)}`);
      }
      const signature: string = json.result;

      if (!skipConfirmation) {
        try {
          await monitorTransactionConfirmation(signature, this.connection, lastValidBlockHeight);
        } catch (e) {
          console.warn(`Warning: Could not confirm Jito tx ${signature}: ${e}`);
        }
      } else {
        console.log(`Jito transaction ${signature} sent, skipping confirmation monitoring`);
      }

      return signature;
    } catch (e: any) {
      throw new Error(`Failed to send via Jito: ${e.message || String(e)}`);
    }
  }
}

function JITO_REGIONS_SAFE(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [k, v] of Object.entries(JITO_REGIONS)) {
    map[k.toUpperCase()] = v;
  }
  return map;
}


