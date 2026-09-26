import { randomInt } from "node:crypto";

/** Unambiguous characters only (no 0/O, 1/I/L) so refs are easy to read out over the phone. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export type RefKind = "hotel" | "table" | "event";
const PREFIX: Record<RefKind, string> = { hotel: "H", table: "T", event: "E" };

export function generateRef(kind: RefKind, length = 6): string {
  let body = "";
  for (let i = 0; i < length; i++) body += ALPHABET[randomInt(ALPHABET.length)];
  return `${PREFIX[kind]}-${body}`;
}

export const REF_PATTERN = /^[HTE]-[2-9A-HJKMNP-Z]{6}$/;

export function refKind(ref: string): RefKind | null {
  if (!REF_PATTERN.test(ref)) return null;
  return ({ H: "hotel", T: "table", E: "event" } as const)[ref[0] as "H" | "T" | "E"];
}
