import type { ReactNode } from "react";
import { PortalGuard } from "../../../components/portal-guard";
import { PortalShell } from "./portal-shell";
import { PortalToastProvider } from "./portal-toast";
import "./portal.css";

export default function PortalLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <PortalGuard>
      <div className="portal">
        <PortalToastProvider>
          <PortalShell>{children}</PortalShell>
        </PortalToastProvider>
      </div>
    </PortalGuard>
  );
}
