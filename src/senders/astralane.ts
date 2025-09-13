import {
  Connection,
  Keypair,
  Transaction
} from '@solana/web3.js';
import { serializeTransactionBase64, simulateTransaction as simulateTx, monitorTransactionConfirmation } from '../helpers/transactions';
import { TransactionSenderClient, SenderExtras } from '../interfaces/transaction-sender';
import { ASTRALANE_REGIONS } from '../helpers/constants';

export class AstralaneSenderClient implements TransactionSenderClient {
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
    extras?: SenderExtras
  ): Promise<string> {
    try {
      if (!skipSimulation) {
        const sim = await this.simulateTransaction(transaction);
        if (!sim.success) {
          throw new Error(`Simulation failed: ${JSON.stringify(sim.error)}`);
        }
      }

      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('processed');
      transaction.recentBlockhash = blockhash;
      if (!transaction.feePayer) {
        transaction.feePayer = payer.publicKey;
      }
      transaction.sign(payer);

      const encodedTx = serializeTransactionBase64(transaction);

      const regionKey = (extras?.region || '').toUpperCase();
      const regionEntries = Object.entries(ASTRALANE_REGIONS_SAFE());
      const chosenRegion = ASTRALANE_REGIONS_SAFE()[regionKey] || regionEntries[Math.floor(Math.random() * regionEntries.length)][1];

      const url = `${chosenRegion}`;
      const body = {
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [
          encodedTx,
          { encoding: 'base64', skipPreflight: true },
          { mevProtect: Boolean(extras?.antimev) },
        ],
      };

      const headers: Record<string, string> = {
        'content-type': 'application/json',
        'accept': 'application/json',
      };
      const apiKey = process.env.ASTRALANE_API_KEY;
      if (!apiKey) {
        console.warn('Astralane API key missing. Proceeding without header.');
      } else {
        headers['api_key'] = apiKey;
      }

      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Astralane HTTP ${resp.status}: ${text}`);
      }
      const json: any = await resp.json();
      if (json.error) {
        throw new Error(`Astralane RPC error: ${JSON.stringify(json.error)}`);
      }
      const signature: string = json.result;

      try {
        await monitorTransactionConfirmation(signature, this.connection, lastValidBlockHeight);
      } catch (e) {
        console.warn(`Warning: Could not confirm Astralane tx ${signature}: ${e}`);
      }

      return signature;
    } catch (e: any) {
      throw new Error(`Failed to send via Astralane: ${e.message || String(e)}`);
    }
  }
}

function ASTRALANE_REGIONS_SAFE(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [k, v] of Object.entries(ASTRALANE_REGIONS)) {
    map[k.toUpperCase()] = v;
  }
  return map;
}


