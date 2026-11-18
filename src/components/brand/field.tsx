import type { ReactNode } from "react";

/** Design's form field look: cream fill, soft border, ink border + mint ring on focus. */
export const fieldClass =
  "mt-2 h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-cream px-4 text-[17px] font-medium text-ink outline-none transition-[border-color,box-shadow] placeholder:font-normal placeholder:text-subtle focus-visible:border-ink focus-visible:ring-4 focus-visible:ring-mint disabled:opacity-60";

export function FieldLabel({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[15px] font-semibold">
      {children}
      {hint && <span className="ml-1.5 text-sm font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}
