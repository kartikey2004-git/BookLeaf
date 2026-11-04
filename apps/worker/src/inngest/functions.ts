import { inngest } from "./client.js";
import { prisma } from "@repo/database";
import {
  AI_PROMPT_VERSION,
  classificationPrompt,
  classificationSchema,
  completeJson,
  priorityPrompt,
  prioritySchema,
} from "@repo/ai";
import { getWorkerEnvironment } from "../config/env.js";

const environment = getWorkerEnvironment();

async function processTicket(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, subject: true, description: true, aiStatus: true },
  });
  if (!ticket || ticket.aiStatus === "COMPLETED") return { skipped: true };
  if (!environment.GEMINI_API_KEY)
    throw new Error("GEMINI_API_KEY is required to process AI tickets");
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      aiStatus: "PROCESSING",
      aiAttempts: { increment: 1 },
      aiError: null,
    },
  });
  const text = `Subject: ${ticket.subject}\nDescription: ${ticket.description}`;
  try {
    const config = {
      apiKey: environment.GEMINI_API_KEY,
      model: environment.GEMINI_MODEL,
      timeoutMs: environment.GEMINI_TIMEOUT_MS,
    };
    const [classification, priority] = await Promise.all([
      completeJson(config, classificationPrompt(text), classificationSchema),
      completeJson(config, priorityPrompt(text), prioritySchema),
    ]);
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        aiSuggestedCategory: classification.category,
        aiSuggestedPriority: priority.priority,
        aiClassificationConfidence: classification.confidence,
        aiPriorityConfidence: priority.confidence,
        aiClassificationReasoning: classification.reasoning,
        aiPriorityReasoning: priority.reasoning,
        aiKnowledgeSections: classification.sections,
        aiStatus: "COMPLETED",
        aiProvider: "google-gemini",
        aiModel: environment.GEMINI_MODEL,
        aiPromptVersion: AI_PROMPT_VERSION,
        aiProcessedAt: new Date(),
        aiError: null,
      },
    });
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
    throw error;
  }
}

export const processTicketCreated = inngest.createFunction(
  { id: "process-ticket-ai", retries: 2 },
  { event: "bookleaf/ticket.created" },
  async ({ event, logger }) => {
    logger.info(
      { ticketId: event.data.ticketId },
      "processing ticket AI recommendations",
    );
    return processTicket(event.data.ticketId);
  },
);

export const recoverPendingTicketAi = inngest.createFunction(
  { id: "recover-pending-ticket-ai", retries: 1 },
  { cron: "*/10 * * * *" },
  async ({ logger }) => {
    const pending = await prisma.ticket.findMany({
      where: { aiStatus: "PENDING" },
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: 25,
    });
    for (const ticket of pending) await processTicket(ticket.id);
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
