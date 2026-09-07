import { Point } from "@noble/secp256k1";
import { keccak256, hexToBytes, bytesToHex, slice, getAddress } from "viem";

export const SECP256K1_N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;

export interface StealthAddressResult {
  stealthAddress: `0x${string}`;
  ephemeralPubKey: `0x${string}`;
  viewTag: number;
  sharedSecret: `0x${string}`;
}

export interface StealthKeyPair {
  spendingPrivateKey: `0x${string}`;
  spendingPublicKey: `0x${string}`;
  viewingPrivateKey: `0x${string}`;
  viewingPublicKey: `0x${string}`;
  stealthMetaAddress: string;
}

/**
 * Normalizes hex string removing 0x prefix if present
 */
function cleanHex(hex: string): string {
  return hex.startsWith("0x") ? hex.slice(2) : hex;
}

/**
 * Derives EVM checksum address from an uncompressed or compressed secp256k1 public key point
 */
export function pointToAddress(point: Point): `0x${string}` {
  // Uncompressed public key is 65 bytes starting with 0x04
  const uncompressed = point.toBytes(false);
  // Hash the 64 coordinate bytes (excluding 0x04 prefix)
  const coords = uncompressed.slice(1);
  const hash = keccak256(coords);
  // EVM address is the last 20 bytes
  const addressBytes = slice(hash, 12);
  return getAddress(addressBytes);
}

/**
 * Parses a 66-byte ERC-5564 stealth meta-address:
 * Format: st:eth:0x<33-byte spendingPubKey><33-byte viewingPubKey>
 */
export function parseStealthMetaAddress(metaAddress: string): {
  spendingPubKey: `0x${string}`;
  viewingPubKey: `0x${string}`;
} {
  let hex = metaAddress.trim();
  if (hex.startsWith("st:eth:")) {
    hex = hex.replace("st:eth:", "");
  }
  hex = cleanHex(hex);

  if (hex.length !== 132) {
    throw new Error(
      `Invalid stealth meta-address length: expected 132 hex chars (66 bytes), got ${hex.length}`
    );
  }

  const spendingPubKey = `0x${hex.slice(0, 66)}` as `0x${string}`;
  const viewingPubKey = `0x${hex.slice(66, 132)}` as `0x${string}`;

  return { spendingPubKey, viewingPubKey };
}

/**
 * Generates an ERC-5564 Scheme 1 stealth address from recipient's meta-address
 */
export function generateStealthAddress(
  spendingPubKeyHex: string,
  viewingPubKeyHex: string
): StealthAddressResult {
  const K_spend = Point.fromHex(cleanHex(spendingPubKeyHex));
  const K_view = Point.fromHex(cleanHex(viewingPubKeyHex));

  // 1. Generate random ephemeral private key r in [1, n-1]
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  let r = BigInt(bytesToHex(randomBytes)) % SECP256K1_N;
  if (r === 0n) r = 1n;

  // 2. Ephemeral public key R = r * G (33 bytes compressed)
  const R_point = Point.BASE.multiply(r);
  const R_hex = `0x${R_point.toHex(true)}` as `0x${string}`;

  // 3. Shared secret S = r * K_view (33 bytes compressed)
  const S_point = K_view.multiply(r);
  const S_hex = `0x${S_point.toHex(true)}` as `0x${string}`;

  // 4. Scalar hash h = keccak256(S) mod n
  const h_hash = keccak256(S_hex);
  const h_scalar = BigInt(h_hash) % SECP256K1_N;

  // 5. 1-Byte View Tag v = h[0]
  const viewTag = hexToBytes(h_hash)[0];

  // 6. Stealth point P = K_spend + (h * G)
  const h_G = Point.BASE.multiply(h_scalar);
  const P_point = K_spend.add(h_G);

  // 7. Stealth address = address(P)
  const stealthAddress = pointToAddress(P_point);

  return {
    stealthAddress,
    ephemeralPubKey: R_hex,
    viewTag,
    sharedSecret: S_hex,
  };
}

