import { AboutSection } from "@/components/home/AboutSection";
import { CareersSection } from "@/components/home/CareersSection";
import { Hero } from "@/components/home/Hero";
import { ProductsSection } from "@/components/home/ProductsSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { TrustedBrands } from "@/components/home/TrustedBrands";
import { aboutCopy, careers, hero, offeringsCopy, trustedBrandsTitle } from "@/content/site";
import { getAbout } from "@/lib/server/data/about";
import { getPublicBrands } from "@/lib/server/data/brands";
import { getPublicOfferings } from "@/lib/server/data/offerings";

export default async function HomePage() {
  const [brands, about, services, products] = await Promise.all([
    getPublicBrands(),
    getAbout(),
    getPublicOfferings("service"),
    getPublicOfferings("product"),
  ]);
  return (
    <>
      <Hero content={hero} />
      <TrustedBrands title={trustedBrandsTitle} brands={brands} />
      {/* Always shown, so the sections after it never need extra spacing. */}
      <AboutSection content={about} copy={aboutCopy} spaced={brands.length === 0} />
      <ServicesSection id="services" copy={offeringsCopy.service} items={services} />
      <ProductsSection id="products" copy={offeringsCopy.product} items={products} />
      <CareersSection content={careers} />
    </>
  );
}
