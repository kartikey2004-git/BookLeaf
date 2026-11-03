import { AppShell } from "@/components/app-shell";

export default function HomePage() {
  return (
    <AppShell>
      <section
        aria-labelledby="welcome-title"
        className="max-w-2xl py-16 sm:py-24"
      >
        <p className="mb-4 text-sm font-medium tracking-wide text-(--accent) uppercase">
          Application foundation
        </p>
        <h1
          id="welcome-title"
          className="text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          Ready for the next product decision.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-(--muted)">
          This is a deliberately neutral application shell. Product experiences
          belong in focused, validated feature work rather than in the platform
          baseline.
        </p>
      </section>
    </AppShell>
  );
}
