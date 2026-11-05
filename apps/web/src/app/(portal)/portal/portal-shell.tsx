"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { authClient } from "../../../lib/auth-client";

export function PortalShell({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  return (
    <>
      <header className="portal-header">
        <Link href="/portal">
          <strong>BookLeaf Portal</strong>
        </Link>
        <nav aria-label="Portal" className="portal-nav">
          <Link href="/portal/books">My books</Link>
          <Link href="/portal/support">Support</Link>
          <Link href="/portal/admin">Admin</Link>
          {session?.user ? (
            <button
              className="portal-button portal-button--plain"
              onClick={() => authClient.signOut()}
              type="button"
            >
              Sign out
            </button>
          ) : (
            <Link href="/sign-in">Sign in</Link>
          )}
        </nav>
      </header>
      {children}
    </>
  );
}
