import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

type LogoProps = {
  /** "light" = dark text on cream/white; "dark" = white text on ink (footer). */
  tone?: "light" | "dark";
  /** Render without a link (e.g. inside the footer brand block). */
  asLink?: boolean;
  className?: string;
};

/** TicketCricket mark + wordmark, same lockup as the current site ("Ticket" + "Cricket" + ™). */
export function Logo({ tone = "light", asLink = true, className }: LogoProps) {
  const content = (
    <>
      <Image
        src={siteConfig.logo}
        alt=""
        width={40}
        height={40}
        // Header logo is above the fold; the footer one can load lazily.
        loading={tone === "light" ? "eager" : "lazy"}
        className="size-9 rounded-[10px] sm:size-10"
      />
      <span
        className={cn(
          "inline-flex items-end text-xl font-bold tracking-[-0.02em] sm:text-2xl",
          tone === "light" ? "text-[#1E2433]" : "text-white"
        )}
      >
        Ticket
        <span className={tone === "light" ? "text-[#408C73]" : "text-[#6FCBA8]"}>Cricket</span>
        <span className="mb-px text-[0.4em] leading-none font-semibold">™</span>
      </span>
    </>
  );

  const classes = cn("flex items-center gap-2.5", className);

  if (!asLink) return <span className={classes}>{content}</span>;

  return (
    <Link href="/" aria-label={`${siteConfig.name} home`} className={classes}>
      {content}
    </Link>
  );
}
