import { Star } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Link to our Trustpilot page with the current score (D1: only this badge shows 4.5). */
export function TrustpilotBadge({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const { url, rating } = siteConfig.trustpilot;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Rated ${rating} out of 5 on Trustpilot (opens in a new tab)`}
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold transition-colors",
        tone === "light"
          ? "border border-line bg-white text-ink hover:bg-mint"
          : "border border-ink-2 text-white hover:border-brand",
        className
      )}
    >
      <Star className="size-4 fill-brand text-brand" aria-hidden="true" />
      <span>{rating}</span>
      <span className={tone === "light" ? "text-muted-foreground" : "text-on-dark-muted"}>on Trustpilot</span>
    </a>
  );
}
