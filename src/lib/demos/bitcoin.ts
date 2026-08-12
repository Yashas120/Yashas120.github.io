// Bitcoin-from-scratch demo primitives — a faithful, zero-dependency TypeScript
// re-implementation of the core crypto in
// https://github.com/Yashas120/Bitcoin-Transactions-in-java
//
// Everything here runs 100% in the browser: SHA-256, RIPEMD-160, secp256k1
// elliptic-curve math, ECDSA sign/verify, Base58Check, WIF, and P2PKH address
// derivation. No libraries, no network, no server.

// ------------------------------- byte utils -------------------------------

export function bytesToHex(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s;
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, "");
  if (clean.length % 2 !== 0) throw new Error("odd-length hex");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}

export function utf8ToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) {
    out.set(a, off);
    off += a.length;
  }
  return out;
}

export function randomBytes(len: number): Uint8Array {
  const out = new Uint8Array(len);
  crypto.getRandomValues(out);
  return out;
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let x = 0n;
  for (let i = 0; i < bytes.length; i++) x = (x << 8n) | BigInt(bytes[i]);
  return x;
}

function bigIntToBytes(x: bigint, len: number): Uint8Array {
  const out = new Uint8Array(len);
  for (let i = len - 1; i >= 0; i--) {
    out[i] = Number(x & 0xffn);
    x >>= 8n;
  }
  return out;
}

// ------------------------------- SHA-256 -------------------------------

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(n: number, x: number): number {
  return (x >>> n) | (x << (32 - n));
}

export function sha256(msg: Uint8Array): Uint8Array {
  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const ml = msg.length;
  const withOne = ml + 1;
  const padZeros = (56 - (withOne % 64) + 64) % 64;
  const total = withOne + padZeros + 8;
  const buf = new Uint8Array(total);
  buf.set(msg);
  buf[ml] = 0x80;
  const view = new DataView(buf.buffer);
  const bitLen = BigInt(ml) * 8n;
  view.setUint32(total - 8, Number((bitLen >> 32n) & 0xffffffffn));
  view.setUint32(total - 4, Number(bitLen & 0xffffffffn));

  const w = new Uint32Array(64);
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA256_K[i] + w[i]) | 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  const out = new Uint8Array(32);
  const ov = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) ov.setUint32(i * 4, H[i] >>> 0);
  return out;
}

export function doubleSha256(msg: Uint8Array): Uint8Array {
  return sha256(sha256(msg));
}

// ------------------------------- RIPEMD-160 -------------------------------

// prettier-ignore
const RL = [
  0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
  7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,
  3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,
  1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,
  4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13,
];
// prettier-ignore
const RR = [
  5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,
  6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,
  15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,
  8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,
  12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11,
];
// prettier-ignore
const SL = [
  11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,
  7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,
  11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,
  11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,
  9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6,
];
// prettier-ignore
const SR = [
  8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,
  9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,
  9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,
  15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,
  8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11,
];

