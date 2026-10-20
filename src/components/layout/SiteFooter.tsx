import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { ContactInfo, FooterContent, NavItem, Offering } from "@/content/types";
import { addressText } from "@/lib/format";
import { BackToTop } from "./BackToTop";
import styles from "./SiteFooter.module.css";

/** Entries per services or products column; the rest are a click away. */
const LIMIT = 5;

type Props = {
  content: FooterContent & { year: number };
  contact: ContactInfo;
  /** Company links: About, Career, News, Contact. */
  company: NavItem[];
  /** Policy pages, in the bottom bar. */
  legal: NavItem[];
  services: { title: string; href: string; items: Offering[] };
  products: { title: string; href: string; items: Offering[] };
  ctaHref: string;
};

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

function ExternalMark() {
  return (
    <>
      <ArrowUpRight className={styles.external} size={13} strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </>
  );
}

function OfferingColumn({ title, href, items }: Props["services"]) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className={styles.columnTitle}>{title}</h2>
      <ul className={styles.list}>
        {items.slice(0, LIMIT).map((item) => (
          <li key={item.id}>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.name}
                <ExternalMark />
              </a>
            ) : (
              <Link href={href}>{item.name}</Link>
            )}
          </li>
        ))}
        <li>
          <Link href={href} className={styles.all}>
            All {title.toLowerCase()}
          </Link>
        </li>
      </ul>
    </div>
  );
}

export function SiteFooter({ content, contact, company, legal, services, products, ctaHref }: Props) {
  const address = contact.addresses[0];
  const hasContact = Boolean(contact.email || contact.phone || address);

  return (
    <footer className={styles.footer}>
      <div className={styles.cta}>
        <h2 className={styles.ctaTitle} data-reveal>
          {content.ctaTitle}
        </h2>
        <div data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
          <ButtonLink href={ctaHref} className={styles.ctaButton}>
            {content.ctaLabel}
            <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>

      <div className={styles.main}>
        <div>
          <Link href="/" className={styles.logo} aria-label="Enfinito home">
            <Image src="/en-logo.png" alt="Enfinito" width={290} height={66} className={styles.logoImage} />
          </Link>
          {content.tagline ? <p className={styles.tagline}>{content.tagline}</p> : null}
          {content.socials.length ? (
            <ul className={styles.socials} aria-label="Enfinito on social media">
              {content.socials.map((social) => (
                <li key={social.url}>
                  <a href={social.url} target="_blank" rel="noopener noreferrer">
                    {social.label}
                    <ExternalMark />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className={styles.links}>
          <nav className={styles.nav} aria-label="Footer">
            <div>
              <h2 className={styles.columnTitle}>Company</h2>
              <ul className={styles.list}>
                {company.map((item) => (
                  <li key={item.href}>
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        {item.label}
                        <ExternalMark />
                      </a>
                    ) : (
                      <Link href={item.href}>{item.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <OfferingColumn {...services} />
            <OfferingColumn {...products} />
          </nav>

          {hasContact ? (
            <div>
              <h2 className={styles.columnTitle}>Contact</h2>
              <ul className={styles.list}>
                {contact.email ? (
                  <li>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </li>
                ) : null}
                {contact.phone ? (
                  <li>
                    <a href={telHref(contact.phone)}>{contact.phone}</a>
                  </li>
                ) : null}
                {address ? (
                  <li>
                    <address className={styles.address}>{addressText(address)}</address>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.bottom}>
        <nav aria-label="Legal">
          <ul className={styles.legal}>
            {legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.meta}>
          <p>© {content.year} Enfinito. All rights reserved.</p>
          {contact.tradeLicense ? <p>Trade License No. {contact.tradeLicense}</p> : null}
          {content.note ? <p>{content.note}</p> : null}
          <BackToTop className={styles.top} />
        </div>
      </div>
    </footer>
  );
}
