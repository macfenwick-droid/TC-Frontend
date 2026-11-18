import type { ReactNode } from "react";
import { Eyebrow } from "@/components/brand/eyebrow";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: ReactNode;
  eyebrowTone?: "mint" | "butter" | "peach" | "lilac" | "sky" | "dark";
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** Heading level. Pages have one h1 in the hero, sections use h2. */
  as?: "h1" | "h2";
  tone?: "light" | "dark";
  className?: string;
};

/** Eyebrow pill + big Bricolage heading + optional lead paragraph, as in the design's sections. */
export function SectionHeading({
  eyebrow,
  eyebrowTone = "mint",
  title,
  description,
  align = "left",
  as: Heading = "h2",
  tone = "light",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className
      )}
    >
      {eyebrow && <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>}
      <Heading
        className={cn(
          "leading-[1.02] font-extrabold text-balance",
          Heading === "h1" ? "text-5xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl"
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-lg leading-relaxed",
            tone === "light" ? "text-muted-foreground" : "text-on-dark-muted"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
