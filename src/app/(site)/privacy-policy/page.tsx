import { LegalPageView, legalMetadata } from "@/components/legal/LegalPageView";

export const generateMetadata = () => legalMetadata("privacy");

export default function PrivacyPolicyPage() {
  return <LegalPageView slug="privacy" />;
}
