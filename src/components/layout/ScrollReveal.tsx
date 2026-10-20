"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SHOWN = { opacity: 1, transform: "none", filter: "none" };
const EASE_OUT = "cubic-bezier(.22, 1, .36, 1)";

/** Elements already shown; kept across navigations. */
const shown = new WeakSet<Element>();

/** Plays the reveal with the Web Animations API, which leaves the element's
 *  attributes alone. React may still be hydrating it, and changing
 *  attributes there would cause a hydration mismatch. `fill` holds the end
 *  state over the hidden style from globals.css. */
function show(el: HTMLElement, animate: boolean) {
  shown.add(el);
  if (!animate) {
    el.animate([SHOWN, SHOWN], { duration: 0, fill: "forwards" });
    return;
  }
  const from = {
    opacity: 0,
    transform: "translateY(24px)",
    filter: el.dataset.reveal === "block" ? "none" : "blur(6px)",
  };
  const index = Number(getComputedStyle(el).getPropertyValue("--reveal-i")) || 0;
  el.animate([from, SHOWN], { duration: 1000, delay: index * 80, easing: EASE_OUT, fill: "both" });
}

/** Reveals `[data-reveal]` elements the first time they scroll into view.
 *  Content is only hidden once this runs, and on first load anything
 *  already on screen is left as it is, so nothing flashes and the page
 *  works without JavaScript. */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => !shown.has(el));

    if (!root.hasAttribute("data-reveal-on")) {
      for (const el of pending) {
        const { top, bottom } = el.getBoundingClientRect();
        if (top < window.innerHeight && bottom > 0) show(el, false);
      }
      root.setAttribute("data-reveal-on", "");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          show(entry.target as HTMLElement, true);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    for (const el of pending) {
      if (!shown.has(el)) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
