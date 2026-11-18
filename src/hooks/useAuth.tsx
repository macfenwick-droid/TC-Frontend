"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api, onSessionExpired, type AuthUser } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";

export type { AuthUser };

/** Minimal shape of a Supabase session needed for the backend exchange. */
export type SupabaseSessionLike = {
  access_token: string;
  refresh_token: string;
  provider_token?: string | null;
  user: {
    email?: string;
    app_metadata?: { provider?: string };
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
      phone_number?: string;
    };
  } | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  phoneVerificationEnabled: boolean;
  checkEmail: (email: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<AuthUser>;
  requestSignupOtp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string
  ) => Promise<void>;
  resendSignupOtp: (email: string) => Promise<void>;
  verifySignup: (email: string, token: string, phoneVerificationToken: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<string>;
  verifyPhoneOtp: (phone: string, code: string) => Promise<string>;
  startGoogleLogin: () => Promise<void>;
  exchangeFromSupabase: (session: SupabaseSessionLike, phoneVerificationToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapUser(user: AuthUser): AuthUser {
  return {
    user_id: user.user_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone_number: user.phone_number,
    phone_verified: user.phone_verified,
    provider: user.provider,
    is_admin: user.is_admin,
    is_super_admin: user.is_super_admin,
  };
}

// OAuth returns to the domain the visitor is on (preview, production, localhost), so a
// Vercel preview never bounces to the live site. NEXT_PUBLIC_SITE_URL is only for SEO URLs.
const siteUrl = () => window.location.origin;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Whether signup must verify a phone via SMS OTP. Read from the backend at runtime so
  // the feature can be toggled with one env var. Defaults off so a failed/slow fetch
  // never blocks signup.
  const [phoneVerificationEnabled, setPhoneVerificationEnabled] = useState(false);

  // Mirrors `user` for the session-expiry listener, which runs outside React's render.
  const userRef = useRef<AuthUser | null>(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Signing out on a dead session is not something to warn them about.
  const loggingOutRef = useRef(false);

  useEffect(() => {
    // The API layer refreshes a stale access token on its own; this only fires once
    // the session is genuinely unrecoverable, so the UI must stop showing them as
    // signed in. Anonymous visitors have nothing to clear and see nothing.
    return onSessionExpired(() => {
      if (!userRef.current || loggingOutRef.current) return;
      setUser(null);
      toast({
        title: "Session expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
    });
  }, []);

  useEffect(() => {
    // Handle hash tokens from Supabase recovery/magic links
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashAccess = hashParams.get("access_token");
    const hashRefresh = hashParams.get("refresh_token");
    const hashType = hashParams.get("type");
    const handleHashSession = async () => {
      if (hashAccess && hashRefresh) {
        try {
          const { data, error } = await getSupabase().auth.setSession({
            access_token: hashAccess,
            refresh_token: hashRefresh,
          });
          if (!error && data.session) {
            // Clean URL
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
            if (hashType === "recovery") {
              window.location.replace("/reset-password");
            }
          }
        } catch {
          // ignore and continue normal flow
        }
      }
    };
    handleHashSession();

    const initUser = async () => {
      try {
        // A stale access token is refreshed and replayed inside api.me().
        const data = await api.me();
        setUser(mapUser(data));
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initUser();

    // Load the phone-verification switch (non-blocking; defaults off on failure).
    api
      .authConfig()
      .then((c) => setPhoneVerificationEnabled(!!c.phone_verification_enabled))
      .catch(() => {});
  }, []);

  const checkEmail = async (email: string) => {
    const res = await api.checkEmail(email);
    return res.exists;
  };

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    const mapped = mapUser(data);
    setUser(mapped);
    return mapped;
  };

  const requestSignupOtp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string
  ) => {
    await api.requestSignupOtp({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
    });
  };

  const resendSignupOtp = async (email: string) => {
    await api.resendSignupOtp(email);
  };

  const verifySignup = async (email: string, token: string, phoneVerificationToken: string) => {
    const data = await api.verifySignup({ email, token, phone_verification_token: phoneVerificationToken });
    setUser(mapUser(data));
  };

  const sendPhoneOtp = async (phone: string) => {
    const res = await api.phoneSendOtp(phone);
    return res.phone; // normalized E.164
  };

  const verifyPhoneOtp = async (phone: string, code: string) => {
    const res = await api.phoneVerifyOtp(phone, code);
    return res.phone_verification_token;
  };

  const startGoogleLogin = async () => {
    await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl()}/auth/callback`,
      },
    });
  };

  const exchangeFromSupabase = async (session: SupabaseSessionLike, phoneVerificationToken?: string) => {
    // New users (no profile yet) get a 428 PHONE_VERIFICATION_REQUIRED here until they
    // pass a phoneVerificationToken; existing users exchange normally without one.
    const meta = session.user?.user_metadata;
    const data = await api.exchange({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      provider: session.user?.app_metadata?.provider || "google",
      email: session.user?.email ?? "",
      first_name: meta?.first_name ?? meta?.full_name?.split(" ")[0],
      last_name: meta?.last_name ?? meta?.full_name?.split(" ").slice(1).join(" "),
      phone_number: meta?.phone_number,
      phone_verification_token: phoneVerificationToken,
    });
    setUser(mapUser(data));
  };

  const logout = async () => {
    loggingOutRef.current = true;
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear user state and Supabase session regardless of API call result
      setUser(null);
      try {
        await getSupabase().auth.signOut();
      } catch {
        // Supabase not configured or already signed out — nothing to clear.
      }
      // Full page load (not router.push) on purpose: drops every bit of in-memory
      // state from the signed-in session, same as the old app.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/";
    }
  };

  const forgotPassword = async (email: string) => {
    await api.forgotPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    await api.updatePassword(newPassword);
  };

  const value: AuthContextValue = {
    user,
    loading,
    phoneVerificationEnabled,
    checkEmail,
    login,
    requestSignupOtp,
    resendSignupOtp,
    verifySignup,
    sendPhoneOtp,
    verifyPhoneOtp,
    startGoogleLogin,
    exchangeFromSupabase,
    logout,
    forgotPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
