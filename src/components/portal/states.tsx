import type { LucideIcon } from "lucide-react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground" role="status" aria-live="polite">
      <Loader2 className="size-5 animate-spin text-brand" aria-hidden="true" />
      <span className="font-medium">{label}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[20px] bg-peach p-5 font-medium" role="alert">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
      {message}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[28px] border border-dashed border-line bg-white px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-cream">
        <Icon className="size-7 text-subtle" aria-hidden="true" />
      </span>
      <p className="text-lg font-bold">{title}</p>
      {children && <div className="text-muted-foreground">{children}</div>}
    </div>
  );
}
