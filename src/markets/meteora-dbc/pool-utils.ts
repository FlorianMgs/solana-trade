import { Connection, PublicKey } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { mints } from '../../helpers/constants';
import { makePairKey, readPair, writePair } from '../../helpers/disk-cache';

export async function resolveDbcPoolByBaseMint(
	connection: Connection,
	baseMint: PublicKey,
): Promise<{ poolAddress: PublicKey; virtualPool: any; poolConfig: any }> {
	const token = baseMint.toBase58();
	const wsol = mints.WSOL;
	const pairKey = makePairKey(token, wsol);
	const pairCached = readPair('dbc', pairKey);
	const client = new DynamicBondingCurveClient(connection, 'processed');
	if (pairCached?.address) {
		const poolAddress = new PublicKey(pairCached.address);
		const virtualPool = await client.state.getPool(poolAddress);
		if (!virtualPool) throw new Error('DBC virtual pool state not found');
		const poolConfig = await client.state.getPoolConfig(virtualPool.config);
		const quoteMintFromConfig = (poolConfig as any)?.quoteMint?.toBase58?.() ?? String((poolConfig as any)?.quoteMint);
		if (quoteMintFromConfig !== mints.WSOL) throw new Error('DBC pool quote mint is not WSOL (SOL)');
		return { poolAddress, virtualPool, poolConfig };
	}

	const programAccount = await client.state.getPoolByBaseMint(baseMint);
	if (!programAccount) throw new Error('DBC pool for base mint not found');

	const poolAddress = (programAccount as any).publicKey as PublicKey;
	const virtualPool = (programAccount as any).account ?? await client.state.getPool(poolAddress);
	if (!virtualPool) throw new Error('DBC virtual pool state not found');

	const poolConfig = await client.state.getPoolConfig(virtualPool.config);
	const quoteMintFromConfig = (poolConfig as any)?.quoteMint?.toBase58?.() ?? String((poolConfig as any)?.quoteMint);
	if (quoteMintFromConfig !== mints.WSOL) {
		throw new Error('DBC pool quote mint is not WSOL (SOL)');
	}

	writePair('dbc', pairKey, poolAddress.toBase58());
	return { poolAddress, virtualPool, poolConfig };
}

export async function resolveDbcPoolById(
	connection: Connection,
	poolAddress: PublicKey,
): Promise<{ poolAddress: PublicKey; virtualPool: any; poolConfig: any }> {
	const client = new DynamicBondingCurveClient(connection, 'processed');
	const virtualPool = await client.state.getPool(poolAddress);
	if (!virtualPool) throw new Error('Pool not found for provided poolAddress');
	const poolConfig = await client.state.getPoolConfig(virtualPool.config);
	const quoteMintFromConfig = (poolConfig as any)?.quoteMint?.toBase58?.() ?? String((poolConfig as any)?.quoteMint);
	if (quoteMintFromConfig !== mints.WSOL) throw new Error('Incompatible poolAddress for Meteora DBC: expected WSOL quote');
	return { poolAddress, virtualPool, poolConfig };
}


