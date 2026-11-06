"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Paperclip, X } from "lucide-react";
import {
  apiFetch,
  isUnauthorizedError,
  redirectToSignIn,
  userFacingErrorMessage,
} from "../../../lib/api-client";
import { usePortalToast } from "./portal-toast";

const AUTHOR_TICKET_PAGE_SIZE = 20;
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

type Overview = {
  totalBooks: number;
  publishedBooks: number;
  booksInProduction: number;
  totalRoyaltyEarned: string;
  totalRoyaltyPaid: string;
  totalRoyaltyPending: string;
};

function badgeClass(value: string): string {
  return `portal-badge portal-badge--${value.toLowerCase().replaceAll("_", "-")}`;
}

function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

type Book = { id: string; title: string };

type Ticket = {
  id: string;
  reference: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  messages?: {
    id: string;
    content: string;
    sender: { name: string; role: string };
    createdAt: string;
  }[];
};

type PendingAttachment = {
  publicId: string;
  secureUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
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
  const [attachment, setAttachment] = useState<File | null>(null);
  const [pendingAttachment, setPendingAttachment] =
    useState<PendingAttachment | null>(null);
  const [page, setPage] = useState(1);
  const [ticketsTotal, setTicketsTotal] = useState(0);
  const [liveUpdates, setLiveUpdates] = useState<
    "connecting" | "live" | "paused"
  >("connecting");
  const selectionRequest = useRef(0);
  const selectedTicketIdRef = useRef<string | null>(null);
  const pageRef = useRef(page);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notify } = usePortalToast();

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };

    Promise.all([
      apiFetch<{ overview: Overview }>("/api/v1/author/overview", options),
      apiFetch<{ books: Book[] }>("/api/v1/author/books?pageSize=50", options),
      apiFetch<{
        tickets: Ticket[];
        pagination?: { page: number; pageSize: number; total: number };
      }>(
        `/api/v1/author/tickets?page=${pageRef.current}&pageSize=${AUTHOR_TICKET_PAGE_SIZE}`,
        options,
      ),
    ])
      .then(async ([overviewResponse, booksResponse, ticketsResponse]) => {
        setOverview(overviewResponse.overview);
        setBooks(booksResponse.books);
        setTickets(ticketsResponse.tickets);
        setTicketsTotal(
          ticketsResponse.pagination?.total ?? ticketsResponse.tickets.length,
        );
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          if (isUnauthorizedError(cause)) {
            redirectToSignIn();
            return;
          }
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

  useEffect(() => {
    selectedTicketIdRef.current = selectedTicketId;
  }, [selectedTicketId]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    const source = new EventSource("/api/v1/author/tickets/stream");
    const sync = () => {
      void (async () => {
        try {
          const list = await apiFetch<{
            tickets: Ticket[];
            pagination?: { page: number; pageSize: number; total: number };
          }>(
            `/api/v1/author/tickets?page=${pageRef.current}&pageSize=${AUTHOR_TICKET_PAGE_SIZE}`,
          );
          setTickets(list.tickets);
          setTicketsTotal(list.pagination?.total ?? list.tickets.length);
          const openId = selectedTicketIdRef.current;
          if (openId) {
            try {
              const detail = await apiFetch<{ ticket: Ticket }>(
                `/api/v1/author/tickets/${openId}`,
              );
              setSelectedTicket(detail.ticket);
            } catch {
              // Keep the current view if the detail refresh hiccups.
            }
          }
        } catch {
          // Transient failure; the next event resyncs.
        }
      })();
    };
    source.addEventListener("ticket.updated", sync);
    source.addEventListener("connected", () => setLiveUpdates("live"));
    source.addEventListener("open", () => setLiveUpdates("live"));
    source.addEventListener("error", () => {
      if (source.readyState === EventSource.CLOSED) {
        setLiveUpdates("paused");
      }
    });
    return () => source.close();
  }, []);

  async function refreshTickets() {
    const response = await apiFetch<{
      tickets: Ticket[];
      pagination?: { page: number; pageSize: number; total: number };
    }>(
      `/api/v1/author/tickets?page=${pageRef.current}&pageSize=${AUTHOR_TICKET_PAGE_SIZE}`,
    );
    setTickets(response.tickets);
    setTicketsTotal(response.pagination?.total ?? response.tickets.length);
  }

  function clearAttachment() {
    setAttachment(null);
    setPendingAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadAttachment(
    file: File,
  ): Promise<PendingAttachment | null> {
    try {
      const target = await apiFetch<{
        uploadUrl: string;
        uploadPreset: string;
        cloudName: string;
      }>("/api/v1/author/tickets/attachments/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      });
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", target.uploadPreset);
      const uploadResponse = await fetch(target.uploadUrl, {
        method: "POST",
        body: form,
      });
      if (!uploadResponse.ok) return null;
      const uploaded = (await uploadResponse.json()) as {
        publicId?: string;
        secureUrl?: string;
      };
      if (!uploaded.publicId || !uploaded.secureUrl) return null;
      const created: PendingAttachment = {
        publicId: uploaded.publicId,
        secureUrl: uploaded.secureUrl,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      };
      setPendingAttachment(created);
      return created;
    } catch {
      return null;
    }
  }

  async function selectTicket(ticketId: string) {
    const request = ++selectionRequest.current;
    selectedTicketIdRef.current = ticketId;
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
        if (isUnauthorizedError(cause)) {
          redirectToSignIn();
          return;
        }
        notify(
          "error",
          userFacingErrorMessage(cause, "Could not load this ticket."),
        );
        setSelectedTicketId(null);
        selectedTicketIdRef.current = null;
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
      const created = await apiFetch<{ ticket: Ticket }>(
        "/api/v1/author/tickets",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            description,
            bookId: String(form.get("bookId") || "") || undefined,
          }),
        },
      );
      if (attachment) {
        const uploaded = await uploadAttachment(attachment);
        if (uploaded) {
          await apiFetch(
            `/api/v1/author/tickets/${created.ticket.id}/attachments`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                publicId: uploaded.publicId,
                secureUrl: uploaded.secureUrl,
                fileName: uploaded.fileName,
                mimeType: uploaded.mimeType,
                size: uploaded.size,
              }),
            },
          );
        }
      }
      formElement.reset();
      clearAttachment();
      notify("success", "Ticket created.");

      try {
        await refreshTickets();
      } catch {
        notify(
          "error",
          "Ticket created, but the ticket list could not be refreshed.",
        );
      }
    } catch (cause) {
      if (isUnauthorizedError(cause)) {
        redirectToSignIn();
        return;
      }
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
    const content = String(
      new FormData(formElement).get("content") ?? "",
    ).trim();
    if (!content) return;

    setReplying(true);
    try {
      await apiFetch(`/api/v1/author/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
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
      if (isUnauthorizedError(cause)) {
        redirectToSignIn();
        return;
      }
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
            <span className="portal-stat">₹{overview.totalRoyaltyEarned}</span>
            <p>Royalty earned</p>
          </article>
          <article className="portal-card">
            <span className="portal-stat">₹{overview.totalRoyaltyPaid}</span>
            <p>Royalty paid</p>
          </article>
          <article className="portal-card">
            <span className="portal-stat">₹{overview.totalRoyaltyPending}</span>
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
          {liveUpdates === "live" ? (
            <span className="portal-live" role="status">
              <span className="portal-live-dot" aria-hidden="true" />
              Live
            </span>
          ) : liveUpdates === "paused" ? (
            <span className="portal-live portal-live--paused" role="status">
              Updates paused
            </span>
          ) : null}
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
              <div className="portal-attachment">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="ticket-attachment"
                  name="attachment"
                  className="portal-attachment-input"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.md"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file && file.size > MAX_ATTACHMENT_SIZE_BYTES) {
                      notify("error", "Attachment must be 10 MB or smaller.");
                      event.target.value = "";
                      setAttachment(null);
                      return;
                    }
                    setAttachment(file);
                  }}
                />
                <div className="portal-attachment-row">
                  <label
                    htmlFor="ticket-attachment"
                    className="portal-attachment-button"
                  >
                    <Paperclip aria-hidden="true" />
                    {attachment ? "Change file" : "Attach a file"}
                  </label>
                  {attachment ? (
                    <span className="portal-attachment-chip">
                      <span
                        className="portal-attachment-name"
                        title={attachment.name}
                      >
                        {attachment.name}
                      </span>
                      <span className="portal-attachment-size">
                        {formatFileSize(attachment.size)}
                      </span>
                      {pendingAttachment ? (
                        <span className="portal-attachment-status">
                          Uploading…
                        </span>
                      ) : null}
                      <button
                        type="button"
                        className="portal-attachment-remove"
                        aria-label="Remove attachment"
                        onClick={clearAttachment}
                      >
                        <X aria-hidden="true" />
                      </button>
                    </span>
                  ) : (
                    <span
                      id="attachment-hint"
                      className="portal-attachment-hint"
                    >
                      Optional — PDF, Word, image or text, up to 10 MB
                    </span>
                  )}
                </div>
              </div>
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
                        <span className={badgeClass(ticket.status)}>
                          {ticket.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td>
                        <span className={badgeClass(ticket.priority)}>
                          {ticket.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="portal-support-empty">No support requests yet.</p>
            )}
            {ticketsTotal > tickets.length ? (
              <nav
                className="portal-pagination"
                aria-label="Ticket list pagination"
              >
                <span>
                  Page {page} of{" "}
                  {Math.max(
                    1,
                    Math.ceil(ticketsTotal / AUTHOR_TICKET_PAGE_SIZE),
                  )}{" "}
                  · {ticketsTotal} tickets
                </span>
                <span className="portal-pagination-controls">
                  <button
                    type="button"
                    className="portal-pagination-button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="portal-pagination-button"
                    disabled={page * AUTHOR_TICKET_PAGE_SIZE >= ticketsTotal}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          Math.max(
                            1,
                            Math.ceil(ticketsTotal / AUTHOR_TICKET_PAGE_SIZE),
                          ),
                          current + 1,
                        ),
                      )
                    }
                  >
                    Next
                  </button>
                </span>
              </nav>
            ) : null}
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
                <p className="portal-muted">
                  Updated{" "}
                  {selectedTicket.updatedAt
                    ? new Date(selectedTicket.updatedAt).toLocaleString()
                    : "—"}
                </p>
              </div>
              <span className={badgeClass(selectedTicket.status)}>
                {selectedTicket.status.replaceAll("_", " ")}
              </span>
            </header>
            <p>{selectedTicket.description}</p>
            {selectedTicket.messages?.map((message) => (
              <article className="portal-message" key={message.id}>
                <strong>{message.sender.name}</strong>
                <p>{message.content}</p>
              </article>
            ))}
            {["OPEN", "IN_PROGRESS"].includes(selectedTicket.status) ? (
              <form
                className="portal-form portal-reply-form"
                onSubmit={replyToTicket}
              >
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
