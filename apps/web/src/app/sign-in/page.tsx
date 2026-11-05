"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import { signInErrorMessage } from "../../lib/api-client";

function SignInContent() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const destination = next?.startsWith("/portal") ? next : "/portal";

  useEffect(() => {
    if (!isPending && session?.user) router.replace(destination);
  }, [destination, isPending, router, session?.user]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const result = await authClient.signIn.email({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });

      if (result.error) {
        setError(signInErrorMessage(result.error.message));
        return;
      }

      router.replace(destination);
    } catch {
      setError(
        "Could not reach the sign-in service. Check that the API is running.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="sign-in-main">
      <section className="sign-in-panel" aria-labelledby="sign-in-title">
        <aside
          className="sign-in-product"
          aria-label="BookLeaf Author Portal preview"
        >
          <p className="sign-in-kicker">BookLeaf Author Portal</p>
          <h2>
            <span>Your publishing</span>
            <span>desk, in one</span>
            <span>place.</span>
          </h2>
          <p>
            Follow every book, royalty update, and support conversation from a
            single calm workspace.
          </p>
          <div className="sign-in-product-card">
            <div className="sign-in-product-book">
              <span>MY BOOK</span>
              <strong>
                Stories
                <br />
                that stay.
              </strong>
            </div>
            <div className="sign-in-product-copy">
              <span>Publishing status</span>
              <strong>Published &amp; live</strong>
              <span>Support requests</span>
              <strong>All up to date</strong>
            </div>
          </div>
          <Link className="sign-in-back" href="/">
            Back to BookLeaf
          </Link>
        </aside>
        <div className="sign-in-login">
          <div className="sign-in-copy">
            <p className="sign-in-kicker">Account access</p>
            <h1 id="sign-in-title">Login to your account</h1>
            <p>Enter your email below to login to your account</p>
          </div>
          {error ? (
            <p className="sign-in-error" role="alert">
              {error}
            </p>
          ) : null}
          <form className="sign-in-form" onSubmit={signIn}>
            <label>
              Email
              <input
                name="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            <button className="sign-in-submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main id="main-content" tabIndex={-1} className="sign-in-main">
          Loading sign-in…
        </main>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