function rol(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

function ripemdF(j: number, x: number, y: number, z: number): number {
  if (j < 16) return (x ^ y ^ z) >>> 0;
  if (j < 32) return ((x & y) | (~x & z)) >>> 0;
  if (j < 48) return ((x | ~y) ^ z) >>> 0;
  if (j < 64) return ((x & z) | (y & ~z)) >>> 0;
  return (x ^ (y | ~z)) >>> 0;
}

function ripemdKL(j: number): number {
  if (j < 16) return 0x00000000;
  if (j < 32) return 0x5a827999;
  if (j < 48) return 0x6ed9eba1;
  if (j < 64) return 0x8f1bbcdc;
  return 0xa953fd4e;
}

function ripemdKR(j: number): number {
  if (j < 16) return 0x50a28be6;
  if (j < 32) return 0x5c4dd124;
  if (j < 48) return 0x6d703ef3;
  if (j < 64) return 0x7a6d76e9;
  return 0x00000000;
}

export function ripemd160(msg: Uint8Array): Uint8Array {
  const ml = msg.length;
  const withOne = ml + 1;
  const padZeros = (56 - (withOne % 64) + 64) % 64;
  const total = withOne + padZeros + 8;
  const buf = new Uint8Array(total);
  buf.set(msg);
  buf[ml] = 0x80;
  const view = new DataView(buf.buffer);
  const bitLen = BigInt(ml) * 8n;
  // 64-bit little-endian length
  view.setUint32(total - 8, Number(bitLen & 0xffffffffn), true);
  view.setUint32(total - 4, Number((bitLen >> 32n) & 0xffffffffn), true);

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  const X = new Uint32Array(16);

  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) X[i] = view.getUint32(off + i * 4, true);
    let al = h0, bl = h1, cl = h2, dl = h3, el = h4;
    let ar = h0, br = h1, cr = h2, dr = h3, er = h4;
    for (let j = 0; j < 80; j++) {
      let t = (((al + ripemdF(j, bl, cl, dl)) >>> 0) + X[RL[j]]) >>> 0;
      t = (t + ripemdKL(j)) >>> 0;
      t = (rol(t, SL[j]) + el) >>> 0;
      al = el; el = dl; dl = rol(cl, 10); cl = bl; bl = t;

      let u = (((ar + ripemdF(79 - j, br, cr, dr)) >>> 0) + X[RR[j]]) >>> 0;
      u = (u + ripemdKR(j)) >>> 0;
      u = (rol(u, SR[j]) + er) >>> 0;
      ar = er; er = dr; dr = rol(cr, 10); cr = br; br = u;
    }
    const t = (h1 + cl + dr) >>> 0;
    h1 = (h2 + dl + er) >>> 0;
    h2 = (h3 + el + ar) >>> 0;
    h3 = (h4 + al + br) >>> 0;
    h4 = (h0 + bl + cr) >>> 0;
    h0 = t;
  }

  const out = new Uint8Array(20);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, h0, true);
  ov.setUint32(4, h1, true);
  ov.setUint32(8, h2, true);
  ov.setUint32(12, h3, true);
  ov.setUint32(16, h4, true);
  return out;
}

export function hash160(msg: Uint8Array): Uint8Array {
  return ripemd160(sha256(msg));
}

// ------------------------------- secp256k1 -------------------------------

const P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
export const N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
const Gx = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n;
const Gy = 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n;

type Point = { x: bigint; y: bigint } | null; // null = point at infinity
const G: Point = { x: Gx, y: Gy };

function mod(a: bigint, m: bigint): bigint {
  return ((a % m) + m) % m;
}

function modInv(a: bigint, m: bigint): bigint {
  let [old_r, r] = [mod(a, m), m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_r !== 1n) throw new Error("not invertible");
  return mod(old_s, m);
}

function pointAdd(p1: Point, p2: Point): Point {
  if (p1 === null) return p2;
  if (p2 === null) return p1;
  if (p1.x === p2.x && mod(p1.y + p2.y, P) === 0n) return null;
  let lam: bigint;
  if (p1.x === p2.x && p1.y === p2.y) {
    lam = mod(3n * p1.x * p1.x * modInv(2n * p1.y, P), P);
  } else {
    lam = mod((p2.y - p1.y) * modInv(mod(p2.x - p1.x, P), P), P);
  }
  const x3 = mod(lam * lam - p1.x - p2.x, P);
  const y3 = mod(lam * (p1.x - x3) - p1.y, P);
  return { x: x3, y: y3 };
}

function pointMul(k: bigint, p: Point): Point {
  let result: Point = null;
  let addend = p;
  let n = mod(k, N);
  while (n > 0n) {
    if (n & 1n) result = pointAdd(result, addend);
    addend = pointAdd(addend, addend);
    n >>= 1n;
  }
  return result;
}

export function getPublicKey(privKey: Uint8Array, compressed = true): Uint8Array {
  const d = bytesToBigInt(privKey);
  if (d <= 0n || d >= N) throw new Error("private key out of range");
  const pub = pointMul(d, G);
  if (pub === null) throw new Error("invalid public key");
  const xBytes = bigIntToBytes(pub.x, 32);
  if (!compressed) {
    return concatBytes(new Uint8Array([0x04]), xBytes, bigIntToBytes(pub.y, 32));
  }
  const prefix = pub.y % 2n === 0n ? 0x02 : 0x03;
  return concatBytes(new Uint8Array([prefix]), xBytes);
}

export interface Signature {
  r: bigint;
  s: bigint;
}

export function sign(msgHash: Uint8Array, privKey: Uint8Array): Signature {
  const d = bytesToBigInt(privKey);
  const z = bytesToBigInt(msgHash);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const k = mod(bytesToBigInt(randomBytes(32)), N);
    if (k <= 0n) continue;
    const R = pointMul(k, G);
    if (R === null) continue;
    const r = mod(R.x, N);
    if (r === 0n) continue;
    let s = mod(modInv(k, N) * (z + r * d), N);
    if (s === 0n) continue;
    if (s > N / 2n) s = N - s; // low-s (BIP-62)
    return { r, s };
  }
}

