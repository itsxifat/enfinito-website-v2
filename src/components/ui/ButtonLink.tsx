import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./Button.module.css";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "light";
};

export function ButtonLink({ variant = "primary", className, ...props }: ButtonLinkProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");
  return <Link className={classes} {...props} />;
}
