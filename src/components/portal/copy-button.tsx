"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** Copies `value`; shows "Copied!" for 2s (current site's copy-email button). */
export function CopyButton({ value, label, className }: { value: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => setCopied(true));
      }}
      aria-label={label}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-sm font-bold transition-colors hover:bg-mint",
        className
      )}
    >
      {copied ? <Check className="size-4 text-link" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
}
