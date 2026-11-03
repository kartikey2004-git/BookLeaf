import type { ReactNode } from "react";
import { Activity } from "lucide-react";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-(--border) bg-(--surface)">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-4">
          <Activity
            aria-hidden="true"
            className="h-5 w-5 text-(--accent)"
          />
          <span className="font-semibold tracking-tight">
            Application Foundation
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6">{children}</main>
    </div>
  );
}
