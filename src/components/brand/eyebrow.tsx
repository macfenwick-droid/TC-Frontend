import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const tones = {
  mint: "bg-mint text-link",
  butter: "bg-butter text-amber-fg",
  peach: "bg-peach text-ink",
  lilac: "bg-lilac text-ink",
  sky: "bg-sky text-blue-fg",
  dark: "bg-ink-2 text-brand",
} as const;

/** Small uppercase pill label above section headings. */
export function Eyebrow({
  tone = "mint",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-[0.08em] uppercase",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
