"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  apiFetch,
  userFacingErrorMessage,
} from "../../../../../lib/api-client";
import { usePortalToast } from "../../portal-toast";

type Book = {
  title: string;
  isbn: string;
  genre: string;
  publicationDate: string | null;
  status: string;
  mrp: string | null;
  totalCopiesSold: number;
  royaltyPerCopy: string | null;
  totalRoyaltyEarned: string;
  royaltyPaid: string;
  royaltyPending: string;
  platforms: string[];
};

export default function BookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { notify } = usePortalToast();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadFailed(false);
    setBook(null);
    params
      .then(({ bookId }) =>
        apiFetch<{ book: Book }>(`/api/v1/author/books/${bookId}`, {
          signal: controller.signal,
        }),
      )
      .then((response) => {
        if (!controller.signal.aborted) setBook(response.book);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setLoadFailed(true);
          notify(
            "error",
            userFacingErrorMessage(reason, "Could not load this book."),
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt, notify, params]);

  return (
    <main id="main-content" tabIndex={-1} className="portal-main">
      <Link href="/portal/books">My books</Link>
      {loading ? <p role="status">Loading book…</p> : null}
      {loadFailed ? (
        <section className="portal-card portal-empty-state">
          <h2>Book details couldn’t be loaded</h2>
          <p>Try again to refresh this book’s information.</p>
          <button
            className="portal-button"
            onClick={() => setAttempt((current) => current + 1)}
          >
            Try again
          </button>
        </section>
      ) : null}
      {book ? (
        <>
          <h1>{book.title}</h1>
          <section className="portal-grid">
            <article className="portal-card">
              <h2>Publishing</h2>
              <p>ISBN: {book.isbn}</p>
              <p>{book.genre}</p>
              <p>{book.status}</p>
            </article>
            <article className="portal-card">
              <h2>Sales</h2>
              {/production|typesetting|cover|manuscript/i.test(book.status) ? (
                <>
                  <p>In production — sales begin after release</p>
                  <p>MRP: {book.mrp ? `₹${book.mrp}` : "Not announced"}</p>
                  <p>Per-copy royalty: Set after publication</p>
                </>
              ) : (
                <>
                  <p>{book.totalCopiesSold} copies sold</p>
                  <p>MRP: {book.mrp ? `₹${book.mrp}` : "Unavailable"}</p>
                  <p>
                    Per-copy royalty:{" "}
                    {book.royaltyPerCopy
                      ? `₹${book.royaltyPerCopy}`
                      : "Unavailable"}
                  </p>
                </>
              )}
            </article>
            <article className="portal-card">
              <h2>Royalties</h2>
              {/production|typesetting|cover|manuscript/i.test(book.status) ? (
                <p>Royalties begin once the book is published.</p>
              ) : (
                <>
                  <p>Earned: ₹{book.totalRoyaltyEarned}</p>
                  <p>Paid: ₹{book.royaltyPaid}</p>
                  <p>Pending: ₹{book.royaltyPending}</p>
                </>
              )}
            </article>
          </section>
          <section className="portal-section">
            <h2>Availability</h2>
            <p>
              {book.platforms.join(", ") ||
                "No distribution information available."}
            </p>
          </section>
        </>
      ) : null}
    </main>
  );
}
