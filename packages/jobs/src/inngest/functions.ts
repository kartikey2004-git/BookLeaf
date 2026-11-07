import { prisma } from "@repo/database";
import {
  AI_PROMPT_VERSION,
  applyPriorityFloor,
  completeJson,
  triagePrompt,
  triageSchema,
} from "@repo/ai";
import { z } from "zod";
import { getJobsEnvironment } from "../config/env.js";
import { jobsLog } from "../lib/logger.js";
import { inngest } from "./client.js";

const environment = getJobsEnvironment();
const ticketCreatedEventSchema = z.object({
  ticketId: z.string().min(1).max(255),
});
const MAX_AI_ATTEMPTS = 5;

export async function claimTicketForAi(ticketId: string): Promise<boolean> {
  const claim = await prisma.ticket.updateMany({
    where: {
      id: ticketId,
      aiStatus: { in: ["PENDING", "FAILED"] },
      aiAttempts: { lt: MAX_AI_ATTEMPTS },
    },
    data: {
      aiStatus: "PROCESSING",
      aiAttempts: { increment: 1 },
      aiError: null,
    },
  });
  return claim.count === 1;
}

async function processTicket(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, subject: true, description: true, aiStatus: true },
  });
  if (!ticket || ticket.aiStatus === "COMPLETED") {
    jobsLog("info", "ticket_ai_skipped", {
      ticketId,
      reason: "complete_or_missing",
    });
    return { skipped: true };
  }
  if (!environment.GEMINI_API_KEY)
    throw new Error("GEMINI_API_KEY is required to process AI tickets");
  if (!(await claimTicketForAi(ticketId))) {
    jobsLog("info", "ticket_ai_skipped", { ticketId, reason: "not_claimed" });
    return { skipped: true };
  }
  const text = `Subject: ${ticket.subject}\nDescription: ${ticket.description}`;
  try {
    const config = {
      apiKey: environment.GEMINI_API_KEY,
      model: environment.GEMINI_MODEL,
      timeoutMs: environment.GEMINI_TIMEOUT_MS,
    };
    const triage = await completeJson(config, triagePrompt(text), triageSchema);
    const suggestedPriority = applyPriorityFloor(
      triage.classification.category,
      triage.priority.priority,
    );
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        aiSuggestedCategory: triage.classification.category,
        aiSuggestedPriority: suggestedPriority,
        aiClassificationConfidence: triage.classification.confidence,
        aiPriorityConfidence: triage.priority.confidence,
        aiClassificationReasoning: triage.classification.reasoning,
        aiPriorityReasoning: triage.priority.reasoning,
        aiKnowledgeSections: triage.classification.sections,
        aiStatus: "COMPLETED",
        aiProvider: "google-gemini",
        aiModel: environment.GEMINI_MODEL,
        aiPromptVersion: AI_PROMPT_VERSION,
        aiProcessedAt: new Date(),
        aiError: null,
      },
    });
    jobsLog("info", "ticket_ai_completed", { ticketId });
    return { processed: true };
  } catch (error) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        aiStatus: "FAILED",
        aiError:
          error instanceof Error
            ? error.message.slice(0, 500)
            : "AI processing failed",
      },
    });
    jobsLog("error", "ticket_ai_failed", { ticketId });
    throw error;
  }
}

export const processTicketCreated = inngest.createFunction(
  { id: "process-ticket-ai", retries: 2, concurrency: 2 },
  { event: "bookleaf/ticket.created" },
  async ({ event, logger, step }) => {
    const { ticketId } = ticketCreatedEventSchema.parse(event.data);
    logger.info({ ticketId }, "processing ticket AI recommendations");
    return step.run("process-ticket", () => processTicket(ticketId));
  },
);

export const recoverPendingTicketAi = inngest.createFunction(
  { id: "recover-pending-ticket-ai", retries: 1 },
  { cron: "*/10 * * * *" },
  async ({ logger, step }) => {
    const pending = await prisma.ticket.findMany({
      where: {
        aiStatus: { in: ["PENDING", "FAILED"] },
        aiAttempts: { lt: MAX_AI_ATTEMPTS },
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: 25,
    });
    for (const ticket of pending) {
      await step.run(`process-ticket-${ticket.id}`, () =>
        processTicket(ticket.id),
      );
    }
    logger.info({ count: pending.length }, "recovered pending ticket AI work");
    return { recovered: pending.length };
  },
);

export const infrastructureHeartbeat = inngest.createFunction(
  { id: "infrastructure-heartbeat", retries: 2 },
  { event: "foundation/heartbeat.requested" },
  async ({ event, logger }) => {
    logger.info({ eventId: event.id }, "received infrastructure heartbeat");
    return { receivedAt: new Date().toISOString() };
  },
);

export const functions = [
  infrastructureHeartbeat,
  processTicketCreated,
  recoverPendingTicketAi,
];
