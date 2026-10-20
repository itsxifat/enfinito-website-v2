import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { contactLink, LEGAL_SLUGS, legalLinks, navigation, offeringsCopy } from "@/content/site";
import { getFooter } from "@/lib/server/data/footer";
import { getMenuOfferings, getPublicOfferings } from "@/lib/server/data/offerings";
import { getContactInfo } from "@/lib/server/data/settings";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [menuServices, menuProducts, services, products, footer, contact] = await Promise.all([
    getMenuOfferings("service"),
    getMenuOfferings("product"),
    getPublicOfferings("service"),
    getPublicOfferings("product"),
    getFooter(),
    getContactInfo(),
  ]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader items={navigation} cta={contactLink} menus={{ service: menuServices, product: menuProducts }} />
      <main id="main">{children}</main>
      <SiteFooter
        content={footer}
        contact={contact}
        company={[...navigation.filter((item) => !item.menu), contactLink]}
        legal={LEGAL_SLUGS.map((slug) => legalLinks[slug])}
        services={{ title: offeringsCopy.service.page.title, href: offeringsCopy.service.href, items: services }}
        products={{ title: offeringsCopy.product.page.title, href: offeringsCopy.product.href, items: products }}
        ctaHref={contactLink.href}
      />
      <ScrollReveal />
    </>
  );
}
