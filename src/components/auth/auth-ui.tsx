"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ctaVariants } from "@/components/brand/cta";
import { fieldClass } from "@/components/brand/field";
import { cn } from "@/lib/utils";

/** Must match the Supabase "Email OTP Length" setting (Authentication → Sign In / Providers → Email). */
export const EMAIL_OTP_LENGTH = 8;
/** Twilio Verify default. */
export const PHONE_CODE_LENGTH = 6;

/** Google's "G" mark, inline so we don't load a third-party image. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-line bg-white px-5 font-bold transition-colors hover:border-ink disabled:opacity-50"
    >
      <GoogleMark />
      Continue with Google
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs font-bold tracking-wide text-subtle uppercase">
      <span className="h-px flex-1 bg-line" />
      or
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Full-width primary submit button for the auth forms. */
export function SubmitButton({ loading, children, ...props }: ComponentProps<"button"> & { loading?: boolean }) {
  return (
    <button
      {...props}
      type="submit"
      disabled={loading || props.disabled}
      className={cn(ctaVariants({ size: "lg" }), "w-full")}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete: "current-password" | "new-password";
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(fieldClass, "pr-12")}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2 mt-1 grid size-9 -translate-y-1/2 place-items-center rounded-full text-subtle hover:text-ink"
      >
        {show ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
      </button>
    </div>
  );
}

/** Numeric one-time-code input (digits only, fixed length). */
export function CodeInput({
  id,
  length,
  value,
  onChange,
}: {
  id: string;
  length: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      id={id}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={length}
      placeholder={"0".repeat(length)}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
      className={cn(fieldClass, "text-center text-xl tracking-[0.4em]")}
      autoFocus
    />
  );
}

/** Small text-link style button used for "Resend code", "Change details", etc. */
export function LinkButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn("font-semibold text-link underline-offset-4 hover:text-ink hover:underline disabled:opacity-50", className)}
      {...props}
    />
  );
}

export function AuthHeading({ title, children, as: H = "h2" }: { title: string; children?: ReactNode; as?: "h1" | "h2" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <H className="text-[32px] leading-[1.05] font-extrabold sm:text-[38px]">{title}</H>
      {children && <p className="text-[15px] text-muted-foreground">{children}</p>}
    </div>
  );
}

/** Unknown error → message string, falling back to the given default. */
export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;
