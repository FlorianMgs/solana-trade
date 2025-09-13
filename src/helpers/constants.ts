export const LAMPORTS_TO_MICROLAMPORTS = 1e6;
export const BASE_COMPUTE_UNITS = 1e6;

export const markets = {
  PUMP_FUN: 'PUMP_FUN',
  PUMP_SWAP: 'PUMP_SWAP',
  RAYDIUM_AMM: 'RAYDIUM_AMM',
  RAYDIUM_CLMM: 'RAYDIUM_CLMM',
  RAYDIUM_CPMM: 'RAYDIUM_CPMM',
  RAYDIUM_LAUNCHPAD: 'RAYDIUM_LAUNCHPAD',
  METEORA_DLMM: 'METEORA_DLMM',
  METEORA_DAMM_V1: 'METEORA_DAMM_V1',
  METEORA_DAMM_V2: 'METEORA_DAMM_V2',
  METEORA_DBC: 'METEORA_DBC',
  ORCA_WHIRLPOOL: 'ORCA_WHIRLPOOL',
  MOONIT: 'MOONIT',
  HEAVEN: 'HEAVEN',
  SUGAR: 'SUGAR',
  BOOP_FUN: 'BOOP_FUN',
}

export const swapDirection = {
  BUY: 'buy',
  SELL: 'sell',
}

export const mints = {
  WSOL: 'So11111111111111111111111111111111111111112',
}

// Special transaction senders
export const senders = {
  NOZOMI: 'NOZOMI',
  ASTRALANE: 'ASTRALANE',
  JITO: 'JITO',
} as const;

// Nozomi configuration
export const NOZOMI_MIN_TIP_SOL = 0.001;
export const NOZOMI_TIP_ADDRESSES = [
  'TEMPaMeCRFAS9EKF53Jd6KpHxgL47uWLcpFArU1Fanq',
  'noz3jAjPiHuBPqiSPkkugaJDkJscPuRhYnSpbi8UvC4',
  'noz3str9KXfpKknefHji8L1mPgimezaiUyCHYMDv1GE',
  'noz6uoYCDijhu1V7cutCpwxNiSovEwLdRHPwmgCGDNo',
  'noz9EPNcT7WH6Sou3sr3GGjHQYVkN3DNirpbvDkv9YJ',
  'nozc5yT15LazbLTFVZzoNZCwjh3yUtW86LoUyqsBu4L',
  'nozFrhfnNGoyqwVuwPAW4aaGqempx4PU6g6D9CJMv7Z',
  'nozievPk7HyK1Rqy1MPJwVQ7qQg2QoJGyP71oeDwbsu',
  'noznbgwYnBLDHu8wcQVCEw6kDrXkPdKkydGJGNXGvL7',
  'nozNVWs5N8mgzuD3qigrCG2UoKxZttxzZ85pvAQVrbP',
  'nozpEGbwx4BcGp6pvEdAh1JoC2CQGZdU6HbNP1v2p6P',
  'nozrhjhkCr3zXT3BiT4WCodYCUFeQvcdUkM7MqhKqge',
  'nozrwQtWhEdrA6W8dkbt9gnUaMs52PdAv5byipnadq3',
  'nozUacTVWub3cL4mJmGCYjKZTnE9RbdY5AP46iQgbPJ',
  'nozWCyTPppJjRuw2fpzDhhWbW355fzosWSzrrMYB1Qk',
  'nozWNju6dY353eMkMqURqwQEoM3SFgEKC6psLCSfUne',
  'nozxNBgWohjR75vdspfxR5H9ceC7XXH99xpxhVGt3Bb',
];

// Prefer secure endpoints where available; values end with ?c=
export const NOZOMI_REGIONS: Record<string, string> = {
  PITT: 'https://pit1.secure.nozomi.temporal.xyz/?c=',
  TYO: 'http://tyo1.secure.nozomi.temporal.xyz/?c=',
  SG: 'http://sgp1.secure.nozomi.temporal.xyz/?c=',
  EWR: 'https://ewr1.secure.nozomi.temporal.xyz/?c=',
  AMS: 'https://ams1.secure.nozomi.temporal.xyz/?c=',
  FRA: 'http://fra2.secure.nozomi.temporal.xyz/?c=',
};

// Astralane configuration
export const ASTRALANE_MIN_TIP_SOL = 0.00001;
export const ASTRALANE_TIP_ADDRESSES = [
  'astrazznxsGUhWShqgNtAdfrzP2G83DzcWVJDxwV9bF',
  'astra4uejePWneqNaJKuFFA8oonqCE1sqF6b45kDMZm',
  'astra9xWY93QyfG6yM8zwsKsRodscjQ2uU2HKNL5prk',
  'astraRVUuTHjpwEVvNBeQEgwYx9w9CFyfxjYoobCZhL',
  'astraEJ2fEj8Xmy6KLG7B3VfbKfsHXhHrNdCQx7iGJK',
  'astraubkDw81n4LuutzSQ8uzHCv4BhPVhfvTcYv8SKC',
  'astraZW5GLFefxNPAatceHhYjfA1ciq9gvfEg2S47xk',
  'astrawVNP4xDBKT7rAdxrLYiTSTdqtUr63fSMduivXK',
];

// Region code to base endpoint (no query params). Use header auth for API key.
export const ASTRALANE_REGIONS: Record<string, string> = {
  FR: 'http://fr.gateway.astralane.io/iris',
  LAX: 'http://lax.gateway.astralane.io/iris',
  JP: 'http://jp.gateway.astralane.io/iris',
  NY: 'http://ny.gateway.astralane.io/iris',
  AMS: 'http://ams.gateway.astralane.io/iris',
  LIM: 'http://lim.gateway.astralane.io/iris',
};

// Jito configuration
export const JITO_MIN_TIP_SOL = 0; // For sendTransaction, no enforced min in docs (bundles require >=1000 lamports)
export const JITO_TIP_ADDRESSES = [
  '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
  'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
  'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
  'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
  'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
  'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
  'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
  '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
];

// Region code to Jito Block Engine URL (we will append /api/v1/transactions)
export const JITO_REGIONS: Record<string, string> = {
  MAINNET: 'https://mainnet.block-engine.jito.wtf',
  AMS: 'https://amsterdam.mainnet.block-engine.jito.wtf',
  DUB: 'https://dublin.mainnet.block-engine.jito.wtf',
  FRA: 'https://frankfurt.mainnet.block-engine.jito.wtf',
  LON: 'https://london.mainnet.block-engine.jito.wtf',
  NY: 'https://ny.mainnet.block-engine.jito.wtf',
  SLC: 'https://slc.mainnet.block-engine.jito.wtf',
  SG: 'https://singapore.mainnet.block-engine.jito.wtf',
  TYO: 'https://tokyo.mainnet.block-engine.jito.wtf',
};