import { 
  Connection,
  Keypair,
  Transaction
} from '@solana/web3.js';
import { serializeTransactionBase64, simulateTransaction as simulateTx, monitorTransactionConfirmation } from '../helpers/transactions';
import { TransactionSenderClient, SenderExtras } from '../interfaces/transaction-sender';
import { NOZOMI_REGIONS } from '../helpers/constants';

export class NozomiSenderClient implements TransactionSenderClient {
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
      const regionEntries = Object.entries(NOOZOMI_REGIONS_SAFE());
      const chosenRegion = NOOZOMI_REGIONS_SAFE()[regionKey] || regionEntries[Math.floor(Math.random() * regionEntries.length)][1];

      const apiKey = resolveNozomiApiKey(Boolean(extras?.antimev));
      if (!apiKey) {
        console.warn('Nozomi API key missing. Proceeding with blank ?c=');
      }
      const url = `${chosenRegion}${apiKey || ''}`;

      const body = {
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [
          encodedTx,
          { encoding: 'base64', skipPreflight: true },
        ],
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Nozomi HTTP ${resp.status}: ${text}`);
      }
      const json: any = await resp.json();
      if (json.error) {
        throw new Error(`Nozomi RPC error: ${JSON.stringify(json.error)}`);
      }
      const signature: string = json.result;

      try {
        await monitorTransactionConfirmation(signature, this.connection, lastValidBlockHeight);
      } catch (e) {
        console.warn(`Warning: Could not confirm Nozomi tx ${signature}: ${e}`);
      }

      return signature;
    } catch (e: any) {
      throw new Error(`Failed to send via Nozomi: ${e.message || String(e)}`);
    }
  }
}

function resolveNozomiApiKey(antimev: boolean): string | undefined {
  if (antimev) {
    return process.env.NOZOMI_API_KEY_ANTIMEV || process.env.NOZOMI_API_KEY || undefined;
  }
  return process.env.NOZOMI_API_KEY || undefined;
}

function NOOZOMI_REGIONS_SAFE(): Record<string, string> {
  // Defensive copy and uppercase keys for consistent lookup
  const map: Record<string, string> = {};
  for (const [k, v] of Object.entries(NOOZOMI_REGIONS_ORIGINAL)) {
    map[k.toUpperCase()] = v;
  }
  return map;
}

const NOOZOMI_REGIONS_ORIGINAL: Record<string, string> = NOZOMI_REGIONS;


