import { createHash } from "node:crypto";
import { nanoid } from "nanoid";

/**
 * Generate a unique ID using nanoid.
 * Default size is 21 characters.
 */
export function generateId(size?: number): string {
  return nanoid(size);
}

/**
 * Generate a deterministic ID based on a domain and seed string.
 * Uses SHA-1 hash and returns the first 12 characters.
 */
export function generateDeterministicId(domain: string, seed: string): string {
  return createHash("sha1").update(`${domain}:${seed}`).digest("hex").slice(0, 12);
}
