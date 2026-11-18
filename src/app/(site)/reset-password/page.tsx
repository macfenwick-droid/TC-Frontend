import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { PageGlow } from "@/components/brand/glow";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <>
      <PageGlow />
      <AuthShell>
        <ResetPasswordForm />
      </AuthShell>
    </>
  );
}
