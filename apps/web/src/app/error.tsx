"use client";

export default function GlobalError({
  error: _error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center p-6">
        <main className="max-w-md rounded-xl border border-(--border) bg-popover p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-(--muted)">
            The application could not complete that request.
          </p>
          <button
            type="button"
            className="mt-5 rounded-md bg-primary px-4 py-2 font-medium text-white"
            onClick={reset}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
