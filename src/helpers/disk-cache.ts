import fs from 'fs';
import path from 'path';

const DEFAULT_TTL_MS = 5 * 60 * 1000;

function getTtlMs(override?: number): number {
  if (typeof override === 'number' && Number.isFinite(override) && override > 0) return override;
  const fromEnv = Number(process.env.PAIRS_CACHE_TTL_MS);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return DEFAULT_TTL_MS;
}

function getCacheDir(): string {
  return path.resolve(process.cwd(), '.cache');
}

export function makePairKey(a: string, b: string): string {
  const [x, y] = [a, b].sort();
  return `${x}-${y}`;
}

function getPairFilePath(namespace: string, pairKey: string): string {
  return path.resolve(getCacheDir(), `${namespace}_pair_${pairKey}.json`);
}

function getGlobalFilePath(namespace: string): string {
  return path.resolve(getCacheDir(), `${namespace}_global.json`);
}

export function readPair(namespace: string, pairKey: string): { address: string } | null {
  try {
    const file = getPairFilePath(namespace, pairKey);
    if (!fs.existsSync(file)) return null;
    const txt = fs.readFileSync(file, 'utf8');
    const json = JSON.parse(txt);
    if (json && typeof json.address === 'string' && json.address.length > 0) return { address: json.address };
  } catch (_e) {}
  return null;
}

export function writePair(namespace: string, pairKey: string, address: string): void {
  try {
    const file = getPairFilePath(namespace, pairKey);
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ address }));
  } catch (_e) {}
}

export function readGlobal(namespace: string, ttlMs?: number): any[] | null {
  try {
    const file = getGlobalFilePath(namespace);
    if (!fs.existsSync(file)) return null;
    const stat = fs.statSync(file);
    const now = Date.now();
    const ttl = getTtlMs(ttlMs);
    if (now - stat.mtimeMs > ttl) return null;
    const txt = fs.readFileSync(file, 'utf8');
    const json = JSON.parse(txt);
    if (Array.isArray(json)) return json;
  } catch (_e) {}
  return null;
}

export function writeGlobal(namespace: string, list: any[]): void {
  try {
    const file = getGlobalFilePath(namespace);
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(list));
  } catch (_e) {}
}


