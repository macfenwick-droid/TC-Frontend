"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth, type SupabaseSessionLike } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { PhoneVerifyStep } from "./phone-verify-step";

const messageOf = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

/**
 * Google OAuth landing — port of the current site's AuthCallback. Exchanges the Supabase
 * session with the backend; a brand-new Google user without a verified phone gets a 428 and
 * verifies here first.
 */
export function AuthCallback() {
  const router = useRouter();
  const { exchangeFromSupabase } = useAuth();
  const [message, setMessage] = useState("Finishing sign-in...");
  const [hasCode, setHasCode] = useState(true);
  const [pendingSession, setPendingSession] = useState<SupabaseSessionLike | null>(null);
  // An auth code can be exchanged only once; React dev mode runs effects twice.
  const started = useRef(false);

  const finalize = async (session: SupabaseSessionLike, phoneToken?: string) => {
    await exchangeFromSupabase(session, phoneToken);
    setMessage("Success! Redirecting...");
    setTimeout(() => router.replace("/"), 300);
  };

  const tryExchange = async (session: SupabaseSessionLike) => {
    try {
      await finalize(session);
    } catch (err) {
      if (err instanceof ApiError && err.status === 428) {
        setPendingSession(session);
        return;
      }
      setMessage(messageOf(err, "Unable to finalize session"));
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const completeAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const errorDescription = params.get("error_description") || hashParams.get("error_description");

      // Supabase may return tokens in the hash (implicit flow).
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        try {
          const { data, error } = await getSupabase().auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error || !data.session) throw error || new Error("No session from setSession");
          await tryExchange(data.session);
        } catch (err) {
          setMessage(messageOf(err, "Unable to finalize session"));
        }
        return;
      }

      // Standard PKCE / code flow. Pass the code itself, and keep Supabase's wording out of the UI.
      const authCode = params.get("code");
      if (!authCode) {
        setHasCode(false);
        setMessage(errorDescription || "Missing authorization code. Please start the login again.");
        return;
      }
      try {
        const { data, error } = await getSupabase().auth.exchangeCodeForSession(authCode);
        if (error) throw error;
        if (data.session) await tryExchange(data.session);
        else setMessage("No session returned from provider.");
      } catch (err) {
        console.error("OAuth code exchange failed:", err);
        setMessage("We could not complete sign-in. Please try signing in again.");
      }
    };
    void completeAuth();
    // Runs once on landing; the handlers only read the URL and stable hooks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pendingSession) {
    return (
      <>
        <h1 className="sr-only">Signing In</h1>
        <PhoneVerifyStep
          title="One more step"
          description="Verify your phone to finish creating your account. US & Canada only."
          onVerified={async (token) => {
            const session = pendingSession;
            setPendingSession(null);
            setMessage("Finishing sign-in...");
            try {
              await finalize(session, token);
            } catch (err) {
              setMessage(messageOf(err, "Unable to finalize session. Please try signing in again."));
            }
          }}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center" role="status" aria-live="polite">
      <h1 className="sr-only">Signing In</h1>
      <Loader2 className={cn("size-8", hasCode ? "animate-spin text-brand" : "text-subtle")} aria-hidden="true" />
      <p className="text-[17px] font-medium">{message}</p>
    </div>
  );
}
