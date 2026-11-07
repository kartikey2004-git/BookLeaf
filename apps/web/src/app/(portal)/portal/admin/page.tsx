"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ApiClientError,
  apiErrorMessage,
  apiFetch,
  userFacingErrorMessage,
} from "../../../../lib/api-client";
import { authClient } from "../../../../lib/auth-client";
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
const dateRanges = [
  { value: "any", label: "Any time" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];
const pageSize = 20;

type TicketFilters = {
  status: string;
  category: string;
  priority: string;
  dateRange: string;
  unresolved: boolean;
};
const defaultFilters: TicketFilters = {
  status: "",
  category: "",
  priority: "",
  dateRange: "any",
  unresolved: true,
};

function createdFromFor(range: string): string | undefined {
  if (range === "any") return undefined;
  const now = Date.now();
  const day = 86_400_000;
  const offset = range === "24h" ? day : range === "7d" ? 7 * day : 30 * day;
  return new Date(now - offset).toISOString();
}

function badgeClass(value: string): string {
  return `portal-badge portal-badge--${value.toLowerCase().replaceAll("_", "-")}`;
}

function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "")
    return "Unassigned";
  if (typeof value !== "string") return "Updated";
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function auditDescription(action: string, metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const { from, to } = metadata as { from?: unknown; to?: unknown };
  switch (action) {
    case "STATUS_CHANGED":
      return `Status changed from ${formatAuditValue(from)} to ${formatAuditValue(to)}.`;
    case "PRIORITY_CHANGED":
      return `Priority changed from ${formatAuditValue(from)} to ${formatAuditValue(to)}.`;
    case "CATEGORY_CHANGED":
      return `Category changed from ${formatAuditValue(from)} to ${formatAuditValue(to)}.`;
    case "ASSIGNMENT_CHANGED":
      return to ? "Ticket assignment updated." : "Ticket assignment removed.";
    default:
      return null;
  }
}

