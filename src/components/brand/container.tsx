import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Page-width wrapper used by every section (design max width 1240px, 16/24px gutters). */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1240px] px-4 sm:px-6", className)} {...props} />;
}
