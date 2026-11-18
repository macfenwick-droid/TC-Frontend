import type { Metadata } from "next";
import { AuthPageForm } from "@/components/auth/auth-page-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { PageGlow } from "@/components/brand/glow";

export const metadata: Metadata = {
  title: "Log In or Sign Up",
  alternates: { canonical: "/auth" },
  robots: { index: false, follow: true },
};

export default function AuthPage() {
  return (
    <>
      <PageGlow />
      <AuthShell>
        <AuthPageForm />
      </AuthShell>
    </>
  );
}
