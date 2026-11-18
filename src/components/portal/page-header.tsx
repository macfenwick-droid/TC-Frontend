import type { ReactNode } from "react";

/** Big heading + one-line description, with an optional action on the right. */
export function PortalPageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[40px] leading-none font-extrabold sm:text-5xl">{title}</h1>
        <p className="text-[17px] text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
