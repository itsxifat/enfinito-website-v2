import type { OfferingKind } from "@/content/types";

/** Wording and routes for the admin's Services and Products sections. */
export type OfferingLabels = {
  kind: OfferingKind;
  title: string;
  singular: string;
  plural: string;
  path: string;
  publicPath: string;
  placeholders: { name: string; tagline: string; description: string; url: string };
};

export const offeringLabels: Record<OfferingKind, OfferingLabels> = {
  service: {
    kind: "service",
    title: "Services",
    singular: "service",
    plural: "services",
    path: "/admin/services",
    publicPath: "/services",
    placeholders: {
      name: "Enfinito Studio",
      tagline: "Photo, film and content production",
      description: "Product photography, cinematography and ad campaigns, from concept to final cut.",
      url: "https://studio.enfinito.com",
    },
  },
  product: {
    kind: "product",
    title: "Products",
    singular: "product",
    plural: "products",
    path: "/admin/products",
    publicPath: "/products",
    placeholders: {
      name: "Envo",
      tagline: "Cloud PBX and business numbers",
      description: "Hosted PBX and IP numbers for teams of any size, managed entirely in the cloud.",
      url: "https://envo.example.com",
    },
  },
};
