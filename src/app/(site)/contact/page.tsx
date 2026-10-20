import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageIntro } from "@/components/layout/PageIntro";
import { addressText } from "@/lib/format";
import { getContactInfo } from "@/lib/server/data/settings";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Enfinito about marketing, content production and technology.",
};

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export default async function ContactPage() {
  const info = await getContactInfo();
  const addresses = info.addresses.filter((a) => a.lines.trim());
  const hasDetails = Boolean(info.email || info.phone || info.hours || info.tradeLicense || addresses.length);

  return (
    <>
      <PageIntro title={info.heading} intro={info.intro} />

      <section className={styles.layout} data-single={hasDetails ? undefined : ""} aria-label="Contact details and form">
        {hasDetails ? (
          <div className={styles.details}>
            {info.email ? (
              <div className={styles.item} data-reveal>
                <p className={styles.label}>Email</p>
                <a className={styles.value} href={`mailto:${info.email}`}>
                  {info.email}
                </a>
              </div>
            ) : null}
            {info.phone ? (
              <div className={styles.item} data-reveal>
                <p className={styles.label}>Phone</p>
                <a className={styles.value} href={telHref(info.phone)}>
                  {info.phone}
                </a>
              </div>
            ) : null}
            {info.hours ? (
              <div className={styles.item} data-reveal>
                <p className={styles.label}>Hours</p>
                <p className={styles.text}>{info.hours}</p>
              </div>
            ) : null}
            {info.tradeLicense ? (
              <div className={styles.item} data-reveal>
                <p className={styles.label}>Trade license</p>
                <p className={styles.text}>{info.tradeLicense}</p>
              </div>
            ) : null}
            {addresses.map((address, i) => (
              <div className={styles.item} key={`${address.label}-${i}`} data-reveal>
                <p className={styles.label}>{address.label || "Address"}</p>
                <address className={styles.address}>{addressText(address)}</address>
                {address.mapUrl ? (
                  <a className={styles.map} href={address.mapUrl} target="_blank" rel="noopener noreferrer">
                    View on map <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className={styles.formCard} data-reveal="block" style={{ "--reveal-i": 1 } as CSSProperties}>
          <h2 className={styles.formTitle}>Send us a message</h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
