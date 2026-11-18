"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, HelpCircle, Mail, Phone, Settings, ShoppingBag } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

// Same items as the current site's dashboard sidebar.
const items = [
  { name: "Active Sales", href: "/active-sales", icon: Activity },
  { name: "My Sales", href: "/sales", icon: ShoppingBag },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
];

/** Dark sidebar on desktop (design's portal), horizontal pill tabs on phones. */
export function PortalNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Phone: scrollable tabs */}
      <nav aria-label="Dashboard" className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden">
        <ul className="flex w-max gap-2">
          {items.map(({ name, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold whitespace-nowrap transition-colors",
                    active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-mint"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop: sidebar */}
      <aside className="hidden flex-col gap-4 lg:sticky lg:top-24 lg:flex">
        <nav aria-label="Dashboard" className="rounded-[28px] bg-ink p-4 text-white">
          <p className="px-3 pt-2 pb-4 text-xs font-bold tracking-[0.14em] text-on-dark-muted uppercase">Dashboard</p>
          <ul className="flex flex-col gap-1">
            {items.map(({ name, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-2xl px-3 font-semibold transition-colors",
                      active ? "bg-brand text-ink" : "text-on-dark-muted hover:bg-ink-2 hover:text-white"
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-2 rounded-[28px] bg-mint p-5 text-[15px]">
          <p className="font-bold">Contact</p>
          <a href={siteConfig.contact.phoneHref} className="inline-flex items-center gap-2 font-semibold text-link hover:underline">
            <Phone className="size-4" aria-hidden="true" />
            {siteConfig.contact.phone}
          </a>
          <a
            href={`mailto:${siteConfig.contact.generalEmail}`}
            className="inline-flex items-center gap-2 font-semibold break-all text-link hover:underline"
          >
            <Mail className="size-4 shrink-0" aria-hidden="true" />
            {siteConfig.contact.generalEmail}
          </a>
        </div>
      </aside>
    </>
  );
}
