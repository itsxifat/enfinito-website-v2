@AGENTS.md

## Project

Enfinito company website: Next.js (App Router) with MongoDB and a secure admin panel at `/admin`.

### Layout

- `src/app/(site)/`: public pages: home, `/about`, `/services`, `/products`, `/news`, `/contact` and four policy pages (`/terms-and-conditions`, `/return-and-refund-policy`, `/privacy-policy`, `/delivery-policy`).
  - Careers live on an external site, career.enfinito.com: the nav item and the home page's Careers section link there (`careers` in `site.ts`).
  - The site layout renders the header, the footer (`layout/SiteFooter`) and the scroll reveal.
- `src/app/admin/`: the admin panel. `login/` is public. Everything in `(panel)/` requires a session: Dashboard, Messages, Services, Products, Brands, News, About page, Contact page, Footer, Legal pages, Email, Team and Account.
- `src/app/media/[file]/`: serves uploaded images from GridFS.
- `src/content/types.ts`: the shapes of public content. `src/content/site.ts` holds static copy: nav, hero, section titles and intros.
- `src/lib/server/`: server-only code.
  - `data/` has one module per collection. Each public read is a `"use cache"` function with a cache tag; admin reads are uncached.
  - Also here: `auth.ts` (DB sessions), `media.ts` (validates, re-encodes and stores uploads), `email/` (SMTP and templates).
- `src/components/`: `brand/`, `layout/`, `ui/`, `home/`, `offerings/` (service and product cards), `news/`, `contact/` and `admin/`. The admin UI kit is in `admin/ui/`.
- `src/app/globals.css`: design tokens. Components use CSS Modules that reference them; don't add colors or one-off values. Admin tokens live on `.root` in `src/app/admin/admin.module.css`.
- `public/en-logo.png`: the official logo (1648×376, about 41px transparent padding). Use it wherever the logo appears.

### Data and caching

- Services and products share the `offerings` collection, split by `kind`. In the admin, one set of components serves both: `OfferingList`, `OfferingForm` and `offering-actions.ts`, with wording from `offering-labels.ts`.
- On the public site they are deliberately designed differently, so keep them distinct:
  - Services are creative studios: expanding glass panels on the home page (`home/ServicesShowcase`) and editorial alternating rows on the page (`offerings/ServiceRows`).
  - Products are software: stacked sticky scroll cards on the home page (`home/ProductStack`) and surface tiles on the page (`offerings/ProductTile`).
- Each service and product has an `inNav` flag (missing means yes). The navbar dropdowns use `getMenuOfferings`, which returns items that are both visible and in the nav. The admin list toggles the flag per item.
- Cache tags:
  - `brands`, `news`, `contact`, `about`, `footer` and `legal`;
  - `services` and `products`, both produced by `offeringTag(kind)`.
- Admin Server Actions call `updateTag(tag)` and `revalidatePath("/admin", "layout")`.
- Every admin page exports `instant = false`. `getSession()` calls `connection()` first.
- `npm run build` needs MongoDB, because public pages prerender from the database.

### Scripts

- `npm run db:up`: starts local MongoDB and Mailpit, an email catcher at http://localhost:8025.
- `npm run admin:create`: creates the first admin. It reads `ADMIN_*` values from `.env.local`; `--reset` sets a new password.
- `npm run seed:demo`: adds demo content. `-- --remove` deletes it. Restart `next dev` after seeding, because public lists are cached.

### Compliance (payment provider requirements)

The site must always show the following. Don't remove any of it.

- **Legal pages:** an About page with the company story, plus Terms & Conditions, Return & Refund Policy, Privacy Policy and Delivery Policy. All four policies are linked in the footer's bottom bar on every page.
- **Business address and phone:** shown on the Contact page and in the footer.
- **Postal code:** each address has its own required `postalCode`, which `addressText()` prints on its own line.
- **Trade license number:** set in Admin → Contact page and shown in the footer and on the Contact page.
- **Policy text:** edited in Admin → Legal pages, with a small markup (`components/legal/RichText`: `##` headings, `-` lists, `**bold**`, `[links](/path)`, never HTML). Until a page is first saved it shows the starter text from `lib/server/data/legal-templates.ts`.

### Navigation and motion

- **Nav dropdown.** A nav item with `menu: "service" | "product"` shows a desktop dropdown of that kind's offerings (`layout/NavMenu`). The site layout loads the lists through the cached `getPublicOfferings`.
  - On desktop the item is a button with a chevron, not a link. Hover previews the menu; a click, tap, Enter or Space pins it open. The page is linked from inside the menu ("All services").
  - The mobile menu renders a plain link instead.
- **External items.** Items with `external: true` open in a new tab and show a small arrow (Career, for example).
- **Header edge.** The header's bottom edge is a hairline that fades at both ends. A blue marker on it follows the hovered item, then the open menu's item, then the current page.
- **Scroll reveal.** Add `data-reveal` to an element to make it rise into view the first time it's seen. `data-reveal="block"` skips the blur, for images and cards. `--reveal-i` staggers a group.
  - The animation runs through the Web Animations API in `layout/ScrollReveal`. It must never set attributes on elements, because React may still be hydrating them.
  - Don't put `data-reveal` on an element that has its own transform, filter or opacity styles; wrap it instead.
  - The hero has its own entrance animation, so it doesn't use the reveal.

Design language: minimal and premium. White canvas, ink #0D111C, a single blue accent #1F55DF, Geist, large tight headlines, hairline borders, pill buttons, subtle eased motion that respects `prefers-reduced-motion`. New sections must match the hero.
