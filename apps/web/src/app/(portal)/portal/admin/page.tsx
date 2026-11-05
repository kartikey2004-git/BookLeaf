"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api-client";
const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const categories = [
  "ROYALTY_AND_PAYMENTS",
  "ISBN_AND_METADATA",
  "PRINTING_AND_QUALITY",
  "DISTRIBUTION_AND_AVAILABILITY",
  "BOOK_STATUS_AND_PRODUCTION",
  "GENERAL_INQUIRY",
];
type Ticket = {
  id: string;
  reference: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  version: number;
  author?: { name: string; email: string };
  book?: { title: string } | null;
  messages?: {
    id: string;
    content: string;
    sender: { name: string; role: string };
  }[];
  internalNotes?: { id: string; content: string; admin: { name: string } }[];
  ai?: {
    suggestedCategory: string | null;
    suggestedPriority: string | null;
    status: string;
    classificationReasoning: string | null;
    priorityReasoning: string | null;
  };
  assignedAdmin?: { name: string } | null;
};
export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]),
    [selected, setSelected] = useState<Ticket | null>(null),
    [filter, setFilter] = useState(""),
    [draft, setDraft] = useState(""),
    [error, setError] = useState<string | null>(null),
    [notice, setNotice] = useState<string | null>(null),
    [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const listRequest = useRef(0);
  const selectionRequest = useRef(0);
  const load = async (signal?: AbortSignal) => {
    const request = ++listRequest.current;
    const suffix = filter ? `?status=${filter}` : "";
    const response = await apiFetch<{ tickets: Ticket[] }>(
      `/api/v1/admin/tickets${suffix}`,
      signal ? { signal } : undefined,
    );
    if (request === listRequest.current) setTickets(response.tickets);
  };
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).catch((cause: unknown) => {
      if (!controller.signal.aborted) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load ticket queue.",
        );
      }
    });
    return () => controller.abort();
  }, [filter]);
  async function select(id: string) {
    const request = ++selectionRequest.current;
    try {
      const response = await apiFetch<{ ticket: Ticket }>(
        `/api/v1/admin/tickets/${id}`,
      );
      if (request === selectionRequest.current) {
        setSelected(response.ticket);
        setDraft("");
      }
    } catch (cause) {
      if (request === selectionRequest.current) {
        setError(
          cause instanceof Error ? cause.message : "Could not load ticket.",
        );
      }
    }
  }
  const isPending = (action: string) => pendingActions.has(action);
  async function runAction(action: string, operation: () => Promise<void>) {
    setPendingActions((current) => new Set(current).add(action));
    try {
      await operation();
    } finally {
      setPendingActions((current) => {
        const next = new Set(current);
        next.delete(action);
        return next;
      });
    }
  }
  async function mutate(path: string, body: unknown) {
    if (!selected) return;
    const ticket = selected;
    const selection = selectionRequest.current;
    await runAction(`patch:${path}`, async () => {
      try {
        const response = await apiFetch<{ ticket: Ticket }>(
          `/api/v1/admin/tickets/${ticket.id}/${path}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );
        if (selection === selectionRequest.current)
          setSelected(response.ticket);
        setNotice("Ticket updated.");
        await load();
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Could not update ticket.",
        );
      }
    });
  }
  async function post(path: string, body: unknown) {
    if (!selected) return;
    const ticket = selected;
    await runAction(`post:${path}`, async () => {
      try {
        await apiFetch(`/api/v1/admin/tickets/${ticket.id}/${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        await select(ticket.id);
        setNotice("Saved.");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not save.");
      }
    });
  }
  async function getDraft() {
    if (!selected) return;
    const ticket = selected;
    const selection = selectionRequest.current;
    await runAction("ai-draft", async () => {
      try {
        const response = await apiFetch<{ draft: string }>(
          `/api/v1/admin/tickets/${ticket.id}/ai-draft`,
          { method: "POST" },
        );
        if (selection === selectionRequest.current) setDraft(response.draft);
        setNotice("AI draft ready for review.");
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Gemini is unavailable.",
        );
      }
    });
  }
  return (
    <main id="main-content" className="portal-main">
      <Link href="/portal">← Portal</Link>
      <h1>Admin ticket queue</h1>
      {error ? <p className="portal-error">{error}</p> : null}
      {notice ? (
        <p className="portal-success" role="status">
          {notice}
        </p>
      ) : null}
      <label>
        Status{" "}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <section className="portal-section">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>
                  <button onClick={() => select(t.id)}>
                    {t.reference}
                    <br />
                    {t.subject}
                  </button>
                </td>
                <td>{t.status}</td>
                <td>
                  <span className="portal-badge">{t.priority}</span>
                </td>
                <td>{t.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!tickets.length ? (
          <p className="portal-card">No tickets match these filters.</p>
        ) : null}
      </section>
      {selected ? (
        <section className="portal-section portal-detail">
          <article className="portal-card">
            <h2>{selected.subject}</h2>
            <p>{selected.description}</p>
            <p>
              <strong>Author:</strong> {selected.author?.name ?? "Unavailable"}{" "}
              · {selected.author?.email ?? ""}
            </p>
            <p>
              <strong>Book:</strong>{" "}
              {selected.book?.title ?? "General question"}
            </p>
            <h3>Conversation</h3>
            {selected.messages?.map((m) => (
              <article className="portal-message" key={m.id}>
                <strong>{m.sender.name}</strong>
                <p>{m.content}</p>
              </article>
            ))}
            <form
              className="portal-form"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void post("messages", { content: String(f.get("content")) });
              }}
            >
              <label>
                Public reply
                <textarea name="content" required />
              </label>
              <button
                className="portal-button"
                disabled={isPending("post:messages")}
              >
                Send public reply
              </button>
            </form>
            <h3>Internal notes</h3>
            {selected.internalNotes?.map((n) => (
              <p className="portal-message" key={n.id}>
                <strong>{n.admin.name}:</strong> {n.content}
              </p>
            ))}
            <form
              className="portal-form"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void post("internal-notes", {
                  content: String(f.get("content")),
                });
              }}
            >
              <label>
                Internal note
                <textarea name="content" required />
              </label>
              <button
                className="portal-button portal-button--plain"
                disabled={isPending("post:internal-notes")}
              >
                Add internal note
              </button>
            </form>
          </article>
          <aside className="portal-card">
            <h2>Ticket controls</h2>
            <label>
              Status
              <select
                value={selected.status}
                disabled={isPending("patch:status")}
                onChange={(e) =>
                  mutate("status", {
                    status: e.target.value,
                    version: selected.version,
                  })
                }
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select
                value={selected.priority}
                disabled={isPending("patch:priority")}
                onChange={(e) =>
                  mutate("priority", {
                    priority: e.target.value,
                    version: selected.version,
                  })
                }
              >
                {priorities.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select
                value={selected.category}
                disabled={isPending("patch:category")}
                onChange={(e) =>
                  mutate("category", {
                    category: e.target.value,
                    version: selected.version,
                  })
                }
              >
                {categories.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <h3>AI assistance</h3>
            <p className="portal-muted">
              AI status: {selected.ai?.status ?? "PENDING"}
            </p>
            <p>
              Suggested category:{" "}
              {selected.ai?.suggestedCategory ?? "Awaiting recommendation"}
            </p>
            <p>
              Suggested priority:{" "}
              {selected.ai?.suggestedPriority ?? "Awaiting recommendation"}
            </p>
            <button
              className="portal-button"
              disabled={isPending("ai-draft")}
              onClick={getDraft}
            >
              Generate draft
            </button>
            {draft ? (
              <form className="portal-form">
                <label>
                  Review draft
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                </label>
                <p className="portal-muted">
                  Edit this draft, then copy it into the public reply field. It
                  is never sent automatically.
                </p>
              </form>
            ) : null}
          </aside>
        </section>
      ) : null}
    </main>
  );
}
