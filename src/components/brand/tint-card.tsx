import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const tintClasses = {
  white: "bg-white border border-line",
  mint: "bg-mint",
  peach: "bg-peach",
  butter: "bg-butter",
  lilac: "bg-lilac",
  sky: "bg-sky",
  ink: "bg-ink text-white",
} as const;

export type Tint = keyof typeof tintClasses;

/** Rounded card in one of the design's pastel tints. `lift` adds the hover raise. */
export function TintCard({
  tint = "white",
  lift = false,
  className,
  ...props
}: ComponentProps<"div"> & { tint?: Tint; lift?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[28px] p-6 sm:p-7",
        tintClasses[tint],
        lift &&
          "transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_40px_-24px_rgba(22,19,31,0.35)]",
        className
      )}
      {...props}
    />
  );
}
