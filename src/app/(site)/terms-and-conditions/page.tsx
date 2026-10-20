import { LegalPageView, legalMetadata } from "@/components/legal/LegalPageView";

export const generateMetadata = () => legalMetadata("terms");

export default function TermsPage() {
  return <LegalPageView slug="terms" />;
}
