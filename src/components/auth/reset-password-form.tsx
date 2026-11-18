"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { fieldClass, FieldLabel } from "@/components/brand/field";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";
import { AuthHeading, PasswordInput, SubmitButton, errorMessage } from "./auth-ui";

const LINK_DEAD =
  "This reset link has expired or has already been used. Request a new one below and we'll email it right away.";

/**
 * Supabase reports a dead link in the URL rather than in the response body, and it
 * can arrive in either the query string or the hash depending on the flow.
 */
const readLinkError = (search: string, hash: string): string | null => {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  const pick = (key: string) => query.get(key) || fragment.get(key);
  const errorCode = pick("error_code");
  const error = pick("error");
  if (!errorCode && !error && !pick("error_description")) return null;
  // "otp_expired" and "access_denied" both mean the same thing to a seller.
  return errorCode === "otp_expired" || error === "access_denied" ? LINK_DEAD : pick("error_description") || LINK_DEAD;
};

/** /reset-password — port of the current site's ResetPassword page (same logic and copy). */
export function ResetPasswordForm() {
  const router = useRouter();
  const { exchangeFromSupabase, updatePassword, forgotPassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("Validating link...");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [saving, setSaving] = useState(false);
  // A recovery code can be exchanged only once; React dev mode runs effects twice.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    // Read the URL before anything async — the auth provider strips the hash once
    // it has consumed the recovery tokens.
    const { search, hash } = window.location;
    const supabase = getSupabase();

    const fail = (reason: string) => {
      setStatus("error");
      setMessage(reason);
    };

    const succeed = (token: string) => {
      setAccessToken(token);
      setStatus("ready");
      setMessage("Enter your new password.");
    };

    const init = async () => {
      // A working recovery link arrives with its tokens in the hash.
      const fragment = new URLSearchParams(hash.replace(/^#/, ""));
      const access_token = fragment.get("access_token");
      const refresh_token = fragment.get("refresh_token");
      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error || !data.session) {
          console.error("Reset link session failed:", error);
          fail(LINK_DEAD);
          return;
        }
        try {
          await exchangeFromSupabase(data.session);
          succeed(data.session.access_token);
        } catch (err) {
          console.error("Reset link exchange failed:", err);
          fail("We could not finish signing you in. Request a new link below.");
        }
        return;
      }

      const { data: existing } = await supabase.auth.getSession();
      if (existing?.session) {
        succeed(existing.session.access_token);
        return;
      }

      // Supabase says outright that the link is dead — show that, not a guess.
      const linkError = readLinkError(search, hash);
      if (linkError) {
        fail(linkError);
        return;
      }

      // Only a real code can be exchanged.
      const code = new URLSearchParams(search).get("code");
      if (!code) {
        fail(LINK_DEAD);
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.session) {
        console.error("Reset code exchange failed:", error);
        fail(LINK_DEAD);
        return;
      }
      try {
        await exchangeFromSupabase(data.session);
        succeed(data.session.access_token);
      } catch (err) {
        console.error("Reset link exchange failed:", err);
        fail("We could not finish signing you in. Request a new link below.");
      }
    };
    init().catch((err) => {
      console.error("Reset link failed:", err);
      fail(LINK_DEAD);
    });
    // Runs once on landing; useAuth's functions are not memoised and must not re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = async (e: FormEvent) => {
    e.preventDefault();
    const email = resendEmail.trim();
    if (!email) return;
    try {
      setResending(true);
      await forgotPassword(email);
      setResendSent(true);
    } catch (error) {
      console.error("Could not resend reset link:", error);
      toast({ title: "Could not send the link", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please confirm your new password.", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      if (accessToken) await api.updatePasswordWithToken(newPassword, accessToken);
      else await updatePassword(newPassword);
      toast({ title: "Password updated", description: "You can now sign in with email/password." });
      router.replace("/");
    } catch (error) {
      toast({ title: "Failed to update password", description: errorMessage(error, "Try again later."), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (status !== "ready") {
    return (
      // min-h: the "link expired" form appears in the same space, so nothing below jumps.
      <div className="flex min-h-[22rem] flex-col items-center justify-center gap-5 py-6 text-center">
        <h1 className="sr-only">Reset Password</h1>
        {status === "loading" ? (
          <Loader2 className="size-8 animate-spin text-brand" aria-hidden="true" />
        ) : (
          <AlertCircle className="size-8 text-amber-fg" aria-hidden="true" />
        )}
        <p className="text-[17px] font-medium" role="status" aria-live="polite">
          {message}
        </p>

        {status === "error" &&
          (resendSent ? (
            <p className="rounded-2xl bg-mint px-4 py-3 font-semibold">Done — check your inbox for a fresh reset link.</p>
          ) : (
            <form onSubmit={handleResend} className="flex w-full flex-col gap-4 text-left">
              <div>
                <FieldLabel htmlFor="resend-email">Email</FieldLabel>
                <input
                  id="resend-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={fieldClass}
                />
              </div>
              <SubmitButton loading={resending}>{resending ? "Sending..." : "Send a new reset link"}</SubmitButton>
            </form>
          ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthHeading as="h1" title="Set a new password">
        You were signed in from the reset link. Pick a strong new password.
      </AuthHeading>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <FieldLabel htmlFor="new-password">New password</FieldLabel>
          <PasswordInput id="new-password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
        </div>
        <div>
          <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
        </div>
        <SubmitButton loading={saving}>Update password</SubmitButton>
      </form>
    </div>
  );
}
