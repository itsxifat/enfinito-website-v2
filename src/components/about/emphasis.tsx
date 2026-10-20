import type { ReactNode } from "react";

/** Text with *asterisk-wrapped* words as <em>, which the caller styles.
 *  Stray asterisks are left as they are. */
export function withEmphasis(text: string): ReactNode[] {
  // Splitting on a capturing group puts the marked words at odd indices.
  return text
    .split(/(\*[^*\n]+\*)/)
    .map((part, i) => (i % 2 === 1 ? <em key={i}>{part.slice(1, -1)}</em> : part));
}

/** The same text without the markers, for metadata. */
export const plainText = (text: string) => text.replace(/\*([^*\n]+)\*/g, "$1");
