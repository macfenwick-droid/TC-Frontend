import type { Metadata } from "next";
import { AuthPageForm } from "@/components/auth/auth-page-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Log In or Sign Up",
  alternates: { canonical: "/auth" },
  robots: { index: false, follow: true },
};

export default function AuthPage() {
  return (
    <AuthShell>
      <AuthPageForm />
    </AuthShell>
  );
}