export function verify(msgHash: Uint8Array, sig: Signature, pubKey: Uint8Array): boolean {
  const { r, s } = sig;
  if (r <= 0n || r >= N || s <= 0n || s >= N) return false;
  const Q = decodePublicKey(pubKey);
  if (Q === null) return false;
  const z = bytesToBigInt(msgHash);
  const w = modInv(s, N);
  const u1 = mod(z * w, N);
  const u2 = mod(r * w, N);
  const R = pointAdd(pointMul(u1, G), pointMul(u2, Q));
  if (R === null) return false;
  return mod(R.x, N) === r;
}

function decodePublicKey(pub: Uint8Array): Point {
  if (pub.length === 65 && pub[0] === 0x04) {
    return { x: bytesToBigInt(pub.slice(1, 33)), y: bytesToBigInt(pub.slice(33, 65)) };
  }
  if (pub.length === 33 && (pub[0] === 0x02 || pub[0] === 0x03)) {
    const x = bytesToBigInt(pub.slice(1, 33));
    // y^2 = x^3 + 7 mod P ; y = (x^3 + 7)^((P+1)/4) mod P
    const y2 = mod(x * x * x + 7n, P);
    let y = modPow(y2, (P + 1n) / 4n, P);
    const wantEven = pub[0] === 0x02;
    if ((y % 2n === 0n) !== wantEven) y = P - y;
    return { x, y };
  }
  return null;
}

function modPow(base: bigint, exp: bigint, m: bigint): bigint {
  let result = 1n;
  base = mod(base, m);
  while (exp > 0n) {
    if (exp & 1n) result = mod(result * base, m);
    base = mod(base * base, m);
    exp >>= 1n;
  }
  return result;
}

export function serializeSignature(sig: Signature): string {
  return bytesToHex(bigIntToBytes(sig.r, 32)) + bytesToHex(bigIntToBytes(sig.s, 32));
}

// ------------------------------- Base58Check -------------------------------

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58encode(bytes: Uint8Array): string {
  let x = bytesToBigInt(bytes);
  let out = "";
  while (x > 0n) {
    const rem = Number(x % 58n);
    x = x / 58n;
    out = B58[rem] + out;
  }
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) out = "1" + out;
  return out;
}

export function base58check(payload: Uint8Array): string {
  const checksum = doubleSha256(payload).slice(0, 4);
  return base58encode(concatBytes(payload, checksum));
}

export function pubKeyToAddress(pubKey: Uint8Array): string {
  const payload = concatBytes(new Uint8Array([0x00]), hash160(pubKey)); // 0x00 = mainnet P2PKH
  return base58check(payload);
}

export function privKeyToWIF(privKey: Uint8Array, compressed = true): string {
  const parts = [new Uint8Array([0x80]), privKey];
  if (compressed) parts.push(new Uint8Array([0x01]));
  return base58check(concatBytes(...parts));
}

// ------------------------------- high-level demo API -------------------------------

export interface WalletResult {
  privKeyHex: string;
  wif: string;
  pubKeyHex: string;
  sha256Hex: string;
  hash160Hex: string;
  address: string;
}

export function deriveWallet(privKey: Uint8Array): WalletResult {
  const pub = getPublicKey(privKey, true);
  const sha = sha256(pub);
  const h160 = ripemd160(sha);
  return {
    privKeyHex: bytesToHex(privKey),
    wif: privKeyToWIF(privKey, true),
    pubKeyHex: bytesToHex(pub),
    sha256Hex: bytesToHex(sha),
    hash160Hex: bytesToHex(h160),
    address: pubKeyToAddress(pub),
  };
}

export function randomPrivKey(): Uint8Array {
  // ensure 1 <= d < N
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const b = randomBytes(32);
    const d = bytesToBigInt(b);
    if (d > 0n && d < N) return b;
  }
}

// ============================================================================
// INSTRUMENTED PRIMITIVES — for the step-by-step explainer UI
// ============================================================================

// ------------------------------- SHA-256 trace -------------------------------

export interface Sha256Round {
  i: number;
  a: string; b: string; c: string; d: string;
  e: string; f: string; g: string; h: string;
}

