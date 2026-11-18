import { isSessionExpired, type AuthUser } from "@/lib/api";
import { googleAds, setUserData } from "@/lib/gtag";
import { tiktok } from "@/lib/tiktok";
import { toast } from "@/lib/toast";

/** Conversion tracking after a successful submission (same events as the current site). */
export function trackSubmitted(user: AuthUser | null, content: { id: string; name: string; quantity: number | "" }) {
  // Enhanced conversions: send the signed-in seller's data with the conversion.
  if (user) setUserData(user);
  googleAds.ticketSubmitted();
  // TikTok attributes this back to a TikTok ad click on its own.
  tiktok.track("SubmitForm", {
    contents: [{ content_id: content.id, content_name: content.name, quantity: content.quantity }],
    content_type: "product",
  });
}

/**
 * Error handling shared by both sell forms. Returns "reauth" when the session expired
 * and the caller should reopen sign-in and resubmit afterwards.
 */
export function handleSubmitError(error: unknown, what: "tickets" | "season tickets"): "reauth" | "failed" {
  console.error(`Error submitting ${what}:`, error);
  if (isSessionExpired(error)) {
    toast({
      title: "Please sign in again",
      description: `Your session expired. Sign in and we'll submit your ${what} right away — nothing is lost.`,
    });
    return "reauth";
  }
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const isBlocked = message.includes("restricted") || message.includes("blocked");
  toast({
    title: isBlocked ? "Account Restricted" : "Submission Failed",
    description: isBlocked
      ? "Your account has been restricted due to suspicious listing activity. Please contact support if you believe this is a mistake."
      : "There was an error. Please try again.",
    variant: "destructive",
  });
  return "failed";
}
