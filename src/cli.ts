#!/usr/bin/env node
import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { SolanaTrade } from './trader';
import { markets as Markets, swapDirection as SwapDirection } from './helpers/constants';

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = 'true';
      }
    }
  }
  return args;
}

async function main() {
  try {
    const args = parseArgs(process.argv);
    const required = ['market', 'direction', 'mint', 'amount', 'slippage', 'private-key'];
    for (const r of required) {
      if (!(r in args)) {
        throw new Error(`Missing required arg --${r}`);
      }
    }

    const market = args['market']; // PUMP_FUN | PUMP_SWAP
    const direction = args['direction']; // buy | sell
    const mint = args['mint'];
    const amount = parseFloat(args['amount']);
    const slippage = parseFloat(args['slippage']); // 0..100
    const priorityFeeSol = args['priority-fee'] ? parseFloat(args['priority-fee']) : 0.0001;
    const tipAmountSol = args['tip'] ? parseFloat(args['tip']) : 0;
    const poolAddress = args['pool-address'];

    const pk58 = args['private-key'];
    const secret = bs58.decode(pk58);
    const wallet = Keypair.fromSecretKey(secret);

    const trade = new SolanaTrade(process.env.RPC_URL || undefined);

    if (direction === SwapDirection.BUY) {
      const sig = await trade.buy({ market, wallet, mint, amount, slippage, priorityFeeSol, tipAmountSol, poolAddress });
      console.log(sig);
      return;
    }
    if (direction === SwapDirection.SELL) {
      const sig = await trade.sell({ market, wallet, mint, amount, slippage, priorityFeeSol, tipAmountSol, poolAddress });
      console.log(sig);
      return;
    }

    throw new Error(`Unsupported direction: ${direction}`);
  } catch (e: any) {
    console.error(e.message || e);
    process.exit(1);
  }
}

main();