export interface Sha256Trace {
  input: string; // hex of raw message
  inputBits: number;
  paddedHex: string;
  blocks: number;
  schedule: string[]; // W[0..63] of the first block, hex
  rounds: Sha256Round[]; // 65 entries (initial + 64 rounds) for the first block
  digest: string;
}

const hx = (n: number) => (n >>> 0).toString(16).padStart(8, "0");

export function sha256Trace(msg: Uint8Array): Sha256Trace {
  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const ml = msg.length;
  const withOne = ml + 1;
  const padZeros = (56 - (withOne % 64) + 64) % 64;
  const total = withOne + padZeros + 8;
  const buf = new Uint8Array(total);
  buf.set(msg);
  buf[ml] = 0x80;
  const view = new DataView(buf.buffer);
  const bitLen = BigInt(ml) * 8n;
  view.setUint32(total - 8, Number((bitLen >> 32n) & 0xffffffffn));
  view.setUint32(total - 4, Number(bitLen & 0xffffffffn));

  const schedule: string[] = [];
  const rounds: Sha256Round[] = [];
  const w = new Uint32Array(64);

  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    const firstBlock = off === 0;
    if (firstBlock) {
      for (let i = 0; i < 64; i++) schedule.push(hx(w[i]));
      rounds.push({ i: -1, a: hx(a), b: hx(b), c: hx(c), d: hx(d), e: hx(e), f: hx(f), g: hx(g), h: hx(h) });
    }
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA256_K[i] + w[i]) | 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      if (firstBlock) {
        rounds.push({ i, a: hx(a), b: hx(b), c: hx(c), d: hx(d), e: hx(e), f: hx(f), g: hx(g), h: hx(h) });
      }
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }

  return {
    input: bytesToHex(msg),
    inputBits: ml * 8,
    paddedHex: bytesToHex(buf),
    blocks: total / 64,
    schedule,
    rounds,
    digest: bytesToHex(sha256(msg)),
  };
}

// ------------------------------- ECDSA trace -------------------------------

export interface EcdsaTrace {
  z: string; // message hash (hex)
  k: string; // nonce
  Rx: string;
  r: string;
  s: string;
  // verification
  w: string;
  u1: string;
  u2: string;
  recoveredRx: string;
  valid: boolean;
}

export function signTrace(msgHash: Uint8Array, privKey: Uint8Array, pubKey: Uint8Array): EcdsaTrace {
  const d = bytesToBigInt(privKey);
  const z = bytesToBigInt(msgHash);
  let k = 0n, r = 0n, s = 0n, Rx = 0n;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    k = mod(bytesToBigInt(randomBytes(32)), N);
    if (k <= 0n) continue;
    const R = pointMul(k, G);
    if (R === null) continue;
    Rx = R.x;
    r = mod(R.x, N);
    if (r === 0n) continue;
    s = mod(modInv(k, N) * (z + r * d), N);
    if (s === 0n) continue;
    if (s > N / 2n) s = N - s;
    break;
  }
  // verification path
  const w = modInv(s, N);
  const u1 = mod(z * w, N);
  const u2 = mod(r * w, N);
  const Rv = pointAdd(pointMul(u1, G), pointMul(u2, decodePublicKey(pubKey)));
  const recoveredRx = Rv ? mod(Rv.x, N) : 0n;
  return {
    z: z.toString(16).padStart(64, "0"),
    k: k.toString(16).padStart(64, "0"),
    Rx: Rx.toString(16).padStart(64, "0"),
    r: r.toString(16).padStart(64, "0"),
    s: s.toString(16).padStart(64, "0"),
    w: w.toString(16).padStart(64, "0"),
    u1: u1.toString(16).padStart(64, "0"),
    u2: u2.toString(16).padStart(64, "0"),
    recoveredRx: recoveredRx.toString(16).padStart(64, "0"),
    valid: recoveredRx === r,
  };
}

// small-field elliptic curve points for an intuition plot (y^2 = x^3 + 7 mod p)
export function toyCurvePoints(p: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let x = 0; x < p; x++) {
    const rhs = (((x * x * x) % p) + 7) % p;
    for (let y = 0; y < p; y++) {
      if ((y * y) % p === rhs) pts.push({ x, y });
    }
  }
  return pts;
}

// ------------------------------- Base58 decode + address -------------------------------

