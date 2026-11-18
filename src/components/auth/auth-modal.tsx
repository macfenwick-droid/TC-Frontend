"use client";

import { useState, type FormEvent } from "react";
import { fieldClass, FieldLabel } from "@/components/brand/field";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { isLikelyUsCaPhone } from "@/lib/phone";
import { toast } from "@/lib/toast";
import {
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

type AuthModalProps = { open: boolean; onOpenChange: (open: boolean) => void };

/**
 * Sign-in / sign-up modal — same steps, copy and toasts as the current site:
 * email → (log in | sign up) → [phone verify, when enabled] → email code.
 * Used by the header "Sign In" and by the sell forms on submit.
 */
export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-[28px] border-line bg-white p-7 sm:max-w-md sm:p-8">
        {/* Content unmounts when the dialog closes, so every open starts fresh at "email". */}
        <AuthFlow onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

type Step = "email" | "login" | "signup" | "phone" | "otp";

function AuthFlow({ onDone }: { onDone: () => void }) {
  const {
    checkEmail,
    login,
    requestSignupOtp,
    resendSignupOtp,
    verifySignup,
    startGoogleLogin,
    forgotPassword,
    phoneVerificationEnabled,
  } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneToken, setPhoneToken] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const google = () => void startGoogleLogin();

  const handleEmailContinue = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      setStep((await checkEmail(email)) ? "login" : "signup");
    } catch {
      toast({ title: "Error checking email", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      onDone();
      toast({ title: "Logged in" });
    } catch (error) {
      toast({ title: "Login failed", description: errorMessage(error, "Please check your credentials."), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Emails the signup code and moves to the code step. Returns false on failure.
  const sendEmailOtp = async () => {
    try {
      setLoading(true);
      await requestSignupOtp(email, password, firstName, lastName, phone);
      setOtp("");
      setStep("otp");
      toast({ title: "Verification code sent", description: `We emailed a ${EMAIL_OTP_LENGTH}-digit code to ${email}.` });
      return true;
    } catch (error) {
      toast({ title: "Sign up failed", description: errorMessage(error, "Please check your details."), variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // With phone verification on, verify the phone first; otherwise email the code directly.
  const handleStartSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (phoneVerificationEnabled) {
      if (!phone || !isLikelyUsCaPhone(phone)) {
        toast({ title: "Enter a valid US or Canada phone number", variant: "destructive" });
        return;
      }
      setStep("phone");
      return;
    }
    await sendEmailOtp();
  };

  const handlePhoneVerified = async (token: string) => {
    setPhoneToken(token);
    if (!(await sendEmailOtp())) setStep("signup");
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < EMAIL_OTP_LENGTH) {
      toast({ title: `Enter the ${EMAIL_OTP_LENGTH}-digit code`, variant: "destructive" });
      return;
    }
    if (phoneVerificationEnabled && !phoneToken) {
      toast({ title: "Please verify your phone first", variant: "destructive" });
      setStep("phone");
      return;
    }
    try {
      setLoading(true);
      await verifySignup(email, otp, phoneToken);
      onDone();
      toast({ title: "Account created" });
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

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await resendSignupOtp(email);
      toast({ title: "Code resent", description: `A new code is on its way to ${email}.` });
    } catch (error) {
      toast({ title: "Could not resend code", description: errorMessage(error, "Try again in a moment."), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email first", variant: "destructive" });
      return;
    }
    try {
      await forgotPassword(email);
      toast({ title: "Password reset email sent", description: "Check your inbox for reset instructions." });
    } catch (error) {
      toast({
        title: "Could not send reset email",
        description: errorMessage(error, "Try again in a moment."),
        variant: "destructive",
      });
    }
  };

  if (step === "email") {
    return (
      <div className="flex flex-col gap-5">
        <DialogTitle asChild>
          <h2 className="text-[32px] leading-[1.05] font-extrabold">Welcome</h2>
        </DialogTitle>
        <DialogDescription className="-mt-3 text-[15px] text-muted-foreground">
          Sign up or log in with your email or Google.
        </DialogDescription>
        <form onSubmit={handleEmailContinue} className="flex flex-col gap-4" noValidate>
          <div>
            <FieldLabel htmlFor="auth-email">Email</FieldLabel>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              autoFocus
            />
          </div>
          <SubmitButton loading={loading}>{loading ? "Please wait..." : "Continue with email"}</SubmitButton>
        </form>
        <OrDivider />
        <GoogleButton onClick={google} disabled={loading} />
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="flex flex-col gap-5">
        <DialogTitle asChild>
          <h2 className="text-[32px] leading-[1.05] font-extrabold">Welcome back!</h2>
        </DialogTitle>
        <DialogDescription className="-mt-3 text-[15px] text-muted-foreground">
          Not you? <LinkButton onClick={() => setStep("signup")}>Create an account</LinkButton>
        </DialogDescription>
        <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
          <div>
            <FieldLabel htmlFor="login-email">Email</FieldLabel>
            <input id="login-email" type="email" value={email} disabled className={fieldClass} />
          </div>
          <div>
            <FieldLabel htmlFor="login-password">Password</FieldLabel>
            <PasswordInput
              id="login-password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••••••••••"
              autoComplete="current-password"
            />
          </div>
          <SubmitButton loading={loading}>{loading ? "Please wait..." : "Log In"}</SubmitButton>
        </form>
        <OrDivider />
        <GoogleButton onClick={google} disabled={loading} />
        <div className="flex justify-center gap-3 text-sm">
          <LinkButton onClick={handleForgotPassword} className="text-muted-foreground">
            Forgot Password?
          </LinkButton>
          <span className="text-subtle" aria-hidden="true">|</span>
          <LinkButton onClick={() => setStep("signup")}>Create account</LinkButton>
        </div>
      </div>
    );
  }

  if (step === "signup") {
    return (
      <div className="flex flex-col gap-5">
        <DialogTitle asChild>
          <h2 className="text-[32px] leading-[1.05] font-extrabold">Let&apos;s create an account!</h2>
        </DialogTitle>
        <DialogDescription className="-mt-3 text-[15px] text-muted-foreground">
          Already have one? <LinkButton onClick={() => setStep("login")}>Log in</LinkButton>
        </DialogDescription>
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
          onSubmit={handleStartSignup}
        >
          <SubmitButton loading={loading}>{loading ? "Please wait..." : "Create Account"}</SubmitButton>
        </SignupFields>
        <OrDivider />
        <GoogleButton onClick={google} disabled={loading} />
      </div>
    );
  }

  if (step === "phone") {
    return (
      <>
        <DialogTitle className="sr-only">Verify your phone</DialogTitle>
        <DialogDescription className="sr-only">Enter the code we text you to continue.</DialogDescription>
        <PhoneVerifyStep
          initialPhone={phone}
          description="We'll text a code to finish creating your account. US & Canada only."
          onVerified={(token) => void handlePhoneVerified(token)}
          onCancel={() => setStep("signup")}
        />
      </>
    );
  }

  // step === "otp"
  return (
    <div className="flex flex-col gap-5">
      <DialogTitle asChild>
        <h2 className="text-[32px] leading-[1.05] font-extrabold">Verify your email</h2>
      </DialogTitle>
      <DialogDescription className="-mt-3 text-[15px] text-muted-foreground">
        Enter the {EMAIL_OTP_LENGTH}-digit code we sent to <span className="font-semibold text-ink">{email}</span>.
      </DialogDescription>
      <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4" noValidate>
        <div>
          <FieldLabel htmlFor="otp">Verification code</FieldLabel>
          <CodeInput id="otp" length={EMAIL_OTP_LENGTH} value={otp} onChange={setOtp} />
        </div>
        <SubmitButton loading={loading}>{loading ? "Please wait..." : "Verify & Create Account"}</SubmitButton>
      </form>
      <div className="flex justify-center gap-3 text-sm">
        <LinkButton onClick={handleResendOtp} disabled={loading} className="text-muted-foreground">
          Resend code
        </LinkButton>
        <span className="text-subtle" aria-hidden="true">|</span>
        <LinkButton onClick={() => setStep("signup")} disabled={loading}>
          Change details
        </LinkButton>
      </div>
    </div>
  );
}

/** Sign-up fields shared by the modal and the /auth page. */
export function SignupFields({
  firstName,
  lastName,
  phone,
  email,
  password,
  onFirstName,
  onLastName,
  onPhone,
  onEmail,
  onPassword,
  phoneRequired,
  onSubmit,
  emailPlaceholder = "Enter your email...",
  children,
}: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  onFirstName: (v: string) => void;
  onLastName: (v: string) => void;
  onPhone: (v: string) => void;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  phoneRequired: boolean;
  onSubmit: (e: FormEvent) => void;
  emailPlaceholder?: string;
  children: React.ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="firstName">First Name</FieldLabel>
          <input
            id="firstName"
            autoComplete="given-name"
            placeholder="John"
            value={firstName}
            onChange={(e) => onFirstName(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
          <input
            id="lastName"
            autoComplete="family-name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => onLastName(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="phone">Phone Number{phoneRequired ? "" : " (optional)"}</FieldLabel>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+1 555 123 4567"
          value={phone}
          onChange={(e) => onPhone(e.target.value)}
          className={fieldClass}
        />
        {phoneRequired && <p className="mt-1.5 text-xs text-muted-foreground">US &amp; Canada only. We&apos;ll text you a code to verify.</p>}
      </div>
      <div>
        <FieldLabel htmlFor="signup-email">Email</FieldLabel>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder={emailPlaceholder}
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          className={fieldClass}
        />
      </div>
      <div>
        <FieldLabel htmlFor="signup-password">Password</FieldLabel>
        <PasswordInput
          id="signup-password"
          value={password}
          onChange={onPassword}
          placeholder="Create a password"
          autoComplete="new-password"
        />
      </div>
      {children}
    </form>
  );
}
