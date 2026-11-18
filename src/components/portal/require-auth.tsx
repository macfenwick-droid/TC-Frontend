"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "./states";

/**
 * Signed-in pages. Signed-out visitors (or a session that expires while here) go to
 * `/auth?redirect=<this page>`, like the current site's dashboard pages.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
  }, [loading, user, pathname, router]);

  if (!user) return <LoadingState label={loading ? "Loading…" : "Redirecting to sign in…"} />;
  return children;
}
