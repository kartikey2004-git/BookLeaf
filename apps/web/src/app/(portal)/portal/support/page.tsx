"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api-client";
type Book = { id: string; title: string };
type Ticket = {
  id: string;
  reference: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  description: string;
  messages?: {
    id: string;
    content: string;
    sender: { name: string; role: string };
    createdAt: string;
  }[];
};
export default function SupportPage() {
  const [books, setBooks] = useState<Book[]>([]),
    [tickets, setTickets] = useState<Ticket[]>([]),
    [selected, setSelected] = useState<Ticket | null>(null),
    [error, setError] = useState<string | null>(null),
    [notice, setNotice] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  const listRequest = useRef(0);
  const selectionRequest = useRef(0);
  const load = async (signal?: AbortSignal) => {
    const request = ++listRequest.current;
    const response = await apiFetch<{ tickets: Ticket[] }>(
      "/api/v1/author/tickets?pageSize=50",
      signal ? { signal } : undefined,
    );
    if (request === listRequest.current) setTickets(response.tickets);
  };
  useEffect(() => {
    const controller = new AbortController();
    apiFetch<{ books: Book[] }>("/api/v1/author/books?pageSize=50", {
      signal: controller.signal,
    })
      .then((response) => setBooks(response.books))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error ? cause.message : "Could not load books.",
          );
        }
      });
    load(controller.signal).catch((cause: unknown) => {
      if (!controller.signal.aborted) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load support tickets.",
        );
      }
    });
    return () => controller.abort();
  }, []);
  async function selectTicket(id: string) {
    const request = ++selectionRequest.current;
    try {
      const response = await apiFetch<{ ticket: Ticket }>(
        `/api/v1/author/tickets/${id}`,
      );
      if (request === selectionRequest.current) setSelected(response.ticket);
    } catch (cause) {
      if (request === selectionRequest.current) {
        setError(
          cause instanceof Error ? cause.message : "Could not load ticket.",
        );
      }
    }
  }
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const subject = String(form.get("subject") ?? "").trim(),
      description = String(form.get("description") ?? "").trim();
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
      e.currentTarget.reset();
      setNotice("Ticket created.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create ticket.");
    } finally {
      setBusy(false);
    }
  }
  async function reply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const form = new FormData(e.currentTarget);
    const content = String(form.get("content") ?? "").trim();
    if (!content) return;
    setBusy(true);
    try {
      await apiFetch(`/api/v1/author/tickets/${selected.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const detail = await apiFetch<{ ticket: Ticket }>(
        `/api/v1/author/tickets/${selected.id}`,
      );
      setSelected(detail.ticket);
      e.currentTarget.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send reply.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main-content" className="portal-main">
      <Link href="/portal">← Dashboard</Link>
      <h1>Support</h1>
      {error ? <p className="portal-error">{error}</p> : null}
      {notice ? (
        <p className="portal-success" role="status">
          {notice}
        </p>
      ) : null}
      <section className="portal-section">
        <h2>Create ticket</h2>
        <form className="portal-form" onSubmit={create} autoComplete="off">
          <label>
            Book (optional)
            <select name="bookId">
              <option value="">General account question</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
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
            {busy ? "Creating…" : "Create ticket"}
          </button>
        </form>
      </section>
      <section className="portal-section">
        <h2>My tickets</h2>
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
                    <button onClick={() => void selectTicket(t.id)}>
                      {t.subject}
                    </button>
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
          <p className="portal-card">No tickets yet.</p>
        )}
      </section>
      {selected ? (
        <section className="portal-section portal-card">
          <h2>{selected.subject}</h2>
          <p>{selected.description}</p>
          {selected.messages?.map((m) => (
            <article className="portal-message" key={m.id}>
              <strong>{m.sender.name}</strong>
              <p>{m.content}</p>
            </article>
          ))}
          {["OPEN", "IN_PROGRESS"].includes(selected.status) ? (
            <form className="portal-form" onSubmit={reply}>
              <label>
                Reply
                <textarea name="content" required />
              </label>
              <button className="portal-button" disabled={busy}>
                {busy ? "Sending…" : "Send reply"}
              </button>
            </form>
          ) : (
            <p className="portal-muted">
              This ticket is no longer accepting author replies.
            </p>
          )}
        </section>
      ) : null}
    </main>
  );
}
