import type { Metadata } from "next";
import { AuthCallback } from "@/components/auth/auth-callback";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Signing In",
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  return (
    <AuthShell>
      <AuthCallback />
    </AuthShell>
  );
}
