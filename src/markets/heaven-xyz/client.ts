import { Connection, PublicKey, Transaction, TransactionInstruction, ComputeBudgetProgram, VersionedTransaction, TransactionMessage, AddressLookupTableAccount } from '@solana/web3.js';
import { PROGRAM_IDS } from '../../helpers/program-ids';

type PoolInfoResponse = {
  data: {
    classification?: string;
  };
};

type QuoteBuyResponse = {
  config_version: number;
  max_lamport_spend: number;
  max_sol_spend: number;
  minimum_out: number;
  minimum_out_ui: number;
  mint: string;
  program_id: string;
  slippage_bps: number;
};

type QuoteSellResponse = {
  amount_in: number;
  amount_in_ui: number;
  config_version: number;
  minimum_out: number;
  minimum_out_ui: number;
  mint: string;
  program_id: string;
  slippage_bps: number;
};

type TxResponse = { tx: string };

export class HeavenClient {
  private readonly connection: Connection;
  private readonly baseUrl = 'https://tx.api.heaven.xyz';

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async getBuyInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; solAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, solAmount, slippage } = params;
    this.assertNonNegativeFinite(solAmount, 'solAmount');
    this.assertSlippage(slippage);

    const mint = mintAddress.toBase58();
    const program_id = PROGRAM_IDS.HEAVEN_PROGRAM_ID;
    const config_version = await this.determineConfigVersion(mint, program_id);
    const slippage_bps = this.toBpsFromFraction(slippage);

    const quote = await this.postJson<QuoteBuyResponse>('/quote/buy', {
      config_version,
      max_sol_spend: solAmount,
      mint,
      program_id,
      slippage_bps,
    });

    const txRes = await this.postJson<TxResponse>('/tx/buy', {
      encoded_user_defined_event_data: '',
      payer: wallet.toBase58(),
      quote_response: quote,
      compute_unit_limit: null,
      compute_unit_price: null,
      source: null,
    });

    return await this.decodeInstructions(txRes.tx);
  }

  async getSellInstructions(params: { mintAddress: PublicKey; wallet: PublicKey; tokenAmount: number; slippage: number; }): Promise<TransactionInstruction[]> {
    const { mintAddress, wallet, tokenAmount, slippage } = params;
    this.assertNonNegativeFinite(tokenAmount, 'tokenAmount');
    this.assertSlippage(slippage);

    const mint = mintAddress.toBase58();
    const program_id = PROGRAM_IDS.HEAVEN_PROGRAM_ID;
    const config_version = await this.determineConfigVersion(mint, program_id);
    const slippage_bps = this.toBpsFromFraction(slippage);

    const quote = await this.postJson<QuoteSellResponse>('/quote/sell', {
      amount_in_ui: tokenAmount,
      config_version,
      mint,
      program_id,
      slippage_bps,
    });

    const txRes = await this.postJson<TxResponse>('/tx/sell', {
      encoded_user_defined_event_data: '',
      payer: wallet.toBase58(),
      quote_response: quote,
      compute_unit_limit: null,
      compute_unit_price: null,
      source: null,
    });

    return await this.decodeInstructions(txRes.tx);
  }

  private async determineConfigVersion(mint: string, program_id: string): Promise<number> {
    try {
      const info = await this.postJson<PoolInfoResponse>('/data/pool-info', { mint, program_id });
      const classification = (info?.data?.classification || '').toLowerCase();
      if (classification.includes('creator')) return 2;
      return 1; // default to Community
    } catch (_) {
      return 1;
    }
  }

  private async postJson<T>(path: string, body: any): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Heaven API ${path} failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  }

  private async decodeInstructions(base64Tx: string): Promise<TransactionInstruction[]> {
    const raw = Buffer.from(base64Tx, 'base64');
    // Always attempt versioned first (Heaven API returns versioned tx)
    const vtx = VersionedTransaction.deserialize(new Uint8Array(raw));
    const message: any = vtx.message as any;

    let addressLookupTableAccounts: AddressLookupTableAccount[] | undefined;
    const lookups = Array.isArray(message.addressTableLookups) ? message.addressTableLookups : [];
    if (lookups.length > 0) {
      addressLookupTableAccounts = [];
      for (const lookup of lookups) {
        try {
          const key = lookup.accountKey instanceof PublicKey ? lookup.accountKey : new PublicKey(lookup.accountKey);
          const res = await this.connection.getAddressLookupTable(key);
          if (res.value) addressLookupTableAccounts.push(res.value);
        } catch (_) {
          // ignore missing ALT
        }
      }
    }

    const decompiled = TransactionMessage.decompile(vtx.message as any, addressLookupTableAccounts && addressLookupTableAccounts.length > 0 ? { addressLookupTableAccounts } : undefined);
    return decompiled.instructions.filter(ix => !ix.programId.equals(ComputeBudgetProgram.programId));
  }

  private toBpsFromFraction(slippage: number): number {
    let bps = Math.round(slippage * 10000);
    if (bps >= 10000) bps = 9999;
    if (bps < 0) bps = 0;
    return bps;
  }

  private assertSlippage(slippage: number) {
    if (!Number.isFinite(slippage) || slippage < 0 || slippage > 1) {
      throw new Error('slippage must be between 0 and 1');
    }
  }

  private assertNonNegativeFinite(value: number, name: string) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be a non-negative finite number`);
    }
  }
}
