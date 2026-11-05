"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { meta, navigation } from "../_content/landing-content";
import { HashLink } from "./hash-link";

export function AnnouncementBar() {
  return (
    <div className="relative z-10 bg-[#121212] px-4 py-2.5 text-center">
      <Link
        href="/portal"
        className="group inline-flex items-center gap-2 text-sm text-white md:text-base"
      >
        <span className="lp-link">
          Follow your books, royalty information, and support requests in one
          clear Author Portal.
        </span>
        <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  const badgeClass = inverted ? "text-white/60" : "text-[#6F6E6A]";
  return (
    <span className="flex flex-col leading-none">
      <span className="flex items-center gap-1.5 text-[22px] font-normal tracking-[-0.8px]">
        {navigation.logo.text}
      </span>
      <span
        className={`mt-1 text-[10px] uppercase tracking-[0.14em] ${badgeClass}`}
      >
        {meta.badge}
      </span>
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuId = useId();
  const accountMenuId = useId();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const { data: session } = authClient.useSession();
  const userName = session?.user.name ?? session?.user.email ?? "Account";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setAccountOpen(false);
    await authClient.signOut();
    window.location.assign("/sign-in");
  };

  useEffect(() => {
    if (!accountOpen) return;

    const closeOnPointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("mousedown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (!open) return;
    mobileMenuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [open]);

  return (
    <header
      data-site-header=""
      className="sticky top-0 z-50 border-b border-[#D3D2CD] bg-[#F5F4F0]"
    >
      <div className="relative mx-auto flex h-16 max-w-360 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <HashLink
            href="#top"
            aria-label={`${navigation.logo.text} home`}
            className="text-[#121212]"
          >
            <Logo />
          </HashLink>
          <nav
            aria-label="Primary"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex"
          >
            {navigation.links.map((link: { href: string; label: string }) => (
              <HashLink
                key={link.href}
                href={link.href}
                className="px-3.5 py-5.25 text-sm font-medium text-[#121212] transition-colors hover:text-[#6F6E6A]"
              >
                {link.label}
              </HashLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                aria-label={navigation.account.menuLabel}
                aria-expanded={accountOpen}
                aria-controls={accountMenuId}
                className="flex h-10 items-center gap-2 rounded-full border border-[#D3D2CD] bg-white py-1 pl-1 pr-3 text-sm font-medium text-[#121212] transition-colors hover:border-[#8A8985]"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[#121212] text-xs font-semibold text-white">
                  {userInitial}
                </span>
                <span className="hidden max-w-28 truncate sm:block">
                  {userName}
                </span>
                <ChevronDown
                  className={`size-3.5 transition-transform ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>
              {accountOpen ? (
                <div
                  id={accountMenuId}
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-lg border border-[#D3D2CD] bg-white p-1.5 shadow-[0_16px_40px_rgba(18,18,18,0.15)]"
                >
                  <div className="border-b border-[#E4E3DE] px-3 py-2.5">
                    <p className="text-xs text-[#6F6E6A]">
                      {navigation.account.signedIn}
                    </p>
                    <p className="truncate text-sm font-medium text-[#121212]">
                      {userName}
                    </p>
                  </div>
                  <Link
                    href="/portal"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#121212] transition-colors hover:bg-[#F5F4F0]"
                  >
                    <UserRound className="size-4" />
                    {navigation.account.portal}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#A33A32] transition-colors hover:bg-[#FDF0EF]"
                  >
                    <LogOut className="size-4" />
                    {navigation.account.signOut}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#121212] px-3 text-xs font-medium text-white! transition-colors hover:bg-[#2B2B2B] sm:gap-2 sm:px-4 sm:text-sm"
            >
              {navigation.account.getStarted}
              <ArrowRight className="hidden size-4 sm:block" />
            </Link>
          )}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex size-10 items-center justify-center rounded-md border border-[#D3D2CD] lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={menuId}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <div
          id={menuId}
          className="lp-fade border-t border-[#D3D2CD] lg:hidden"
        >
          <nav
            ref={mobileMenuRef}
            aria-label="Mobile"
            className="flex flex-col px-4 py-3"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
                menuButtonRef.current?.focus();
              }
            }}
          >
            {navigation.links.map((link: { href: string; label: string }) => (
              <HashLink
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-[#E4E3DE] py-3 text-base text-[#121212]"
              >
                {link.label}
              </HashLink>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
