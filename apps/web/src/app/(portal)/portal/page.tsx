"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { apiFetch } from "../../../lib/api-client";

type Overview = {
  totalBooks: number;
  publishedBooks: number;
  booksInProduction: number;
  totalRoyaltyEarned: string;
  totalRoyaltyPaid: string;
  totalRoyaltyPending: string;
};
type Ticket = {
  id: string;
  reference: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
};
type Book = { id: string; title: string };

function ErrorBox({ error }: { error: string | null }) {
  return error ? (
    <p className="portal-error" role="alert">
      {error}
    </p>
  ) : null;
}

function SupportModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch<{ books: Book[] }>("/api/v1/author/books?pageSize=50")
      .then((response) => setBooks(response.books))
      .catch((cause: unknown) => {
        setBooks([]);
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load books for this ticket.",
        );
      });
  }, []);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = String(form.get("subject") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();

    if (subject.length < 3 || !description) {
      setError("Enter a subject and description.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await apiFetch("/api/v1/author/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          description,
          bookId: String(form.get("bookId") || "") || undefined,
        }),
      });
      await onCreated();
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create ticket.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        className="portal-modal max-h-[calc(100dvh-2rem)] max-w-152"
        overlayClassName="portal-modal-backdrop"
        viewportClassName="portal-modal-viewport"
        showCloseButton={false}
      >
        <DialogHeader className="portal-modal-header">
          <div>
            <p className="portal-muted">Support desk</p>
            <DialogTitle>How can we help?</DialogTitle>
          </div>
          <DialogClose
            className="portal-modal-close"
            disabled={busy}
            aria-label="Close support form"
          >
            ×
          </DialogClose>
        </DialogHeader>
        <DialogDescription>
          Send your request to the BookLeaf team. We will reply in portal.
        </DialogDescription>
        <ErrorBox error={error} />
        <form
          className="portal-form"
          onSubmit={createTicket}
          autoComplete="off"
        >
          <label>
            Book (optional)
            <select name="bookId">
              <option value="">General account question</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Subject
            <input
              name="subject"
              autoComplete="off"
              minLength={3}
              maxLength={200}
              required
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              autoComplete="off"
              maxLength={10000}
              required
            />
          </label>
          <button className="portal-button" disabled={busy}>
            {busy ? "Sending..." : "Send request"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PortalHome() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  async function refreshTickets() {
    const response = await apiFetch<{ tickets: Ticket[] }>(
      "/api/v1/author/tickets?pageSize=5",
    );
    setTickets(response.tickets);
  }

  useEffect(() => {
    Promise.all([
      apiFetch<{ overview: Overview }>("/api/v1/author/overview"),
      apiFetch<{ tickets: Ticket[] }>("/api/v1/author/tickets?pageSize=5"),
    ])
      .then(([a, b]) => {
        setOverview(a.overview);
        setTickets(b.tickets);
      })
      .catch((e: unknown) =>
        setError(
          e instanceof Error ? e.message : "Could not load your dashboard.",
        ),
      );
  }, []);
  return (
    <main id="main-content" className="portal-main">
      <header>
        <p className="portal-muted">Author workspace</p>
        <h1>Your publishing overview</h1>
      </header>
      <ErrorBox error={error} />
      {!overview && !error ? <p>Loading dashboard…</p> : null}
      {overview ? (
        <>
          <section className="portal-grid">
            <article className="portal-card">
              <span className="portal-stat">{overview.totalBooks}</span>
              <p>Books</p>
            </article>
            <article className="portal-card">
              <span className="portal-stat">{overview.publishedBooks}</span>
              <p>Published</p>
            </article>
            <article className="portal-card">
              <span className="portal-stat">
                ₹{overview.totalRoyaltyEarned}
              </span>
              <p>Royalty earned</p>
            </article>
            <article className="portal-card">
              <span className="portal-stat">
                ₹{overview.totalRoyaltyPending}
              </span>
              <p>Royalty pending</p>
            </article>
          </section>
          <section className="portal-section">
            <header>
              <h2>Recent support tickets</h2>
              <button
                className="portal-button"
                type="button"
                onClick={() => setSupportOpen(true)}
              >
                Get support
              </button>
            </header>
            {tickets.length ? (
              <table className="portal-table">
                <thead>
                  <tr>
                    <th scope="col">Ticket</th>
                    <th scope="col">Status</th>
                    <th scope="col">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <span className="portal-ticket-subject">
                          {t.subject}
                        </span>
                      </td>
                      <td>
                        <span className="portal-badge">{t.status}</span>
                      </td>
                      <td>{t.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="portal-card">No support tickets yet.</p>
            )}
          </section>
        </>
      ) : null}
      {supportOpen ? (
        <SupportModal
          onClose={() => setSupportOpen(false)}
          onCreated={refreshTickets}
        />
      ) : null}
    </main>
  );
}
