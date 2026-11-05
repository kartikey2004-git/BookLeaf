"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../../../lib/api-client";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params
      .then(({ bookId }) =>
        apiFetch<{ book: Book }>(`/api/v1/author/books/${bookId}`),
      )
      .then((response) => setBook(response.book))
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : "Could not load book.",
        ),
      );
  }, [params]);

  return (
    <main id="main-content" className="portal-main">
      <Link href="/portal/books">← My books</Link>
      {error ? <p className="portal-error">{error}</p> : null}
      {!book && !error ? <p>Loading book…</p> : null}
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
              <p>{book.totalCopiesSold} copies sold</p>
              <p>MRP: {book.mrp ? `₹${book.mrp}` : "Unavailable"}</p>
              <p>
                Per-copy royalty:{" "}
                {book.royaltyPerCopy
                  ? `₹${book.royaltyPerCopy}`
                  : "Unavailable"}
              </p>
            </article>
            <article className="portal-card">
              <h2>Royalties</h2>
              <p>Earned: ₹{book.totalRoyaltyEarned}</p>
              <p>Paid: ₹{book.royaltyPaid}</p>
              <p>Pending: ₹{book.royaltyPending}</p>
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
