// Shapes of the content the public site renders. Static copy lives in
// ./site.ts; brands, services, products, news and contact details come from
// MongoDB and are managed in the admin panel.

export type NavItem = {
  label: string;
  href: string;
  /** Another site: opens in a new tab and is marked with an arrow. */
  external?: boolean;
  /** Shows a dropdown of this kind's services or products (desktop). */
  menu?: OfferingKind;
};

export type CareersContent = {
  href: string;
  eyebrow: string;
  title: string;
  intro: string;
  cta: string;
};

export type ImageAsset = {
  src: string;
  /** Intrinsic size (or SVG viewBox), used for aspect ratio and sizing. */
  width: number;
  height: number;
};

export type Brand = {
  name: string;
  logo: ImageAsset;
  url?: string;
};

export type OfferingKind = "service" | "product";

/** A service or product card. Each one links out to its own website. */
export type Offering = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Banner image. */
  image: ImageAsset;
  url?: string;
};

/** Copy around a list of offerings: the home section and the full page. */
export type OfferingsCopy = {
  section: { title: string; intro: string; linkLabel: string };
  page: { title: string; intro: string; empty: string };
  href: string;
};

export type NewsItem = {
  id: string;
  title: string;
  subtitle: string;
  image: ImageAsset;
  url: string;
  publishedAt: Date;
};

export type Address = {
  label: string;
  /** Free text; one line per line of the address. */
  lines: string;
  /** Shown on its own line (payment providers check for it). */
  postalCode: string;
  mapUrl?: string;
};

export type ContactInfo = {
  heading: string;
  intro: string;
  email: string;
  phone: string;
  hours: string;
  /** Shown in the footer of every page and on the Contact page. */
  tradeLicense: string;
  addresses: Address[];
};

export type AboutValue = { title: string; text: string };
export type AboutStat = { value: string; label: string };

/** The home page's About section and the About page. */
export type AboutContent = {
  /** Shown large; words in *asterisks* are highlighted. */
  statement: string;
  /** Under the statement on the home page. */
  summary: string;
  /** Lead at the top of the About page. */
  intro: string;
  /** Optional wide photo on the About page. */
  image?: ImageAsset;
  storyTitle: string;
  /** Paragraphs separated by blank lines. */
  story: string;
  valuesTitle: string;
  values: AboutValue[];
  /** Optional key figures; hidden when empty. */
  stats: AboutStat[];
};

export type SocialLink = { label: string; url: string };

export type FooterContent = {
  tagline: string;
  ctaTitle: string;
  ctaLabel: string;
  socials: SocialLink[];
  /** Small print in the bottom bar, such as a company number. */
  note: string;
};

export type LegalSlug = "terms" | "refunds" | "privacy" | "delivery";

/** A policy page. `body` uses a small markup: ## headings, - lists,
 *  **bold** and [links](/path). */
export type LegalPage = {
  slug: LegalSlug;
  title: string;
  body: string;
  /** When it was last saved; null while it still shows the starter text. */
  updatedAt: Date | null;
};

export type HeroContent = {
  titleLines: string[];
  lead: string;
  rotatingWords: string[];
  rotateIntervalMs: number;
  cta: NavItem;
};
