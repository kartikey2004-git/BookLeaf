import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-6xl px-6 py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-6 h-12 max-w-xl" />
      <span className="sr-only">Loading application</span>
    </main>
  );
}
