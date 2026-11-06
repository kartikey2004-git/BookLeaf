"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../../lib/auth-client";
import { userFacingErrorMessage } from "../../../lib/api-client";
import { usePortalToast } from "./portal-toast";

export function PortalShell({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuId = useId();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notify } = usePortalToast();
  const user = session?.user;
  const isAdmin = (user as { role?: string } | undefined)?.role === "ADMIN";
  const userName = user?.name || user?.email || "Account";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!accountOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountOpen]);

  async function signOut() {
    try {
      const result = await authClient.signOut();
      if (result.error) {
        notify("error", "Could not sign out right now. Please try again.");
        return;
      }
      router.replace("/sign-in");
    } catch (cause) {
      notify(
        "error",
        userFacingErrorMessage(cause, "Could not sign out right now."),
      );
    }
  }

  return (
    <>
      <header className="portal-header">
        <Link href="/portal">
          <strong>BookLeaf Portal</strong>
        </Link>
        <nav aria-label="Portal" className="portal-nav">
          {isAdmin ? (
            <Link href="/portal/admin">Admin</Link>
          ) : (
            <Link href="/portal/books">My books</Link>
          )}
          {user ? (
            <div className="portal-account" ref={accountMenuRef}>
              <button
                className="portal-account-trigger"
                type="button"
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                aria-controls={accountMenuId}
                onClick={() => setAccountOpen((open) => !open)}
              >
                <span className="portal-account-avatar" aria-hidden="true">
                  {userInitial}
                </span>
                <span className="portal-account-trigger-name">{userName}</span>
                <ChevronDown
                  className={
                    accountOpen
                      ? "portal-account-chevron is-open"
                      : "portal-account-chevron"
                  }
                  aria-hidden="true"
                />
              </button>
              {accountOpen ? (
                <div className="portal-account-menu" id={accountMenuId}>
                  <div className="portal-account-details">
                    <span className="portal-account-details-label">
                      Signed in
                    </span>
                    <div className="portal-account-identity">
                      <strong>{userName}</strong>
                      <span>{user.email}</span>
                      <span className="portal-account-role">
                        {isAdmin ? "Administrator" : "Author"}
                      </span>
                    </div>
                  </div>
                  <Link
                    className="portal-account-link"
                    href={isAdmin ? "/portal/admin" : "/portal"}
                    onClick={() => setAccountOpen(false)}
                  >
                    <UserRound aria-hidden="true" />
                    {isAdmin ? "Admin dashboard" : "Author dashboard"}
                  </Link>
                  <button
                    className="portal-account-logout"
                    type="button"
                    onClick={() => void signOut()}
                  >
                    <LogOut aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/sign-in">Sign in</Link>
          )}
        </nav>
      </header>
      {children}
    </>
  );
}
