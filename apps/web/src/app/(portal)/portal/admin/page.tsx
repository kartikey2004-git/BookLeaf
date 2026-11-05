"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  apiErrorMessage,
  apiFetch,
  userFacingErrorMessage,
} from "../../../../lib/api-client";
import { usePortalToast } from "../portal-toast";
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
    [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const { notify } = usePortalToast();
  const listRequest = useRef(0);
  const selectionRequest = useRef(0);
  const draftRequest = useRef<AbortController | null>(null);
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
        notify(
          "error",
          userFacingErrorMessage(cause, "Could not load the ticket queue."),
        );
      }
    });
    return () => controller.abort();
  }, [filter, notify]);
  useEffect(() => () => draftRequest.current?.abort(), []);
  async function select(id: string) {
    const request = ++selectionRequest.current;
    draftRequest.current?.abort();
    draftRequest.current = null;
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
        notify(
          "error",
          userFacingErrorMessage(cause, "Could not load this ticket."),
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
        notify("success", "Ticket updated.");
        await load();
      } catch (cause) {
        notify(
          "error",
          userFacingErrorMessage(cause, "Could not update this ticket."),
        );
      }
    });
  }
  async function post(path: string, body: unknown, form: HTMLFormElement) {
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
        form.reset();
        notify("success", "Saved.");
      } catch (cause) {
        notify(
          "error",
          userFacingErrorMessage(cause, "Could not save your changes."),
        );
      }
    });
  }
  async function getDraft() {
    if (!selected) return;
    const ticket = selected;
    const selection = selectionRequest.current;
    const controller = new AbortController();
    draftRequest.current?.abort();
    draftRequest.current = controller;
    setDraft("");
    await runAction("ai-draft", async () => {
      try {
        const response = await fetch(
          `/api/v1/admin/tickets/${ticket.id}/ai-draft/stream`,
          {
            method: "POST",
            credentials: "include",
            headers: { Accept: "text/event-stream" },
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          const body = (await response.json().catch(() => undefined)) as
            | { error?: { code?: string } }
            | undefined;
          throw new Error(apiErrorMessage(response.status, body?.error?.code));
        }
        if (!response.body) throw new Error("Draft stream was unavailable.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let completed = false;
        const consumeFrame = (frame: string) => {
          let eventName = "message";
          const dataLines: string[] = [];
          for (const line of frame.replace(/\r\n/g, "\n").split("\n")) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trimStart());
            }
          }
          if (!dataLines.length) return;
          const data = JSON.parse(dataLines.join("\n")) as {
            text?: unknown;
            draft?: unknown;
          };
          if (
            selection !== selectionRequest.current ||
            controller.signal.aborted
          )
            return;
          if (eventName === "chunk" && typeof data.text === "string") {
            setDraft((current) => current + data.text);
          } else if (eventName === "done") {
            if (typeof data.draft === "string") setDraft(data.draft);
            completed = true;
            notify("success", "AI draft ready for review.");
          } else if (eventName === "error") {
            throw new Error(apiErrorMessage(503));
          }
        };
        while (true) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value, { stream: !done });
          let separator: RegExpExecArray | null;
          while ((separator = /\r?\n\r?\n/.exec(buffer))) {
            consumeFrame(buffer.slice(0, separator.index));
            buffer = buffer.slice(separator.index + separator[0].length);
          }
          if (done) break;
        }
        if (buffer.trim()) consumeFrame(buffer);
        if (!completed && !controller.signal.aborted) {
          throw new Error("Gemini ended the draft stream before completing.");
        }
      } catch (cause) {
        if (
          !controller.signal.aborted &&
          selection === selectionRequest.current
        ) {
          notify(
            "error",
            userFacingErrorMessage(
              cause,
              "Gemini couldn’t generate a draft. Please try again.",
            ),
          );
          controller.abort();
        }
      } finally {
        if (draftRequest.current === controller) draftRequest.current = null;
      }
    });
  }
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="portal-main portal-admin-page"
    >
      <header className="portal-admin-heading">
        <Link href="/portal">Portal</Link>
        <p className="portal-muted">Support workspace</p>
        <h1>Admin ticket queue</h1>
      </header>
      <label className="portal-admin-filter">
        <span>Status</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter tickets by status"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <section className="portal-admin-queue">
        {tickets.length ? (
          <div className="portal-admin-table-wrap">
            <table className="portal-table portal-admin-table">
              <thead>
                <tr>
                  <th scope="col">Ticket</th>
                  <th scope="col">Status</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Category</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td data-label="Ticket">
                      <button type="button" onClick={() => void select(t.id)}>
                        <span className="portal-admin-reference">
                          {t.reference}
                        </span>
                        <span className="portal-admin-subject">{t.subject}</span>
                      </button>
                    </td>
                    <td data-label="Status">{t.status.replaceAll("_", " ")}</td>
                    <td data-label="Priority">
                      <span className="portal-badge">
                        {t.priority.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td data-label="Category">
                      {t.category.replaceAll("_", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="portal-card portal-admin-empty">
            No tickets match these filters.
          </p>
        )}
      </section>
      {selected ? (
        <section className="portal-section portal-detail portal-admin-detail">
          <article className="portal-card portal-admin-conversation">
            <h2>{selected.subject}</h2>
            <p className="portal-admin-description">{selected.description}</p>
            <p className="portal-admin-context">
              <strong>Author:</strong> {selected.author?.name ?? "Unavailable"}{" "}
              · {selected.author?.email ?? ""}
            </p>
            <p className="portal-admin-context">
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
                const form = e.currentTarget;
                const f = new FormData(form);
                void post("messages", { content: String(f.get("content")) }, form);
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
                const form = e.currentTarget;
                const f = new FormData(form);
                void post("internal-notes", {
                  content: String(f.get("content")),
                }, form);
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
          <aside
            className="portal-card portal-admin-controls"
            aria-busy={isPending("ai-draft")}
          >
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
            <section className="portal-admin-ai" aria-labelledby="ai-title">
              <h3 id="ai-title">AI assistance</h3>
              <p className="portal-muted">
                AI status: {selected.ai?.status ?? "PENDING"}
              </p>
              <p className="portal-admin-suggestion">
                Suggested category:{" "}
                {selected.ai?.suggestedCategory ?? "Awaiting recommendation"}
              </p>
              <p className="portal-admin-suggestion">
                Suggested priority:{" "}
                {selected.ai?.suggestedPriority ?? "Awaiting recommendation"}
              </p>
              <button
                className="portal-button"
                disabled={isPending("ai-draft")}
                onClick={getDraft}
              >
                {isPending("ai-draft") ? (
                  <>
                    <span
                      className="portal-admin-generating-indicator"
                      aria-hidden="true"
                    />
                    Generating draft…
                  </>
                ) : (
                  "Generate draft"
                )}
              </button>
              {draft ? (
                <form className="portal-form portal-admin-draft">
                  <label>
                    Review draft
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                  </label>
                  <p className="portal-muted">
                    Edit this draft, then copy it into the public reply field.
                    It is never sent automatically.
                  </p>
                </form>
              ) : null}
            </section>
          </aside>
        </section>
      ) : null}
    </main>
  );
}
