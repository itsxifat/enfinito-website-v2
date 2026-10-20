import { LegalPageView, legalMetadata } from "@/components/legal/LegalPageView";

export const generateMetadata = () => legalMetadata("delivery");

export default function DeliveryPolicyPage() {
  return <LegalPageView slug="delivery" />;
}
