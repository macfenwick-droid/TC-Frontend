"use client";

import { useState, type FormEvent } from "react";
import { fieldClass, FieldLabel } from "@/components/brand/field";
import { useAuth } from "@/hooks/useAuth";
import { isLikelyUsCaPhone } from "@/lib/phone";
import { toast } from "@/lib/toast";
import { AuthHeading, CodeInput, LinkButton, PHONE_CODE_LENGTH, SubmitButton, errorMessage } from "./auth-ui";

type PhoneVerifyStepProps = {
  /** Pre-fills the phone field (e.g. from the signup form). */
  initialPhone?: string;
  title?: string;
  description?: string;
  /** Called with the proof token (and normalized phone) once verified. */
  onVerified: (phoneVerificationToken: string, phone: string) => void;
  /** Optional "back" affordance. */
  onCancel?: () => void;
};

/**
 * "Verify your phone" step: sends an SMS code (US/Canada only) and checks it, returning a
 * short-lived proof token. Used by the sign-up modal, the /auth page and the Google callback.
 * Same copy and behaviour as the current site.
 */
export function PhoneVerifyStep({
  initialPhone = "",
  title = "Verify your phone",
  description = "We'll text you a code. US and Canada numbers only.",
  onVerified,
  onCancel,
}: PhoneVerifyStepProps) {
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [phone, setPhone] = useState(initialPhone);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!isLikelyUsCaPhone(phone)) {
      toast({ title: "Enter a valid US or Canada phone number", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const normalized = await sendPhoneOtp(phone);
      setSentTo(normalized);
      setPhone(normalized);
      setCode("");
      toast({ title: "Code sent", description: `We texted a code to ${normalized}.` });
    } catch (error) {
      toast({ title: "Could not send code", description: errorMessage(error, "Please try again."), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (code.length < 4) {
      toast({ title: `Enter the ${PHONE_CODE_LENGTH}-digit code`, variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const token = await verifyPhoneOtp(sentTo || phone, code);
      onVerified(token, sentTo || phone);
    } catch (error) {
      toast({
        title: "Verification failed",
        description: errorMessage(error, "That code is invalid or expired."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void (sentTo ? verify() : send());
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <AuthHeading title={title}>{description}</AuthHeading>

      {!sentTo ? (
        <>
          <div>
            <FieldLabel htmlFor="phone-verify">Phone number</FieldLabel>
            <input
              id="phone-verify"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+1 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
              autoFocus
            />
          </div>
          <SubmitButton loading={loading}>{loading ? "Sending…" : "Send code"}</SubmitButton>
          {onCancel && (
            <LinkButton onClick={onCancel} disabled={loading} className="text-center text-muted-foreground">
              Back
            </LinkButton>
          )}
        </>
      ) : (
        <>
          <div>
            <FieldLabel htmlFor="phone-code">Verification code</FieldLabel>
            <CodeInput id="phone-code" length={PHONE_CODE_LENGTH} value={code} onChange={setCode} />
            <p className="mt-2 text-sm text-muted-foreground">Code sent to {sentTo}</p>
          </div>
          <SubmitButton loading={loading}>{loading ? "Verifying…" : "Verify phone"}</SubmitButton>
          <div className="flex justify-center gap-3 text-sm">
            <LinkButton onClick={send} disabled={loading}>
              Resend code
            </LinkButton>
            <span className="text-subtle" aria-hidden="true">|</span>
            <LinkButton
              onClick={() => {
                setSentTo(null);
                setCode("");
              }}
              disabled={loading}
            >
              Change number
            </LinkButton>
          </div>
        </>
      )}
    </form>
  );
}
