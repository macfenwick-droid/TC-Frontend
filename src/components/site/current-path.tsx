"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Echoes the requested path on the 404 page (same as the current site).
 * The 404 page is prerendered once, so the real path is only known in the browser:
 * render nothing on the server and fill it in after hydration (no mismatch).
 */
export function CurrentPath({ className }: { className?: string }) {
  const pathname = useSyncExternalStore(
    noopSubscribe,
    () => window.location.pathname,
    () => ""
  );
  return <p className={className}>{pathname}</p>;
}
