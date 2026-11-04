CREATE TYPE "TicketCategory" AS ENUM (
  'ROYALTY_AND_PAYMENTS',
  'ISBN_AND_METADATA',
  'PRINTING_AND_QUALITY',
  'DISTRIBUTION_AND_AVAILABILITY',
  'BOOK_STATUS_AND_PRODUCTION',
  'GENERAL_INQUIRY'
);

CREATE TYPE "TicketPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "TicketAuditAction" AS ENUM (
  'CREATED',
  'STATUS_CHANGED',
  'PRIORITY_CHANGED',
  'CATEGORY_CHANGED',
  'ASSIGNMENT_CHANGED',
  'ADMIN_MESSAGE_CREATED',
  'AUTHOR_MESSAGE_CREATED',
  'INTERNAL_NOTE_CREATED'
);

CREATE TABLE "Ticket" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "bookId" TEXT,
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" "TicketCategory" NOT NULL DEFAULT 'GENERAL_INQUIRY',
  "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
  "assignedAdminId" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketMessage" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "senderUserId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "editedAt" TIMESTAMP(3),
  CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketInternalNote" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketInternalNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketAuditEvent" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "action" "TicketAuditAction" NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Ticket_reference_key" ON "Ticket"("reference");
CREATE INDEX "Ticket_authorId_createdAt_idx" ON "Ticket"("authorId", "createdAt");
CREATE INDEX "Ticket_bookId_idx" ON "Ticket"("bookId");
CREATE INDEX "Ticket_status_priority_createdAt_idx" ON "Ticket"("status", "priority", "createdAt");
CREATE INDEX "Ticket_assignedAdminId_status_createdAt_idx" ON "Ticket"("assignedAdminId", "status", "createdAt");
CREATE INDEX "TicketMessage_ticketId_createdAt_idx" ON "TicketMessage"("ticketId", "createdAt");
CREATE INDEX "TicketMessage_senderUserId_idx" ON "TicketMessage"("senderUserId");
CREATE INDEX "TicketInternalNote_ticketId_createdAt_idx" ON "TicketInternalNote"("ticketId", "createdAt");
CREATE INDEX "TicketInternalNote_adminUserId_idx" ON "TicketInternalNote"("adminUserId");
CREATE INDEX "TicketAuditEvent_ticketId_createdAt_idx" ON "TicketAuditEvent"("ticketId", "createdAt");
CREATE INDEX "TicketAuditEvent_actorUserId_idx" ON "TicketAuditEvent"("actorUserId");

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TicketInternalNote" ADD CONSTRAINT "TicketInternalNote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketInternalNote" ADD CONSTRAINT "TicketInternalNote_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TicketAuditEvent" ADD CONSTRAINT "TicketAuditEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketAuditEvent" ADD CONSTRAINT "TicketAuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
