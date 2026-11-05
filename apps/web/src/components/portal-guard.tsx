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

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (needsAdmin && role !== "ADMIN") router.replace("/portal");
  }, [isPending, needsAdmin, pathname, role, router, session?.user]);

  if (isPending || !session?.user || (needsAdmin && role !== "ADMIN")) {
    return (
      <main className="portal-main">
        <p>Checking your account…</p>
      </main>
    );
  }

  return children;
}
