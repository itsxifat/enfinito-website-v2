import { addressText } from "@/lib/format";
import type { ContactSettings } from "../models";

// Email-safe HTML: tables, inline styles, system fonts. Logo is attached
// inline (cid:enfinito-logo), so it shows without loading remote images.

export const LOGO_CID = "enfinito-logo";

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const INK = "#0D111C";
const MUTED = "#5A6172";
const BLUE = "#1F55DF";
const LINE = "#EEF0F4";

export type EnquiryDetails = {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  message: string;
};

type Rendered = { subject: string; html: string; text: string };

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const multiline = (value: string) => escapeHtml(value).replace(/\r?\n/g, "<br>");
const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

function paragraph(html: string, style = ""): string {
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.65;color:${INK};${style}">${html}</p>`;
}

function detailsTable(rows: [string, string][]): string {
  const body = rows
    .map(
      ([label, value], i) => `
      <tr>
        <td valign="top" style="padding:14px 0;${i ? `border-top:1px solid ${LINE};` : ""}width:132px;font-family:${FONT};font-size:13px;line-height:1.5;color:${MUTED};">${escapeHtml(label)}</td>
        <td valign="top" style="padding:14px 0;${i ? `border-top:1px solid ${LINE};` : ""}font-family:${FONT};font-size:14px;line-height:1.6;color:${INK};">${multiline(value)}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${body}</table>`;
}

function footer(contact: ContactSettings, siteUrl: string, note: string): string {
  const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const addresses = contact.addresses
    .filter((a) => a.lines.trim())
    .map(
      (a) => `
        <td valign="top" style="padding:0 24px 16px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};">
          ${a.label ? `<strong style="color:${INK};font-weight:600;">${escapeHtml(a.label)}</strong><br>` : ""}${multiline(addressText(a))}
        </td>`,
    )
    .join("");
  const reach = [contact.email, contact.phone].filter(Boolean).map(escapeHtml).join(" &nbsp;·&nbsp; ");

  return `
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
    <tr><td style="padding:28px 40px 0;">
      ${addresses ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr>${addresses}</tr></table>` : ""}
      ${reach ? `<p style="margin:0 0 6px;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};">${reach}</p>` : ""}
      <p style="margin:0 0 18px;font-family:${FONT};font-size:12px;line-height:1.6;"><a href="${escapeHtml(siteUrl)}" style="color:${BLUE};text-decoration:none;">${escapeHtml(host)}</a></p>
      <p style="margin:0;font-family:${FONT};font-size:11px;line-height:1.6;color:#8A90A0;">${note}<br>&copy; ${new Date().getFullYear()} Enfinito. All rights reserved.</p>
    </td></tr>
  </table>`;
}

function layout(opts: { title: string; preheader: string; body: string; footer: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:#F4F5F8;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F8;">
  <tr><td align="center" style="padding:40px 16px 48px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid #E6E8EE;border-radius:16px;">
      <tr><td style="padding:34px 40px 26px;">
        <img src="cid:${LOGO_CID}" width="140" alt="Enfinito" style="display:block;border:0;outline:none;width:140px;height:auto;">
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;line-height:1px;font-size:0;background:${LINE};">&nbsp;</div></td></tr>
      ${opts.body}
    </table>
    ${opts.footer}
  </td></tr>
</table>
</body>
</html>`;
}