export function base58decode(str: string): Uint8Array {
  let x = 0n;
  for (const ch of str) {
    const idx = B58.indexOf(ch);
    if (idx < 0) throw new Error("invalid base58 char");
    x = x * 58n + BigInt(idx);
  }
  // convert bigint to bytes
  const bytes: number[] = [];
  while (x > 0n) {
    bytes.unshift(Number(x & 0xffn));
    x >>= 8n;
  }
  // leading '1's -> leading zero bytes
  for (let i = 0; i < str.length && str[i] === "1"; i++) bytes.unshift(0);
  return new Uint8Array(bytes);
}

// address (P2PKH) -> 20-byte hash160
export function addressToHash160(address: string): Uint8Array {
  const decoded = base58decode(address);
  const payload = decoded.slice(0, decoded.length - 4);
  const checksum = decoded.slice(decoded.length - 4);
  const expected = doubleSha256(payload).slice(0, 4);
  if (bytesToHex(checksum) !== bytesToHex(expected)) throw new Error("bad checksum");
  return payload.slice(1); // drop version byte
}

// P2PKH scriptPubKey: OP_DUP OP_HASH160 <20> <hash160> OP_EQUALVERIFY OP_CHECKSIG
export function p2pkhScript(hash160Bytes: Uint8Array): Uint8Array {
  return concatBytes(
    new Uint8Array([0x76, 0xa9, 0x14]),
    hash160Bytes,
    new Uint8Array([0x88, 0xac])
  );
}

// ------------------------------- Little-endian serialization helpers -------------------------------

function leBytes(value: bigint, len: number): Uint8Array {
  const out = new Uint8Array(len);
  let v = value;
  for (let i = 0; i < len; i++) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
}

function varInt(n: number): Uint8Array {
  if (n < 0xfd) return new Uint8Array([n]);
  if (n <= 0xffff) return concatBytes(new Uint8Array([0xfd]), leBytes(BigInt(n), 2));
  if (n <= 0xffffffff) return concatBytes(new Uint8Array([0xfe]), leBytes(BigInt(n), 4));
  return concatBytes(new Uint8Array([0xff]), leBytes(BigInt(n), 8));
}

function reverse(bytes: Uint8Array): Uint8Array {
  return new Uint8Array([...bytes].reverse());
}

// ------------------------------- Transactions -------------------------------

export interface TxInput {
  prevTxid: string; // hex, big-endian display order
  vout: number;
  ownerHash160: string; // hash160 of the prev output's owner (for the prev scriptPubKey)
  pubKeyHex?: string; // filled after signing
  sigHex?: string; // filled after signing (r‖s)
  sequence: number;
}

export interface TxOutput {
  address: string; // P2PKH address
  value: number; // satoshis
}

export interface Tx {
  version: number;
  inputs: TxInput[];
  outputs: TxOutput[];
  locktime: number;
}

const SIGHASH_ALL = 0x01;

function serializeOutputs(outputs: TxOutput[]): Uint8Array {
  const parts: Uint8Array[] = [varInt(outputs.length)];
  for (const o of outputs) {
    const script = p2pkhScript(addressToHash160(o.address));
    parts.push(leBytes(BigInt(o.value), 8), varInt(script.length), script);
  }
  return concatBytes(...parts);
}

// full serialized tx (with scriptSigs) used to compute the txid
export function serializeTx(tx: Tx): Uint8Array {
  const parts: Uint8Array[] = [leBytes(BigInt(tx.version), 4), varInt(tx.inputs.length)];
  for (const inp of tx.inputs) {
    let scriptSig: Uint8Array = new Uint8Array(0);
    if (inp.sigHex && inp.pubKeyHex) {
      // scriptSig = <sig ‖ SIGHASH_ALL> <pubkey>
      const sig = concatBytes(hexToBytes(inp.sigHex), new Uint8Array([SIGHASH_ALL]));
      const pub = hexToBytes(inp.pubKeyHex);
      scriptSig = concatBytes(varInt(sig.length), sig, varInt(pub.length), pub);
    }
    parts.push(
      reverse(hexToBytes(inp.prevTxid)),
      leBytes(BigInt(inp.vout), 4),
      varInt(scriptSig.length),
      scriptSig,
      leBytes(BigInt(inp.sequence >>> 0), 4)
    );
  }
  parts.push(serializeOutputs(tx.outputs), leBytes(BigInt(tx.locktime), 4));
  return concatBytes(...parts);
}

