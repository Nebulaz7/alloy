import { namehash as viemNamehash, keccak256, toHex } from "viem";

/**
 * Standard ENS namehash algorithm for .base.eth and subnames
 */
export function computeNamehash(name: string): `0x${string}` {
  if (!name || name.trim() === "") {
    return "0x0000000000000000000000000000000000000000000000000000000000000000";
  }
  const cleanName = name.trim().toLowerCase();
  return viemNamehash(cleanName);
}

/**
 * Ensures a name ends with .base.eth
 */
export function formatBasename(name: string): string {
  const clean = name.trim().toLowerCase();
  if (clean.endsWith(".base.eth")) return clean;
  return `${clean}.base.eth`;
}

/**
 * Strips .base.eth suffix for display
 */
export function stripBasename(name: string): string {
  const clean = name.trim().toLowerCase();
  if (clean.endsWith(".base.eth")) {
    return clean.replace(/\.base\.eth$/, "");
  }
  return clean;
}
