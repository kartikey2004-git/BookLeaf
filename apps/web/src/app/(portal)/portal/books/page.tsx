"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  apiFetch,
  userFacingErrorMessage,
} from "../../../../lib/api-client";
import { usePortalToast } from "../portal-toast";
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
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const { notify } = usePortalToast();
  const loadBooks = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const response = await apiFetch<{ books: Book[] }>(
        "/api/v1/author/books?pageSize=50",
        signal ? { signal } : undefined,
      );
      if (!signal?.aborted) setBooks(response.books);
    } catch (cause) {
      if (!signal?.aborted) {
        setLoadFailed(true);
        notify(
          "error",
          userFacingErrorMessage(cause, "Could not load your books."),
        );
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [notify]);
  useEffect(() => {
    const controller = new AbortController();
    void loadBooks(controller.signal);
    return () => controller.abort();
  }, [loadBooks]);
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="portal-main portal-books-page"
    >
      <header className="portal-books-heading">
        <Link href="/portal">Dashboard</Link>
        <h1>My books</h1>
      </header>
      {loading ? <p role="status">Loading books…</p> : null}
      {loadFailed ? (
        <section className="portal-card portal-empty-state">
          <h2>Books couldn’t be loaded</h2>
          <p>Try again to refresh your publishing catalogue.</p>
          <button className="portal-button" onClick={() => void loadBooks()}>
            Try again
          </button>
        </section>
      ) : null}
      {!loading && !loadFailed && !books.length ? (
        <section className="portal-card portal-empty-state">
          <h2>No books yet</h2>
          <p>Your publishing catalogue will appear here when available.</p>
        </section>
      ) : null}
      {!loadFailed && books.length ? (
        <div className="portal-books-table-wrap">
          <table className="portal-table portal-books-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">ISBN</th>
                <th scope="col">Status</th>
                <th scope="col">Sales</th>
                <th scope="col">MRP</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td data-label="Book">
                    <Link href={`/portal/books/${book.id}`}>{book.title}</Link>
                    <br />
                    <small>
                      {book.genre} ·{" "}
                      {book.publicationDate ?? "Publication date unavailable"}
                    </small>
                  </td>
                  <td data-label="ISBN">{book.isbn}</td>
                  <td data-label="Status">
                    <span className="portal-badge">{book.status}</span>
                  </td>
                  <td data-label="Sales">{book.totalCopiesSold}</td>
                  <td data-label="MRP">{book.mrp ? `₹${book.mrp}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