/** Formal acknowledgement sent to the person who submitted the form. */
export function contactConfirmationEmail(
  enquiry: EnquiryDetails,
  contact: ContactSettings,
  siteUrl: string,
): Rendered {
  const subject = "We've received your enquiry | Enfinito";
  const firstName = oneLine(enquiry.fullName);
  const rows: [string, string][] = [
    ["Full name", enquiry.fullName],
    ["Business", enquiry.businessName],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone],
    ["Message", enquiry.message],
  ];

  const body = `
      <tr><td style="padding:32px 40px 4px;">
        <h1 style="margin:0 0 20px;font-family:${FONT};font-size:24px;line-height:1.3;font-weight:600;letter-spacing:-0.02em;color:${INK};">Thank you for contacting Enfinito</h1>
        ${paragraph(`Dear ${escapeHtml(firstName)},`)}
        ${paragraph("Thank you for getting in touch. This email confirms that we have received your enquiry. A member of our team will review it carefully and respond to you as soon as possible.")}
        ${paragraph("For your records, a summary of the details you submitted is below.", `color:${MUTED};`)}
      </td></tr>
      <tr><td style="padding:4px 40px 8px;">
        <div style="border:1px solid ${LINE};border-radius:12px;padding:4px 20px;">${detailsTable(rows)}</div>
      </td></tr>
      <tr><td style="padding:24px 40px 36px;">
        ${paragraph("Should you wish to add anything to your enquiry, simply reply to this email.")}
        ${paragraph(`Kind regards,<br><strong style="font-weight:600;">The Enfinito Team</strong>`, "margin:0;")}
      </td></tr>`;

  const html = layout({
    title: subject,
    preheader: "Thank you for getting in touch. We have received your enquiry.",
    body,
    footer: footer(
      contact,
      siteUrl,
      "You are receiving this email because this address was used to submit an enquiry on our website. If this wasn't you, you can safely ignore it.",
    ),
  });

  const text = [
    `Dear ${firstName},`,
    "",
    "Thank you for getting in touch. This email confirms that we have received your enquiry. A member of our team will review it carefully and respond to you as soon as possible.",
    "",
    "Your submission:",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Should you wish to add anything to your enquiry, simply reply to this email.",
    "",
    "Kind regards,",
    "The Enfinito Team",
    "",
    "--",
    ...contact.addresses.filter((a) => a.lines.trim()).map((a) => [a.label, addressText(a)].filter(Boolean).join("\n")),
    [contact.email, contact.phone].filter(Boolean).join(" · "),
    siteUrl,
  ].join("\n");

  return { subject, html, text };
}

/** Internal alert to the team about a new enquiry. */
export function newEnquiryNotification(enquiry: EnquiryDetails, adminUrl: string, contact: ContactSettings, siteUrl: string): Rendered {
  const subject = `New enquiry: ${oneLine(enquiry.fullName)}, ${oneLine(enquiry.businessName)}`;
  const rows: [string, string][] = [
    ["Full name", enquiry.fullName],
    ["Business", enquiry.businessName],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone],
    ["Message", enquiry.message],
  ];
  const body = `
      <tr><td style="padding:32px 40px 4px;">
        <h1 style="margin:0 0 12px;font-family:${FONT};font-size:22px;line-height:1.3;font-weight:600;letter-spacing:-0.02em;color:${INK};">New enquiry from the website</h1>
        ${paragraph("Someone submitted the contact form. Reply to this email to answer them directly.", `color:${MUTED};`)}
      </td></tr>
      <tr><td style="padding:4px 40px 8px;">
        <div style="border:1px solid ${LINE};border-radius:12px;padding:4px 20px;">${detailsTable(rows)}</div>
      </td></tr>
      <tr><td style="padding:24px 40px 36px;">
        <a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:${BLUE};color:#FFFFFF;font-family:${FONT};font-size:14px;font-weight:600;text-decoration:none;">Open in admin</a>
      </td></tr>`;
  return {
    subject,
    html: layout({ title: subject, preheader: `${enquiry.fullName} (${enquiry.businessName})`, body, footer: footer(contact, siteUrl, "Sent by the Enfinito website.") }),
    text: [subject, "", ...rows.map(([l, v]) => `${l}: ${v}`), "", `Open in admin: ${adminUrl}`].join("\n"),
  };
}

/** Sent from Settings → Email to check the SMTP configuration. */
export function testEmail(contact: ContactSettings, siteUrl: string): Rendered {
  const subject = "Test email from your Enfinito website";
  const body = `
      <tr><td style="padding:32px 40px 36px;">
        <h1 style="margin:0 0 16px;font-family:${FONT};font-size:22px;line-height:1.3;font-weight:600;letter-spacing:-0.02em;color:${INK};">Email is set up correctly</h1>
        ${paragraph("This test confirms your website can send email with the SMTP settings saved in the admin panel. Confirmation emails to people who use the contact form will look like this.", "margin:0;")}
      </td></tr>`;
  return {
    subject,
    html: layout({ title: subject, preheader: "Your SMTP settings work.", body, footer: footer(contact, siteUrl, "Sent from the Enfinito admin panel.") }),
    text: `${subject}\n\nThis test confirms your website can send email with the SMTP settings saved in the admin panel.`,
  };
}
