import { getSession } from "@/lib/server/auth";
import { loadContactSettings } from "@/lib/server/data/settings";
import { getEnv } from "@/lib/server/env";
import { emailLogoDataUrl } from "@/lib/server/email/send";
import { contactConfirmationEmail, LOGO_CID, newEnquiryNotification } from "@/lib/server/email/templates";

const SAMPLE = {
  fullName: "Alex Morgan",
  businessName: "Northwind Studio",
  email: "alex@example.com",
  phone: "+1 (555) 010-0123",
  message: "Hi Enfinito team,\n\nWe're planning a relaunch of our brand next quarter and would love to talk about content production and a new website.\n\nBest,\nAlex",
};

/** Renders an email template with sample data, for checking the design.
 *  ?type=notification shows the team alert instead. */
export async function GET(request: Request) {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });

  const contact = await loadContactSettings();
  const { SITE_URL } = getEnv();
  const type = new URL(request.url).searchParams.get("type");
  const email =
    type === "notification"
      ? newEnquiryNotification(SAMPLE, new URL("/admin/messages", SITE_URL).toString(), contact, SITE_URL)
      : contactConfirmationEmail(SAMPLE, contact, SITE_URL);

  const html = email.html.replace(`cid:${LOGO_CID}`, await emailLogoDataUrl());
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      // Email markup is static: no scripts, inline styles and the inlined logo only.
      "Content-Security-Policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'",
    },
  });
}