type Ticket = {
  id: string;
  reference: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  version: number;
  createdAt?: string;
  updatedAt?: string;
  author?: { name: string; email: string };
  book?: { title: string } | null;
  messages?: {
    id: string;
    content: string;
    sender: { name: string; role: string };
  }[];
  attachments?: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    cloudinaryPublicId: string;
    secureUrl: string;
    createdAt?: string;
  }>;
  internalNotes?: { id: string; content: string; admin: { name: string } }[];
  auditEvents?: {
    id: string;
    action: string;
    metadata?: unknown;
    createdAt: string;
    actor: { id: string; name: string; role: string };
  }[];
  ai?: {
    suggestedCategory?: string | null;
    suggestedPriority?: string | null;
    status: string;
    classificationConfidence?: number | null;
    priorityConfidence?: number | null;
    classificationReasoning?: string | null;
    priorityReasoning?: string | null;
    knowledgeSections?: unknown;
    processedAt?: string | null;
    error?: string | null;
  };
  assignedAdmin?: { id: string; name: string } | null;
};
type QueueResponse = {
  tickets: Ticket[];
  pagination: { page: number; pageSize: number; total: number };
};

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]),
    [selected, setSelected] = useState<Ticket | null>(null),
    [filters, setFilters] = useState<TicketFilters>(defaultFilters),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [draft, setDraft] = useState(""),
    [draftError, setDraftError] = useState<string | null>(null),
    [replyDraft, setReplyDraft] = useState(""),
    [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const { data: session } = authClient.useSession();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  const { notify } = usePortalToast();
  const listRequest = useRef(0);
  const selectionRequest = useRef(0);
  const draftRequest = useRef<AbortController | null>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = async (
    requestFilters: TicketFilters,
    requestPage: number,
    signal?: AbortSignal,
  ) => {
    const request = ++listRequest.current;
    const params = new URLSearchParams({
      page: String(requestPage),
      pageSize: String(pageSize),
    });
    if (requestFilters.status) params.set("status", requestFilters.status);
    else if (requestFilters.unresolved) params.set("unresolved", "true");
    if (requestFilters.category)
      params.set("category", requestFilters.category);
    if (requestFilters.priority)
      params.set("priority", requestFilters.priority);
    const createdFrom = createdFromFor(requestFilters.dateRange);
    if (createdFrom) params.set("createdFrom", createdFrom);
    const response = await apiFetch<QueueResponse>(
      `/api/v1/admin/tickets?${params.toString()}`,
      signal ? { signal } : undefined,
    );
    if (request === listRequest.current) {
      setTickets(response.tickets);
      setTotal(response.pagination?.total ?? response.tickets.length);
    }
  };

  useEffect(() => {
    // `load` reads latest filters/page via closure; reruns when they change.
    const controller = new AbortController();
    load(filters, page, controller.signal).catch((cause: unknown) => {
      if (!controller.signal.aborted) {
        notify(
          "error",
          userFacingErrorMessage(cause, "Could not load the ticket queue."),
        );
      }
    });
    return () => controller.abort();
  }, [filters, page, notify]);

  useEffect(() => () => draftRequest.current?.abort(), []);

  function updateFilters(next: Partial<TicketFilters>) {
    setFilters((current) => ({ ...current, ...next }));
    setPage(1);
  }

  async function select(id: string) {
    const request = ++selectionRequest.current;
    draftRequest.current?.abort();
    draftRequest.current = null;
    setDraftError(null);
    try {
      const response = await apiFetch<{ ticket: Ticket }>(
        `/api/v1/admin/tickets/${id}`,
      );
      if (request === selectionRequest.current) {
        setSelected(response.ticket);
        setDraft("");
        setDraftError(null);
        setReplyDraft("");
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
        await load(filters, page);
      } catch (cause) {
        const isConflict =
          cause instanceof ApiClientError && cause.status === 409;
        notify(
          "error",
          userFacingErrorMessage(cause, "Could not update this ticket."),
        );
        if (isConflict) await select(ticket.id);
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

  async function sendPublicReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const content = replyDraft.trim();
    if (!content) return;
    const ticket = selected;
    await runAction("post:messages", async () => {
      try {
        await apiFetch(`/api/v1/admin/tickets/${ticket.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        setReplyDraft("");
        await select(ticket.id);
        notify("success", "Reply sent to the author.");
      } catch (cause) {
        notify(
          "error",
          userFacingErrorMessage(cause, "Could not send your reply."),
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
    setDraftError(null);
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
            { error?: { code?: string } } | undefined;
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
            setDraftError(null);
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
          setDraftError(
            "The AI drafting service didn’t respond. You can write the reply manually — everything below still works.",
          );
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

  async function assignToMe() {
    if (!selected || !currentUserId) return;
    await mutate("assignment", {
      assignedAdminId: currentUserId,
      version: selected.version,
    });
  }

  async function unassign() {
    if (!selected) return;
    await mutate("assignment", {
      assignedAdminId: null,
      version: selected.version,
    });
  }

  function useDraftAsReply() {
    setReplyDraft(draft);
    const field = replyRef.current;
    if (!field) return;
    field.focus();
    field.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function applyAiSuggestion() {
    if (!selected?.ai?.suggestedCategory || !selected.ai?.suggestedPriority) {
      return;
    }
    void mutate("category", {
      category: selected.ai.suggestedCategory,
      version: selected.version,
    });
    void mutate("priority", {
      priority: selected.ai.suggestedPriority,
      version: selected.version,
    });
  }

  const hasActiveFilter =
    filters.status !== "" ||
    filters.category !== "" ||
    filters.priority !== "" ||
    filters.dateRange !== "any";
  const noUnresolvedTickets =
    tickets.length === 0 &&
    !hasActiveFilter &&
    filters.unresolved &&
    total === 0;
  const assignedToMe =
    selected?.assignedAdmin != null &&
    currentUserId != null &&
    selected.assignedAdmin.id === currentUserId;
  const aiUnavailable =
    selected?.ai?.status === "FAILED" || draftError !== null;

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

      <div
        className="portal-admin-filters"
        role="group"
        aria-label="Queue filters"
      >
        <label className="portal-admin-filter">
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            aria-label="Filter tickets by status"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="portal-admin-filter">
          <span>Category</span>
          <select
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
            aria-label="Filter tickets by category"
          >
            <option value="">All categories</option>
            {categories.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="portal-admin-filter">
          <span>Priority</span>
          <select
            value={filters.priority}
            onChange={(e) => updateFilters({ priority: e.target.value })}
            aria-label="Filter tickets by priority"
          >
            <option value="">All priorities</option>
            {priorities.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="portal-admin-filter">
          <span>Date</span>
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilters({ dateRange: e.target.value })}
            aria-label="Filter tickets by creation date"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </label>
        <label
          className="portal-admin-filter portal-admin-filter--check"
          title={
            filters.status
              ? "A specific status is selected, so this filter is ignored."
              : "Only show tickets that still need attention"
          }
        >
          <input
            type="checkbox"
            checked={filters.unresolved}
            disabled={filters.status !== ""}
            onChange={(e) => updateFilters({ unresolved: e.target.checked })}
          />
          <span>Unresolved only</span>
        </label>
        <p className="portal-admin-sort-hint">Most urgent and oldest first</p>
      </div>

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
                  <th scope="col">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td data-label="Ticket">
                      <button type="button" onClick={() => void select(t.id)}>
                        <span className="portal-admin-reference">
                          {t.reference}
                          {t.ai?.status === "FAILED" ? (
                            <span
                              className="portal-badge portal-badge--critical portal-ai-flag"
                              title="AI triage failed — classify this ticket manually"
                            >
                              AI failed
                            </span>
                          ) : null}
                        </span>
                        <span className="portal-admin-subject">
                          {t.subject}
                        </span>
                      </button>
                    </td>
                    <td data-label="Status">
                      <span className={badgeClass(t.status)}>
                        {t.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td data-label="Priority">
                      <span className={badgeClass(t.priority)}>
                        {t.priority}
                      </span>
                    </td>
                    <td data-label="Category">
                      {t.category.replaceAll("_", " ")}
                    </td>
                    <td data-label="Assigned">
                      {t.assignedAdmin ? (
                        t.assignedAdmin.name
                      ) : (
                        <span className="portal-muted-cell">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="portal-card portal-admin-empty">
            {noUnresolvedTickets
              ? "All caught up — no unresolved tickets right now."
              : "No tickets match these filters."}
          </p>
        )}
        {total > pageSize ? (
          <nav
            className="portal-pagination"
            aria-label="Ticket queue pagination"
          >
            <span>
              Page {page} of {totalPages} · {total} tickets
            </span>
            <span className="portal-pagination-controls">
              <button
                type="button"
                className="portal-pagination-button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft aria-hidden="true" /> Previous
              </button>
              <button
                type="button"
                className="portal-pagination-button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                Next <ChevronRight aria-hidden="true" />
              </button>
            </span>
          </nav>
        ) : null}
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
            <p className="portal-admin-context">
              <strong>Created:</strong>{" "}
              {selected.createdAt
                ? new Date(selected.createdAt).toLocaleString()
                : "—"}
              {" · "}
              <strong>Updated:</strong>{" "}
              {selected.updatedAt
                ? new Date(selected.updatedAt).toLocaleString()
                : "—"}
            </p>
            {selected.attachments?.length ? (
              <section
                className="portal-attachment"
                aria-label="Ticket attachments"
              >
                <h3>Attachments</h3>
                <ul className="portal-attachment-list">
                  {selected.attachments.map((a) => (
                    <li key={a.id}>
                      <a
                        href={a.secureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {a.fileName}
                      </a>
                      <span className="portal-attachment-size">
                        {formatFileSize(a.size)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <p className="portal-muted">
                No attachments have been added to this ticket yet.
              </p>
            )}
            <h3>Conversation</h3>
            {selected.messages?.map((m) => (
              <article className="portal-message" key={m.id}>
                <strong>{m.sender.name}</strong>
                <p>{m.content}</p>
              </article>
            ))}
            <form className="portal-form" onSubmit={sendPublicReply}>
              <label>
                Public reply
                <textarea
                  ref={replyRef}
                  name="content"
                  maxLength={10_000}
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  required
                />
              </label>
              <button
                className="portal-button"
                disabled={isPending("post:messages") || !replyDraft.trim()}
              >
                {isPending("post:messages") ? "Sending…" : "Send public reply"}
              </button>
            </form>
            <h3>Internal notes</h3>
            {selected.internalNotes?.length ? (
              selected.internalNotes.map((n) => (
                <p className="portal-message" key={n.id}>
                  <strong>{n.admin.name}:</strong> {n.content}
                </p>
              ))
            ) : (
              <p className="portal-muted portal-admin-none">
                No internal notes yet. Notes are never visible to authors.
              </p>
            )}
            <form
              className="portal-form"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.currentTarget;
                const f = new FormData(form);
                void post(
                  "internal-notes",
                  {
                    content: String(f.get("content")),
                  },
                  form,
                );
              }}
            >
              <label>
                Internal note
                <textarea name="content" maxLength={10_000} required />
              </label>
              <button
                className="portal-button portal-button--plain"
                disabled={isPending("post:internal-notes")}
              >
                Add internal note
              </button>
            </form>
            <h3>Activity</h3>
            {selected.auditEvents?.length ? (
              <ul className="portal-admin-audit">
                {selected.auditEvents.map((event) => (
                  <li key={event.id}>
                    <strong>{event.action.replaceAll("_", " ")}</strong>
                    <span className="portal-muted">
                      {" "}
                      · {event.actor.name} ·{" "}
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                    {auditDescription(event.action, event.metadata) ? (
                      <p className="portal-admin-audit-detail">
                        {auditDescription(event.action, event.metadata)}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="portal-muted">
                No activity recorded yet. Status, priority, assignment and
                message events will appear here.
              </p>
            )}
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
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
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

            <div className="portal-assign-row">
              <div>
                <span className="portal-muted">Assigned</span>
                <p className="portal-assign-value">
                  {selected.assignedAdmin
                    ? assignedToMe
                      ? `You (${selected.assignedAdmin.name})`
                      : selected.assignedAdmin.name
                    : "Unassigned"}
                </p>
              </div>
              <div className="portal-assign-actions">
                <button
                  className="portal-button portal-button--plain"
                  type="button"
                  disabled={
                    !currentUserId ||
                    isPending("patch:assignment") ||
                    assignedToMe
                  }
                  onClick={() => void assignToMe()}
                >
                  Assign to me
                </button>
                {selected.assignedAdmin ? (
                  <button
                    className="portal-button portal-button--plain"
                    type="button"
                    disabled={isPending("patch:assignment")}
                    onClick={() => void unassign()}
                  >
                    Unassign
                  </button>
                ) : null}
              </div>
            </div>

            <section className="portal-admin-ai" aria-labelledby="ai-title">
              <h3 id="ai-title">AI assistance</h3>
              {aiUnavailable ? (
                <div className="portal-ai-fallback" role="alert">
                  <strong>AI is currently unavailable.</strong>
                  <span>
                    {draftError ??
                      "Automatic triage failed for this ticket. Classify it and draft the reply manually — everything on this page still works without AI."}
                  </span>
                </div>
              ) : (
                <p className="portal-muted">
                  AI status: {selected.ai?.status ?? "PENDING"}
                </p>
              )}
              <p className="portal-admin-suggestion">
                Suggested category:{" "}
                {selected.ai?.suggestedCategory?.replaceAll("_", " ") ??
                  "Awaiting recommendation"}
              </p>
              <p className="portal-admin-suggestion">
                Suggested priority:{" "}
                {selected.ai?.suggestedPriority ?? "Awaiting recommendation"}
              </p>
              {selected.ai ? (
                <>
                  {selected.ai.classificationConfidence != null ? (
                    <p className="portal-muted">
                      Classification confidence:{" "}
                      {Math.round(selected.ai.classificationConfidence * 100)}%
                    </p>
                  ) : null}
                  {selected.ai.classificationReasoning ? (
                    <p className="portal-muted">
                      Classification reasoning:{" "}
                      {selected.ai.classificationReasoning}
                    </p>
                  ) : null}
                  {selected.ai.priorityConfidence != null ? (
                    <p className="portal-muted">
                      Priority confidence:{" "}
                      {Math.round(selected.ai.priorityConfidence * 100)}%
                    </p>
                  ) : null}
                  {selected.ai.priorityReasoning ? (
                    <p className="portal-muted">
                      Priority reasoning: {selected.ai.priorityReasoning}
                    </p>
                  ) : null}
                  {selected.ai.status === "PENDING" ? (
                    <p className="portal-muted">
                      Triage is running automatically; recommendations appear
                      here once the AI finishes.
                    </p>
                  ) : null}
                </>
              ) : null}
              {selected.ai?.suggestedCategory &&
              selected.ai?.suggestedPriority ? (
                <button
                  className="portal-button portal-button--plain"
                  type="button"
                  disabled={isPending("ai-apply")}
                  onClick={() => void applyAiSuggestion()}
                >
                  Apply AI suggestion
                </button>
              ) : null}
              <button
                className="portal-button"
                disabled={isPending("ai-draft")}
                onClick={() => void getDraft()}
              >
                {isPending("ai-draft") ? (
                  <>
                    <span
                      className="portal-admin-generating-indicator"
                      aria-hidden="true"
                    />
                    Generating draft…
                  </>
                ) : draftError || selected.ai?.status === "FAILED" ? (
                  "Try AI again"
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
                    AI-assisted draft. Edit it freely — it is never sent
                    automatically.
                  </p>
                  <button
                    type="button"
                    className="portal-button"
                    onClick={useDraftAsReply}
                  >
                    Use as public reply
                  </button>
                </form>
              ) : null}
            </section>
          </aside>
        </section>
      ) : null}
    </main>
  );
}
