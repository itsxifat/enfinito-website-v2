import "server-only";
import type { LegalSlug } from "@/content/types";

/** Starter text for the policy pages, shown until each is first saved in
 *  the admin. It describes what this website actually does (the contact
 *  form's fields, no tracking cookies), but its commitments (refund window,
 *  delivery times, governing law) are defaults for the business to confirm,
 *  ideally with a legal advisor. */
export const LEGAL_TEMPLATES: Record<LegalSlug, { title: string; body: string }> = {
  terms: {
    title: "Terms & Conditions",
    body: `These terms apply to your use of the Enfinito website and to the services and products we provide. By using this website or engaging us, you agree to them. If you do not agree, please do not use the website or our services.

## About us
Enfinito provides marketing, content production and technology services and products to businesses. Our business details, including our trade license number and office address, are shown at the bottom of every page and on our [Contact page](/contact).

## Using this website
- You may use this website for lawful purposes only.
- You must not try to gain unauthorised access to the website, its servers or any connected systems.
- Some of our services and products have their own websites, which may have additional terms. Where they do, those terms apply alongside these.

## Quotes, orders and payment
- Work begins once a quote or proposal has been accepted and any agreed advance payment has been received.
- Prices are set out in the quote or invoice, together with any applicable taxes.
- Online payments are processed securely by our payment partner. We never see or store your full card details.
- Invoices are payable by the due date shown on them. We may pause work while a payment is overdue.

## Delivery
How and when we deliver depends on the service or product. See our [Delivery Policy](/delivery-policy).

## Cancellations and refunds
Cancellations and refunds are handled under our [Return & Refund Policy](/return-and-refund-policy).

## Intellectual property
- Unless agreed otherwise in writing, ownership of final deliverables passes to you once they have been paid for in full.
- We keep ownership of our own tools, templates, software and know-how. We may show completed work in our portfolio unless you ask us not to.
- The content of this website belongs to Enfinito and may not be copied without permission.

## Your responsibilities
You are responsible for the accuracy of the information, materials and approvals you give us, and for having the rights to any content you ask us to use.

## Limitation of liability
We provide our services with reasonable skill and care. As far as the law allows, we are not liable for indirect or consequential losses, and our total liability for any claim is limited to the amount you paid for the service concerned.

## Privacy
We handle personal information as described in our [Privacy Policy](/privacy-policy).

## Changes to these terms
We may update these terms from time to time. The date at the top of this page shows when they last changed.

## Governing law
These terms are governed by the laws of the country in which Enfinito is registered, whose courts have jurisdiction over any dispute.

## Contact
Questions about these terms? Reach us through the details on our [Contact page](/contact).`,
  },

  refunds: {
    title: "Return & Refund Policy",
    body: `We want you to be happy with what we deliver. This policy explains when you can cancel or ask for a refund, and how refunds are paid.

## Services
- **Before work begins:** you can cancel and receive a full refund of any advance payment.
- **After work has started:** you can cancel at any time. We refund any amount paid for work not yet carried out, less costs already incurred on your behalf, such as booked studio time, models or advertising spend.
- **Completed work:** work that has been delivered and approved cannot be refunded. If something is not as agreed, tell us and we will put it right first.

## Subscriptions and software
- You can cancel a subscription at any time. It stays active until the end of the period you have paid for and will not renew.
- Payments for a period that has already started are not refunded, unless the service was unavailable for reasons within our control.

## Returns
We provide services and digital products, so there are no physical goods to return. If a deliverable has a fault, we will correct it at no extra cost.

## How to request a refund
Contact us within 7 days of the payment, or of the delivery concerned, through the details on our [Contact page](/contact). Include your name, the invoice or transaction number and the reason for your request.

## How refunds are paid
Approved refunds are paid to the original payment method within 7 to 10 working days. Depending on your bank or card provider, the money may take a few more days to appear in your account.

## Questions
If you are not sure whether a refund applies, contact us. We will always try to find a fair solution.`,
  },

  privacy: {
    title: "Privacy Policy",
    body: `This policy explains what personal information Enfinito collects through this website, why we collect it and how we look after it.

## Information we collect
- **When you contact us:** your full name, business name, email address, phone number and message, sent through the form on our [Contact page](/contact).
- **When you work with us:** the contact and billing details we need to provide our services and send invoices.
- **When you pay online:** payments are handled by our payment partner. We receive confirmation of the payment, but never your full card details.

## How we use it
- To reply to your enquiry and confirm that we received it.
- To provide, manage and invoice the services and products you ask for.
- To meet our legal and accounting obligations.

We do not sell your personal information, and we do not use it for advertising without your consent.

## Cookies
This website does not use advertising or tracking cookies. Cookies are used only where the website needs them to work.

## Sharing
We share personal information only with providers who help us run our business, such as email, hosting and payment providers, and only as far as they need it. We may also disclose it where the law requires us to.

## How long we keep it
We keep enquiries and business records only for as long as we need them for the purposes above, or for as long as the law requires.

## Security
We protect your information with appropriate technical and organisational measures, including encrypted connections and restricted access.

## Your rights
You can ask us to show you, correct or delete the personal information we hold about you, or object to how we use it. Contact us through the details on our [Contact page](/contact).

## Changes to this policy
We may update this policy from time to time. The date at the top of this page shows when it last changed.`,
  },

  delivery: {
    title: "Delivery Policy",
    body: `Enfinito provides services and digital products. This policy explains how and when they are delivered.

## Services
- Timelines and deliverables are set out in your quote or proposal. Work is scheduled once the quote has been accepted and any advance payment has been received.
- Files and other deliverables are shared digitally, by email, download link or shared folder.
- On-site work, such as photo and video shoots, takes place on the date and at the time and location agreed in advance.

## Software and subscriptions
Access to our software products is set up after payment has been confirmed, usually within 1 to 2 working days. We send the login or setup details to the email address you gave us.

## Physical goods
We do not sell or ship physical goods. If a project includes printed or other physical items, delivery arrangements and any costs are agreed in your quote.

## Delays
If a delivery is going to be late, we will tell you as early as possible and agree a new date with you.

## Questions
If you have a question about a delivery, contact us through the details on our [Contact page](/contact).`,
  },
};
