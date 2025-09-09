import { PublicKey } from "@solana/web3.js";


export interface BuyParams {
  mintAddress: PublicKey;
  wallet: PublicKey;
  solAmount: number; // in SOL
  slippage: number; // 0..1 fraction (e.g. 0.01 for 1%)
}

export interface SellParams {
  mintAddress: PublicKey;
  wallet: PublicKey;
  tokenAmount: number; // in tokens (decimals=6)
  slippage: number; // 0..1 fraction (e.g. 0.01 for 1%)
}
