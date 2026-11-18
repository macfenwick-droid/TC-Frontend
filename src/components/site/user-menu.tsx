"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings, ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { accountNav } from "@/config/nav";
import type { AuthUser } from "@/lib/api";

const icons = {
  "/active-sales": ShoppingBag,
  "/sales": ShoppingBag,
  "/settings": Settings,
} as const;


export const displayName = (user: AuthUser) => user.first_name || user.email;
export const initial = (user: AuthUser) => displayName(user).charAt(0).toUpperCase();

export function Avatar({ user, className = "size-9" }: { user: AuthUser; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-lilac text-sm font-bold text-ink ${className}`}
    >
      {initial(user)}
    </span>
  );
}

/** Signed-in account dropdown: Active Sales, My Sales, Settings, Log Out. */
export function UserMenu({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-white py-1 pr-3 pl-1 font-semibold outline-none hover:bg-cream focus-visible:ring-4 focus-visible:ring-brand/40"
      >
        <Avatar user={user} />
        <span className="max-w-[88px] truncate text-sm lg:hidden xl:inline">{displayName(user)}</span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
        <div className="px-2 py-2.5">
          <p className="truncate text-sm font-semibold">{displayName(user)}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        {accountNav.map((item) => {
          const Icon = icons[item.href as keyof typeof icons] ?? ShoppingBag;
          return (
            <DropdownMenuItem key={item.href} asChild className="cursor-pointer rounded-lg py-2.5">
              <Link href={item.href}>
                <Icon className="text-muted-foreground" aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="cursor-pointer rounded-lg py-2.5" onSelect={onLogout}>
          <LogOut aria-hidden="true" />
          <span className="font-medium">Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
