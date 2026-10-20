import type { AdminMessage } from "@/lib/server/data/messages";
import { Badge } from "./ui/Layout";

const LABELS = {
  sent: { tone: "green", label: "Sent" },
  failed: { tone: "red", label: "Failed" },
  skipped: { tone: "neutral", label: "Not sent" },
  pending: { tone: "amber", label: "Sending" },
} as const;

/** Status of the confirmation email sent to the person who wrote in. */
export function DeliveryBadge({ status }: { status: AdminMessage["confirmation"]["status"] }) {
  const { tone, label } = LABELS[status];
  return <Badge tone={tone}>{label}</Badge>;
}
