"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "../lib/auth-client";

export function PortalGuard({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const needsAdmin = pathname.startsWith("/portal/admin");
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (needsAdmin && !isAdmin) {
      router.replace("/portal");
      return;
    }
    if (isAdmin && !needsAdmin) router.replace("/portal/admin");
  }, [isAdmin, isPending, needsAdmin, pathname, router, session?.user]);

  if (
    isPending ||
    !session?.user ||
    (needsAdmin && !isAdmin) ||
    (isAdmin && !needsAdmin)
  ) {
    return (
      <main className="portal-checking" aria-busy="true">
        <section
          className="portal-checking-card"
          role="status"
          aria-live="polite"
        >
          <span className="portal-checking-indicator" aria-hidden="true">
            <span />
          </span>
          <p className="portal-muted">BookLeaf Author Portal</p>
          <h1>Checking your account</h1>
          <p className="portal-checking-message">
            Please wait while we securely verify your session.
          </p>
        </section>
      </main>
    );
  }

  return children;
}
