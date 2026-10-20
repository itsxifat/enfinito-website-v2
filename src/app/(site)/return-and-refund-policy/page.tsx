import { LegalPageView, legalMetadata } from "@/components/legal/LegalPageView";

export const generateMetadata = () => legalMetadata("refunds");

export default function RefundPolicyPage() {
  return <LegalPageView slug="refunds" />;
}
