// Static site copy. Brands, services, products, news and contact details are
// managed in the admin panel (see src/lib/server/data).
import type { CareersContent, HeroContent, LegalSlug, NavItem, OfferingKind, OfferingsCopy } from "./types";

const CAREERS_URL = "https://career.enfinito.com";

export const navigation: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services", menu: "service" },
  { label: "Products", href: "/products", menu: "product" },
  { label: "Career", href: CAREERS_URL, external: true },
  { label: "News", href: "/news" },
];

export const contactLink: NavItem = { label: "Contact us", href: "/contact" };

export const hero: HeroContent = {
  titleLines: ["Everything Your", "Business Needs"],
  lead: "Enfinito supports businesses with",
  rotatingWords: ["marketing", "content production", "technology"],
  rotateIntervalMs: 2800,
  cta: contactLink,
};

export const trustedBrandsTitle = "Brands that trusted us";

export const offeringsCopy: Record<OfferingKind, OfferingsCopy> = {
  service: {
    href: "/services",
    section: {
      title: "Services we provide",
      intro: "Specialist teams under one name. Each service has its own home, so you work directly with the people doing the work.",
      linkLabel: "All services",
    },
    page: {
      title: "Services",
      intro: "Specialist teams for content, marketing and growth. Choose a service to visit its website.",
      empty: "Our services will be listed here soon.",
    },
  },
  product: {
    href: "/products",
    section: {
      title: "Our products",
      intro: "Platforms we build and run to keep businesses connected, selling and growing.",
      linkLabel: "All products",
    },
    page: {
      title: "Products",
      intro: "Software we build and run for businesses. Choose a product to visit its website.",
      empty: "Our products will be listed here soon.",
    },
  },
};

/** Fixed wording around the About content (which is edited in the admin). */
export const aboutCopy = {
  href: "/about",
  eyebrow: "About Enfinito",
  linkLabel: "More about us",
  pageTitle: "About Enfinito",
  offerings: {
    title: "What we do",
    intro: "Specialist teams and the products we build, each with its own home.",
  },
};

export const careers: CareersContent = {
  href: CAREERS_URL,
  eyebrow: "Careers",
  title: "Do the best work of your career.",
  intro: "We're always looking for curious, talented people to join our teams across content, marketing and technology.",
  cta: "View open roles",
};

export const LEGAL_SLUGS: LegalSlug[] = ["terms", "refunds", "privacy", "delivery"];

/** Where each policy page lives, and its name in the footer. */
export const legalLinks: Record<LegalSlug, NavItem> = {
  terms: { label: "Terms & Conditions", href: "/terms-and-conditions" },
  refunds: { label: "Return & Refund Policy", href: "/return-and-refund-policy" },
  privacy: { label: "Privacy Policy", href: "/privacy-policy" },
  delivery: { label: "Delivery Policy", href: "/delivery-policy" },
};

export const newsPage = {
  title: "News",
  intro: "Announcements, stories and insights from the Enfinito team.",
};
