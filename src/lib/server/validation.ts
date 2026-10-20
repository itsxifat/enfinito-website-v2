import "server-only";
import { z } from "zod";

/** Accepts "example.com" by assuming https://. Empty string stays empty. */
export function normalizeUrl(value: string): string {
  const v = value.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export const httpUrl = (message: string) => z.httpUrl(message).max(500, "That address is too long.");

export const optionalHttpUrl = (message: string) => z.union([z.literal(""), httpUrl(message)]);