// legacy sighash for input `index` (P2PKH): put the prev scriptPubKey in that
// input's slot, empty everywhere else, append SIGHASH_ALL, then double-SHA256.
export function sighashLegacy(tx: Tx, index: number): Uint8Array {
  const parts: Uint8Array[] = [leBytes(BigInt(tx.version), 4), varInt(tx.inputs.length)];
  tx.inputs.forEach((inp, i) => {
    const script = i === index ? p2pkhScript(hexToBytes(inp.ownerHash160)) : new Uint8Array([]);
    parts.push(
      reverse(hexToBytes(inp.prevTxid)),
      leBytes(BigInt(inp.vout), 4),
      varInt(script.length),
      script,
      leBytes(BigInt(inp.sequence >>> 0), 4)
    );
  });
  parts.push(serializeOutputs(tx.outputs), leBytes(BigInt(tx.locktime), 4));
  const preimage = concatBytes(...parts, leBytes(BigInt(SIGHASH_ALL), 4));
  return doubleSha256(preimage);
}

export interface SignedInput {
  index: number;
  sighashHex: string;
  sigHex: string;
  pubKeyHex: string;
  verified: boolean;
}

// sign every input with the given key (single-owner demo) and return per-input detail
export function signTransaction(tx: Tx, privKey: Uint8Array): SignedInput[] {
  const pub = getPublicKey(privKey, true);
  const details: SignedInput[] = [];
  tx.inputs.forEach((inp, i) => {
    const sighash = sighashLegacy(tx, i);
    const sig = sign(sighash, privKey);
    const sigHex = serializeSignature(sig);
    inp.sigHex = sigHex;
    inp.pubKeyHex = bytesToHex(pub);
    const verified = verify(sighash, sig, pub);
    details.push({ index: i, sighashHex: bytesToHex(sighash), sigHex, pubKeyHex: bytesToHex(pub), verified });
  });
  return details;
}

// txid = reverse(double-SHA256(serialized tx)), shown big-endian like explorers
export function txid(tx: Tx): string {
  return bytesToHex(reverse(doubleSha256(serializeTx(tx))));
}

// ------------------------------- Merkle tree -------------------------------

export interface MerkleResult {
  levels: string[][]; // each level's node hashes (big-endian display hex)
  root: string;
}

export function merkleRoot(txids: string[]): MerkleResult {
  if (txids.length === 0) return { levels: [], root: "" };
  // work in internal (little-endian) byte order, display reversed
  let level = txids.map((t) => reverse(hexToBytes(t)));
  const levels: string[][] = [level.map((b) => bytesToHex(reverse(b)))];
  while (level.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : level[i]; // duplicate last if odd
      next.push(doubleSha256(concatBytes(left, right)));
    }
    level = next;
    levels.push(level.map((b) => bytesToHex(reverse(b))));
  }
  return { levels, root: bytesToHex(reverse(level[0])) };
}

// ------------------------------- Block header + Proof-of-Work -------------------------------

export interface BlockHeader {
  version: number;
  prevHash: string; // big-endian display hex
  merkleRoot: string; // big-endian display hex
  time: number;
  bits: number;
  nonce: number;
}

export function serializeHeader(h: BlockHeader): Uint8Array {
  return concatBytes(
    leBytes(BigInt(h.version), 4),
    reverse(hexToBytes(h.prevHash)),
    reverse(hexToBytes(h.merkleRoot)),
    leBytes(BigInt(h.time), 4),
    leBytes(BigInt(h.bits >>> 0), 4),
    leBytes(BigInt(h.nonce >>> 0), 4)
  );
}

// block hash, big-endian display hex (double-SHA256 of the 80-byte header)
export function hashHeader(h: BlockHeader): string {
  return bytesToHex(reverse(doubleSha256(serializeHeader(h))));
}

// count leading zero bits of a big-endian display hash hex
export function leadingZeroBits(hashHex: string): number {
  let bits = 0;
  for (const ch of hashHex) {
    const nibble = parseInt(ch, 16);
    if (nibble === 0) {
      bits += 4;
    } else {
      bits += Math.clz32(nibble) - 28; // leading zeros within the nibble
      break;
    }
  }
  return bits;
}

// meets difficulty if the block hash has >= `difficulty` leading zero bits
export function meetsDifficulty(hashHex: string, difficulty: number): boolean {
  return leadingZeroBits(hashHex) >= difficulty;
}
