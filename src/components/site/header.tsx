"use client";

import { Suspense, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogOut, Menu, Tag, UserRound } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import { Cta } from "@/components/brand/cta";
import { Container } from "@/components/brand/container";
import { Logo } from "@/components/brand/logo";
import { Avatar, UserMenu, displayName } from "@/components/site/user-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { accountNav, activeSalesLink, mainNav, type NavLink } from "@/config/nav";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type NavItemProps = { link: NavLink; className: (active: boolean) => string };

function PlainNavItem({ link, active, className }: NavItemProps & { active: boolean }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className(false)}>
        {link.label}
        <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={link.href} aria-current={active ? "page" : undefined} className={className(active)}>
      {link.label}
    </Link>
  );
}

function ActiveNavItem(props: NavItemProps) {
  const pathname = usePathname();
  return <PlainNavItem {...props} active={pathname === props.link.href} />;
}

/**
 * Nav link with "current page" styling. Only this leaf reads the pathname, inside Suspense,
 * so pages with dynamic URLs (e.g. /offer/[token]) still prerender the rest of the header.
 */
function NavItem(props: NavItemProps) {
  if (props.link.external) return <PlainNavItem {...props} active={false} />;
  return (
    <Suspense fallback={<PlainNavItem {...props} active={false} />}>
      <ActiveNavItem {...props} />
    </Suspense>
  );
}

export function Header() {
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  // "Sign In" opens the auth modal in place, like the current site.
  const [authOpen, setAuthOpen] = useState(false);

  const closeOnLink = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("a")) setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-[72px]">
        <Logo />

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-5 lg:flex">
          {[activeSalesLink, ...mainNav].map((link) => (
            <NavItem
              key={link.href}
              link={link}
              className={(active) =>
                cn(
                  "inline-flex items-center gap-1 py-2.5 text-[15px] font-medium whitespace-nowrap transition-colors hover:text-link",
                  active ? "font-bold text-link" : "text-ink"
                )
              }
            />
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Cta href="/sell-season-tickets" variant="ghost" size="sm" className="hidden xl:inline-flex">
            <Tag className="size-4" aria-hidden="true" />
            Sell Season Tickets
          </Cta>
          <Cta href="/sell" size="sm" withArrow className="hidden md:inline-flex">
            Sell Tickets
          </Cta>

          {/* Account area (desktop) */}
          <div className="hidden md:block">
            {loading ? (
              <Skeleton className="h-11 w-28 rounded-full" />
            ) : user ? (
              <UserMenu user={user} onLogout={logout} />
            ) : (
              <Cta variant="secondary" size="sm" onClick={() => setAuthOpen(true)}>
                Sign In
              </Cta>
            )}
          </div>

          {/* Mobile: account shortcut + menu */}
          {!loading &&
            (user ? (
              <Link
                href="/active-sales"
                aria-label="My account"
                className="grid size-11 place-items-center rounded-full border border-line bg-white md:hidden"
              >
                <Avatar user={user} className="size-9" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                aria-label="Sign In"
                className="grid size-11 place-items-center rounded-full border border-line bg-white md:hidden"
              >
                <UserRound className="size-5" aria-hidden="true" />
              </button>
            ))}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="grid size-11 place-items-center rounded-full bg-ink text-white outline-none focus-visible:ring-4 focus-visible:ring-brand/40 lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm gap-0 bg-cream p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <div className="border-b border-line px-5 py-4">
                <Logo />
              </div>
              {/* Any link tap closes the sheet (clicks bubble up from the <a>). */}
              <nav
                aria-label="Mobile"
                onClick={closeOnLink}
                className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
              >
                {/* Signed-in users get Active Sales in the account section below. */}
                {(user ? mainNav : [activeSalesLink, ...mainNav]).map((link) => (
                  <NavItem
                    key={link.href}
                    link={link}
                    className={(active) =>
                      cn(
                        "flex min-h-12 items-center gap-1.5 rounded-2xl px-4 text-base font-semibold",
                        active ? "bg-mint text-link" : "hover:bg-white"
                      )
                    }
                  />
                ))}

                {user && (
                  <>
                    <p className="mt-4 px-4 pb-1 text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
                      {displayName(user)}
                    </p>
                    {accountNav.map((link) => (
                      <NavItem
                        key={link.href}
                        link={link}
                        className={(active) =>
                          cn(
                            "flex min-h-12 items-center rounded-2xl px-4 text-base font-semibold",
                            active ? "bg-mint text-link" : "hover:bg-white"
                          )
                        }
                      />
                    ))}
                  </>
                )}
              </nav>
              <div onClick={closeOnLink} className="flex flex-col gap-2.5 border-t border-line p-4">
                <Cta href="/sell" size="lg" withArrow className="w-full justify-between">
                  Sell Tickets
                </Cta>
                <Cta href="/sell-season-tickets" variant="secondary" size="md" className="w-full">
                  <Tag className="size-4" aria-hidden="true" />
                  Sell Season Tickets
                </Cta>
                {!loading &&
                  (user ? (
                    <button
                      type="button"
                      onClick={logout}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-full font-semibold text-destructive hover:bg-white"
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      Log Out
                    </button>
                  ) : (
                    <Cta
                      variant="ghost"
                      size="md"
                      className="w-full"
                      onClick={() => {
                        setMobileOpen(false);
                        setAuthOpen(true);
                      }}
                    >
                      Sign In
                    </Cta>
                  ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