/**
 * Checks if an announcement onchain belongs to the recipient's viewing key (O(1) filter)
 */
export function checkAnnouncement(
  ephemeralPubKeyHex: string,
  viewingPrivKeyHex: string,
  viewTag: number,
  spendingPubKeyHex: string,
  expectedStealthAddress: string
): boolean {
  try {
    const R_point = Point.fromHex(cleanHex(ephemeralPubKeyHex));
    const k_view = BigInt(`0x${cleanHex(viewingPrivKeyHex)}`) % SECP256K1_N;

    // S = k_view * R
    const S_point = R_point.multiply(k_view);
    const S_hex = `0x${S_point.toHex(true)}` as `0x${string}`;
    const h_hash = keccak256(S_hex);

    // Fast 1-byte view tag comparison (99.6% rejected in O(1))
    const derivedViewTag = hexToBytes(h_hash)[0];
    if (derivedViewTag !== viewTag) {
      return false;
    }

    // Derive stealth address to confirm match
    const h_scalar = BigInt(h_hash) % SECP256K1_N;
    const K_spend = Point.fromHex(cleanHex(spendingPubKeyHex));
    const h_G = Point.BASE.multiply(h_scalar);
    const P_point = K_spend.add(h_G);
    const derivedAddress = pointToAddress(P_point);

    return derivedAddress.toLowerCase() === expectedStealthAddress.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Computes the one-time private key k_stealth = (k_spend + h) mod n
 * Used to sign EIP-2612 permits for gasless sweeping via AlloyStealthRelayer
 */
export function computeStealthPrivateKey(
  spendingPrivKeyHex: string,
  viewingPrivKeyHex: string,
  ephemeralPubKeyHex: string
): `0x${string}` {
  const k_spend = BigInt(`0x${cleanHex(spendingPrivKeyHex)}`) % SECP256K1_N;
  const k_view = BigInt(`0x${cleanHex(viewingPrivKeyHex)}`) % SECP256K1_N;
  const R_point = Point.fromHex(cleanHex(ephemeralPubKeyHex));

  // S = k_view * R
  const S_point = R_point.multiply(k_view);
  const S_hex = `0x${S_point.toHex(true)}` as `0x${string}`;
  const h_hash = keccak256(S_hex);
  const h_scalar = BigInt(h_hash) % SECP256K1_N;

  // k_stealth = (k_spend + h) mod n
  const k_stealth = (k_spend + h_scalar) % SECP256K1_N;
  const hexKey = k_stealth.toString(16).padStart(64, "0");
  return `0x${hexKey}` as `0x${string}`;
}

/**
 * Generates a full fresh ERC-5564 stealth key pair and meta-address
 */
export function generateStealthKeyPair(): StealthKeyPair {
  const spendBytes = crypto.getRandomValues(new Uint8Array(32));
  const viewBytes = crypto.getRandomValues(new Uint8Array(32));

  let spendPriv = BigInt(bytesToHex(spendBytes)) % SECP256K1_N;
  if (spendPriv === 0n) spendPriv = 1n;
  let viewPriv = BigInt(bytesToHex(viewBytes)) % SECP256K1_N;
  if (viewPriv === 0n) viewPriv = 1n;

  const spendPoint = Point.BASE.multiply(spendPriv);
  const viewPoint = Point.BASE.multiply(viewPriv);

  const spendingPrivateKey = `0x${spendPriv.toString(16).padStart(64, "0")}` as `0x${string}`;
  const viewingPrivateKey = `0x${viewPriv.toString(16).padStart(64, "0")}` as `0x${string}`;
  const spendingPublicKey = `0x${spendPoint.toHex(true)}` as `0x${string}`;
  const viewingPublicKey = `0x${viewPoint.toHex(true)}` as `0x${string}`;

  const stealthMetaAddress = `st:eth:0x${cleanHex(spendingPublicKey)}${cleanHex(viewingPublicKey)}`;

  return {
    spendingPrivateKey,
    spendingPublicKey,
    viewingPrivateKey,
    viewingPublicKey,
    stealthMetaAddress,
  };
}
