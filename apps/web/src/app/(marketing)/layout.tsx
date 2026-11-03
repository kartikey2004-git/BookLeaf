import type { ReactNode } from "react";
import "./_components/landing.css";

export default function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="overflow-x-hidden bg-white text-(--foreground)">
      {children}
    </div>
  );
}
