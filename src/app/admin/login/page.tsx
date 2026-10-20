import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { GlassMark } from "@/components/brand/GlassMark";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/server/auth";
import styles from "./page.module.css";

// Admin pages render per request (session + fresh data); opt out of the
// instant-navigation validation that public pages get.
export const instant = false;

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getSession()) redirect("/admin");
  const { next } = await searchParams;

  return (
    <div className={styles.page}>
      <div className={styles.formSide}>
        <div className={styles.formWrap}>
          <Image src="/en-logo.png" alt="Enfinito" width={290} height={66} className={styles.logo} loading="eager" />
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to manage the Enfinito website.</p>
          <LoginForm next={typeof next === "string" ? next : undefined} />
          <p className={styles.footnote}>
            <ShieldCheck size={15} strokeWidth={1.75} aria-hidden="true" />
            Secure area for the Enfinito team.
          </p>
        </div>
      </div>

      <div className={styles.art} aria-hidden="true">
        <GlassMark className={styles.mark} />
        <div className={styles.caption}>
          <p className={styles.captionTitle}>Everything your website needs.</p>
          <p className={styles.captionText}>Messages, brands, news and contact details, all in one place.</p>
        </div>
      </div>
    </div>
  );
}
