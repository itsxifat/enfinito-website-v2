const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const formatDateTime = (date: Date) => dateTime.format(date);

/** For calendar dates stored as UTC midnight (e.g. news publish dates). */
export const formatDate = (date: Date) => dateOnly.format(date);

export function timeAgo(date: Date, now = Date.now()): string {
  const seconds = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "just now";
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), "hour");
  if (abs < 86400 * 7) return relative.format(Math.round(seconds / 86400), "day");
  return formatDateTime(date);
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "?";

/** An address's lines, with its postal code on a final line. */
export function addressText(address: { lines: string; postalCode?: string }): string {
  return address.postalCode ? `${address.lines}\nPostal code: ${address.postalCode}` : address.lines;
}

/** "https://www.studio.example.com/path" → "studio.example.com". */
export function hostname(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
