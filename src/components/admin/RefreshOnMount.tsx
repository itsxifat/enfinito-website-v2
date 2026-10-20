"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-fetches the current route once after mount, e.g. so the sidebar's
 *  unread count reflects a message the page just marked as read. */
export function RefreshOnMount({ when }: { when: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (when) router.refresh();
  }, [when, router]);
  return null;
}
