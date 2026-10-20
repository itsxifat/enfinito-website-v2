"use client";

import { ArrowUp } from "lucide-react";

/** Scrolls to the top and moves keyboard focus there too, so the next Tab
 *  continues from the header rather than the bottom of the page. */
export function BackToTop({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.querySelector<HTMLElement>("header a")?.focus({ preventScroll: true });
      }}
    >
      Back to top
      <ArrowUp size={15} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
