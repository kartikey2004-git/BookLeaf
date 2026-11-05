"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  apiFetch,
  userFacingErrorMessage,
} from "../../../lib/api-client";
import { usePortalToast } from "./portal-toast";

type Overview = {
  totalBooks: number;
  publishedBooks: number;
  booksInProduction: number;
  totalRoyaltyEarned: string;
  totalRoyaltyPaid: string;
  totalRoyaltyPending: string;
};

type Book = { id: string; title: string };

type Ticket = {
  id: string;
  reference: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  description: string;
  createdAt: string;
  messages?: {
    id: string;
    content: string;
    sender: { name: string; role: string };
    createdAt: string;
  }[];
};

export default function PortalHome() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [creating, setCreating] = useState(false);
  const [replying, setReplying] = useState(false);
  const selectionRequest = useRef(0);
  const { notify } = usePortalToast();

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };

    Promise.all([
      apiFetch<{ overview: Overview }>("/api/v1/author/overview", options),
      apiFetch<{ books: Book[] }>(
        "/api/v1/author/books?pageSize=50",
        options,
      ),
      apiFetch<{ tickets: Ticket[] }>(
        "/api/v1/author/tickets?pageSize=50",
        options,
      ),
    ])
      .then(([overviewResponse, booksResponse, ticketsResponse]) => {
        setOverview(overviewResponse.overview);
        setBooks(booksResponse.books);
        setTickets(ticketsResponse.tickets);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          notify(
            "error",
            userFacingErrorMessage(cause, "Could not load your portal."),
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
      selectionRequest.current += 1;
    };
  }, [notify]);

  async function refreshTickets() {
    const response = await apiFetch<{ tickets: Ticket[] }>(
      "/api/v1/author/tickets?pageSize=50",
    );
    setTickets(response.tickets);
  }

  async function selectTicket(ticketId: string) {
    const request = ++selectionRequest.current;
    setSelectedTicketId(ticketId);
    setSelectedTicket(null);
    setLoadingTicket(true);
    try {
      const response = await apiFetch<{ ticket: Ticket }>(
        `/api/v1/author/tickets/${ticketId}`,
      );
      if (request === selectionRequest.current) {
        setSelectedTicket(response.ticket);
      }
    } catch (cause) {
      if (request === selectionRequest.current) {
        notify(
          "error",
          userFacingErrorMessage(cause, "Could not load this ticket."),
        );
        setSelectedTicketId(null);
      }
    } finally {
      if (request === selectionRequest.current) setLoadingTicket(false);
    }
  }

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const subject = String(form.get("subject") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();

    if (subject.length < 3 || !description) {
      notify("error", "Enter a subject and description.");
      return;
    }

    setCreating(true);
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
      formElement.reset();
      notify("success", "Ticket created.");

      try {
        await refreshTickets();
      } catch {
        notify("error", "Ticket created, but the ticket list could not be refreshed.");
      }
    } catch (cause) {
      notify(
        "error",
        userFacingErrorMessage(cause, "Could not create your ticket."),
      );
    } finally {
      setCreating(false);
    }
  }

  async function replyToTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTicket) return;

    const formElement = event.currentTarget;
    const content = String(new FormData(formElement).get("content") ?? "").trim();
    if (!content) return;

    setReplying(true);
    try {
      await apiFetch(
        `/api/v1/author/tickets/${selectedTicket.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        },
      );
      formElement.reset();
      notify("success", "Reply sent.");

      try {
        const response = await apiFetch<{ ticket: Ticket }>(
          `/api/v1/author/tickets/${selectedTicket.id}`,
        );
        setSelectedTicket(response.ticket);
        await refreshTickets();
      } catch {
        notify("error", "Reply sent, but the ticket could not be refreshed.");
      }
    } catch (cause) {
      notify(
        "error",
        userFacingErrorMessage(cause, "Could not send your reply."),
      );
    } finally {
      setReplying(false);
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="portal-main">
      <header>
        <p className="portal-muted">Author workspace</p>
        <h1>Your publishing overview</h1>
      </header>
      {loading ? <p>Loading your portal…</p> : null}
      {overview ? (
        <section className="portal-grid" aria-label="Publishing overview">
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
      ) : null}

      <section className="portal-section" aria-labelledby="support-title">
        <header>
          <div>
            <p className="portal-muted">Author support</p>
            <h2 id="support-title">Your support requests</h2>
          </div>
        </header>

        <div className="portal-support-grid">
          <section className="portal-support-panel">
            <h3>Create a request</h3>
            <form
              className="portal-form"
              onSubmit={createTicket}
              autoComplete="off"
            >
              <label>
                Book (optional)
                <select name="bookId" disabled={loading}>
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
              <button className="portal-button" disabled={creating || loading}>
                {creating ? "Sending…" : "Send request"}
              </button>
            </form>
          </section>

          <section
            className="portal-support-panel"
            aria-labelledby="ticket-list-title"
          >
            <h3 id="ticket-list-title">Your tickets</h3>
            {loading ? (
              <p>Loading tickets…</p>
            ) : tickets.length ? (
              <table className="portal-table">
                <thead>
                  <tr>
                    <th scope="col">Ticket</th>
                    <th scope="col">Status</th>
                    <th scope="col">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <button
                          type="button"
                          aria-pressed={selectedTicketId === ticket.id}
                          disabled={replying}
                          onClick={() => void selectTicket(ticket.id)}
                        >
                          {ticket.subject}
                        </button>
                        <br />
                        <small>{ticket.reference}</small>
                      </td>
                      <td>
                        <span className="portal-badge">{ticket.status}</span>
                      </td>
                      <td>{ticket.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="portal-support-empty">No support requests yet.</p>
            )}
          </section>
        </div>

        {loadingTicket ? <p role="status">Loading ticket…</p> : null}
        {selectedTicket ? (
          <section
            className="portal-section portal-support-detail"
            aria-labelledby="selected-ticket-title"
          >
            <header>
              <div>
                <p className="portal-muted">{selectedTicket.reference}</p>
                <h3 id="selected-ticket-title">{selectedTicket.subject}</h3>
              </div>
              <span className="portal-badge">{selectedTicket.status}</span>
            </header>
            <p>{selectedTicket.description}</p>
            {selectedTicket.messages?.map((message) => (
              <article className="portal-message" key={message.id}>
                <strong>{message.sender.name}</strong>
                <p>{message.content}</p>
              </article>
            ))}
            {["OPEN", "IN_PROGRESS"].includes(selectedTicket.status) ? (
              <form className="portal-form portal-reply-form" onSubmit={replyToTicket}>
                <label>
                  Reply
                  <textarea name="content" maxLength={10000} required />
                </label>
                <button className="portal-button" disabled={replying}>
                  {replying ? "Sending…" : "Send reply"}
                </button>
              </form>
            ) : (
              <p className="portal-muted">
                This ticket is no longer accepting author replies.
              </p>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}
