import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely serialize objects containing BigInt values to JSON-compatible format
 * Converts all BigInt values to strings to prevent JSON serialization errors
 */
export function serializeBigInt<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return String(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item)) as T;
  }

  if (typeof obj === 'object') {
    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized as T;
  }

  return obj;
}

/**
 * Custom JSON stringifier that handles BigInt values
 * Use this instead of JSON.stringify when your object may contain BigInt
 */
export function stringifyWithBigInt(obj: unknown): string {
  return JSON.stringify(serializeBigInt(obj));
}
