CREATE TYPE "AiProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
ALTER TABLE "Ticket"
  ADD COLUMN "aiSuggestedCategory" "TicketCategory",
  ADD COLUMN "aiSuggestedPriority" "TicketPriority",
  ADD COLUMN "aiClassificationConfidence" DOUBLE PRECISION,
  ADD COLUMN "aiPriorityConfidence" DOUBLE PRECISION,
  ADD COLUMN "aiClassificationReasoning" TEXT,
  ADD COLUMN "aiPriorityReasoning" TEXT,
  ADD COLUMN "aiKnowledgeSections" JSONB,
  ADD COLUMN "aiStatus" "AiProcessingStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "aiProvider" TEXT,
  ADD COLUMN "aiModel" TEXT,
  ADD COLUMN "aiPromptVersion" TEXT,
  ADD COLUMN "aiProcessedAt" TIMESTAMP(3),
  ADD COLUMN "aiError" TEXT,
  ADD COLUMN "aiAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "categoryOverriddenAt" TIMESTAMP(3),
  ADD COLUMN "priorityOverriddenAt" TIMESTAMP(3);
CREATE INDEX "Ticket_aiStatus_idx" ON "Ticket"("aiStatus");
