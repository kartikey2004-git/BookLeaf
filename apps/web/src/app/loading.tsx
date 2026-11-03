export default function Loading() {
  return (
    <main
      className="mx-auto max-w-6xl px-6 py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-5 w-40 animate-pulse rounded bg-(--border)" />
      <div className="mt-6 h-12 max-w-xl animate-pulse rounded bg-(--border)" />
      <span className="sr-only">Loading application</span>
    </main>
  );
}
