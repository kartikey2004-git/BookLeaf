import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto grid min-h-screen max-w-6xl place-items-center px-6 py-16"
    >
      <section className="max-w-md text-center">
        <p className="text-sm font-medium text-(--accent)">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-(--muted)">
          The requested page does not exist in this application.
        </p>
        <Link
          className="mt-6 inline-block rounded-md border border-(--border) px-4 py-2 font-medium"
          href="/"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
