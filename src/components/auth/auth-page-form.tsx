"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fieldClass, FieldLabel } from "@/components/brand/field";
import { useAuth } from "@/hooks/useAuth";
import { isLikelyUsCaPhone } from "@/lib/phone";
import { safeRedirect } from "@/lib/safe-redirect";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { SignupFields } from "./auth-modal";
import {
  AuthHeading,
  CodeInput,
  EMAIL_OTP_LENGTH,
  GoogleButton,
  LinkButton,
  OrDivider,
  PasswordInput,
  SubmitButton,
  errorMessage,
} from "./auth-ui";
import { PhoneVerifyStep } from "./phone-verify-step";

/**
 * /auth — port of the current site's Auth page (log in / sign up tabs, phone verify,
 * email code). After success it goes to `?redirect=` (same-site paths only), else home.
 */
export function AuthPageForm() {
  const router = useRouter();
  // Read `?redirect=` only when leaving, so the form needs no Suspense fallback (no layout shift).
  const goToDestination = () => router.replace(safeRedirect(new URLSearchParams(window.location.search).get("redirect")));
  const { login, checkEmail, requestSignupOtp, resendSignupOtp, verifySignup, startGoogleLogin, phoneVerificationEnabled } =
    useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneToken, setPhoneToken] = useState("");
  const [phoneStep, setPhoneStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setMode = (login: boolean) => {
    setIsLogin(login);
    setOtpSent(false);
    setOtp("");
    setPhoneStep(false);
    setPhoneToken("");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast({ title: "Logged in successfully" });
      goToDestination();
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: errorMessage(error, "Please check your details and try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign up, step 1: validate, make sure the email is free (before any SMS), then verify phone.
  const handleSignupStart = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || (phoneVerificationEnabled && !phone)) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (phoneVerificationEnabled && !isLikelyUsCaPhone(phone)) {
      toast({ title: "Enter a valid US or Canada phone number", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      if (await checkEmail(email)) {
        toast({ title: "Email already registered", description: "Please log in instead.", variant: "destructive" });
        setIsLogin(true);
        return;
      }
      if (phoneVerificationEnabled) {
        setPhoneStep(true);
      } else {
        await requestSignupOtp(email, password, firstName, lastName, phone);
        setOtpSent(true);
        toast({
          title: "Verification code sent",
          description: `Enter the ${EMAIL_OTP_LENGTH}-digit code we emailed to ${email}.`,
        });
      }
    } catch (error) {
      toast({ title: "Could not continue", description: errorMessage(error, "Please try again."), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign up, step 2: phone verified — email the sign-up code.
  const handlePhoneVerified = async (token: string) => {
    setPhoneToken(token);
    setIsSubmitting(true);
    try {
      await requestSignupOtp(email, password, firstName, lastName, phone);
      setPhoneStep(false);
      setOtpSent(true);
      toast({
        title: "Verification code sent",
        description: `Enter the ${EMAIL_OTP_LENGTH}-digit code we emailed to ${email}.`,
      });
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: errorMessage(error, "Please check your details and try again."),
        variant: "destructive",
      });
      setPhoneStep(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign up, step 3: email code entered — finish with the phone proof token.
  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsSubmitting(true);
    try {
      await verifySignup(email, otp, phoneToken);
      toast({ title: "Signed up successfully" });
      goToDestination();
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: errorMessage(error, "Please check your details and try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendSignupOtp(email);
      toast({ title: "Code resent", description: `A new code is on its way to ${email}.` });
    } catch (error) {
      toast({ title: "Could not resend code", description: errorMessage(error, "Try again in a moment."), variant: "destructive" });
    }
  };

  if (!isLogin && phoneStep) {
    return (
      <PhoneVerifyStep
        initialPhone={phone}
        description="We'll text a code to finish creating your account. US & Canada only."
        onVerified={(token) => void handlePhoneVerified(token)}
        onCancel={() => setPhoneStep(false)}
      />
    );
  }

  const google = () => void startGoogleLogin();

  return (
    <div className="flex flex-col gap-6">
      {!otpSent && (
        <div role="tablist" aria-label="Account" className="grid grid-cols-2 rounded-full border border-line bg-white p-1">
          {[
            { label: "Log In", login: true },
            { label: "Sign Up", login: false },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={isLogin === t.login}
              onClick={() => setMode(t.login)}
              className={cn(
                "min-h-[46px] rounded-full font-bold transition-colors",
                isLogin === t.login ? "bg-ink text-white" : "text-muted-foreground hover:text-ink"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <AuthHeading as="h1" title={isLogin ? "Welcome Back" : otpSent ? "Verify your email" : "Create an Account"}>
        {isLogin
          ? "Enter your details to log in to your account"
          : otpSent
            ? `Enter the ${EMAIL_OTP_LENGTH}-digit code we emailed to ${email}`
            : "Sign up to start selling your tickets"}
      </AuthHeading>

      {isLogin ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
          </div>
          <SubmitButton loading={isSubmitting}>{isSubmitting ? "Please wait..." : "Log In"}</SubmitButton>
        </form>
      ) : otpSent ? (
        <form onSubmit={handleVerify} className="flex flex-col gap-4" noValidate>
          <div>
            <FieldLabel htmlFor="otp">Verification code</FieldLabel>
            <CodeInput id="otp" length={EMAIL_OTP_LENGTH} value={otp} onChange={setOtp} />
            <LinkButton onClick={handleResend} className="mt-2 text-sm">
              Resend code
            </LinkButton>
          </div>
          <SubmitButton loading={isSubmitting}>{isSubmitting ? "Please wait..." : "Verify & Sign Up"}</SubmitButton>
        </form>
      ) : (
        <SignupFields
          firstName={firstName}
          lastName={lastName}
          phone={phone}
          email={email}
          password={password}
          onFirstName={setFirstName}
          onLastName={setLastName}
          onPhone={setPhone}
          onEmail={setEmail}
          onPassword={setPassword}
          phoneRequired={phoneVerificationEnabled}
          onSubmit={handleSignupStart}
          emailPlaceholder="john@example.com"
        >
          <SubmitButton loading={isSubmitting}>{isSubmitting ? "Please wait..." : "Sign Up"}</SubmitButton>
        </SignupFields>
      )}

      <OrDivider />
      <GoogleButton onClick={google} disabled={isSubmitting} />

      <p className="text-center text-sm">
        <span className="text-muted-foreground">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>{" "}
        <LinkButton onClick={() => setMode(!isLogin)}>{isLogin ? "Sign up" : "Log in"}</LinkButton>
      </p>
    </div>
  );
}
