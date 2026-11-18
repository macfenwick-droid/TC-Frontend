import { toast as sonner } from "sonner";

/**
 * Same call shape the old app used (`toast({ title, description, variant })`),
 * rendered with sonner. Keeps ported messages identical.
 */
export type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function toast({ title, description, variant = "default" }: ToastOptions) {
  const message = title ?? description ?? "";
  const opts = title && description ? { description } : undefined;
  return variant === "destructive" ? sonner.error(message, opts) : sonner(message, opts);
}
