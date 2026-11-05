"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api-client";
type Book = {
  id: string;
  title: string;
  isbn: string;
  genre: string;
  publicationDate: string | null;
  status: string;
  mrp: string | null;
  totalCopiesSold: number;
  royaltyPerCopy: string | null;
};
export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    apiFetch<{ books: Book[] }>("/api/v1/author/books?pageSize=50")
      .then((r) => setBooks(r.books))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load books."),
      );
  }, []);
  return (
    <main id="main-content" className="portal-main">
      <Link href="/portal">← Dashboard</Link>
      <h1>My books</h1>
      {error ? <p className="portal-error">{error}</p> : null}
      {!error && !books.length ? <p>Loading books…</p> : null}
      {books.length ? (
        <table className="portal-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>ISBN</th>
              <th>Status</th>
              <th>Sales</th>
              <th>MRP</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>
                  <Link href={`/portal/books/${book.id}`}>{book.title}</Link>
                  <br />
                  <small>
                    {book.genre} ·{" "}
                    {book.publicationDate ?? "Publication date unavailable"}
                  </small>
                </td>
                <td>{book.isbn}</td>
                <td>
                  <span className="portal-badge">{book.status}</span>
                </td>
                <td>{book.totalCopiesSold}</td>
                <td>{book.mrp ? `₹${book.mrp}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </main>
  );
}
