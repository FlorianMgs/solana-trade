import { Connection, PublicKey } from '@solana/web3.js';
import { TokenMetadata } from '../interfaces/solana';

export const METAPLEX_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export async function getTokenMetadata(connection: Connection, mintAddress: string): Promise<TokenMetadata | null> {
  try {
    const mintPublicKey = new PublicKey(mintAddress);

    const mintData = await getDecimalsAndSupplyToken(connection, mintAddress);
    if (!mintData) {
      return null;
    }
    const { supply, decimals } = mintData;

    const [metadataAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        METAPLEX_METADATA_PROGRAM_ID.toBuffer(),
        mintPublicKey.toBuffer(),
      ],
      METAPLEX_METADATA_PROGRAM_ID
    );

    const metadataAccountInfo = await connection.getAccountInfo(metadataAddress);
    if (!metadataAccountInfo) {
      return null;
    }

    const dataBuffer = Buffer.from(metadataAccountInfo.data);

    const nameOffset = 65; // 1 (key) + 32 (update auth) + 32 (mint)
    const nameLength = dataBuffer.readUInt32LE(nameOffset);
    const nameEnd = nameOffset + 4 + nameLength;
    const name = dataBuffer.toString('utf8', nameOffset + 4, nameEnd).replace(/\0/g, '');

    const symbolOffset = nameEnd;
    const symbolLength = dataBuffer.readUInt32LE(symbolOffset);
    const symbolEnd = symbolOffset + 4 + symbolLength;
    const symbol = dataBuffer.toString('utf8', symbolOffset + 4, symbolEnd).replace(/\0/g, '');

    const uriOffset = symbolEnd;
    const uriLength = dataBuffer.readUInt32LE(uriOffset);
    const uriEnd = uriOffset + 4 + uriLength;
    const uri = dataBuffer.toString('utf8', uriOffset + 4, uriEnd).replace(/\0/g, '');

    return {
      name,
      symbol,
      logo: uri,
      totalSupply: supply,
      decimals,
    };
  } catch (_err) {
    return null;
  }
}

export async function getDecimalsAndSupplyToken(connection: Connection, mintAddress: string): Promise<{ decimals: number; supply: number } | null> {
  try {
    const info = await connection.getParsedAccountInfo(new PublicKey(mintAddress), 'confirmed');
    const value: any = info.value;
    const data: any = value?.data;
    const parsed: any = data?.parsed;
    const type: any = parsed?.type || data?.program;
    if (type !== 'mint' && parsed?.type !== 'mint') return null;
    const decimals = Number(parsed?.info?.decimals ?? parsed?.parsed?.info?.decimals);
    const supplyStr = parsed?.info?.supply ?? parsed?.parsed?.info?.supply;
    const supply = typeof supplyStr === 'string' ? Number(supplyStr) : Number(supplyStr?.amount ?? supplyStr ?? 0);
    if (!Number.isFinite(decimals)) return null;
    return { decimals, supply: Number.isFinite(supply) ? supply : 0 };
  } catch (_err) {
    return null;
  }
}


