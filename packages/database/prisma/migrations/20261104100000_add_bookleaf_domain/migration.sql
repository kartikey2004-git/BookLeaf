-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "joinedDate" DATE NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "publicationDate" DATE,
    "publicationStatus" TEXT NOT NULL,
    "mrp" DECIMAL(12,2),
    "royaltyPerCopy" DECIMAL(12,2),
    "totalCopiesSold" INTEGER NOT NULL,
    "totalRoyaltyEarned" DECIMAL(14,2) NOT NULL,
    "royaltyPaid" DECIMAL(14,2) NOT NULL,
    "royaltyPending" DECIMAL(14,2) NOT NULL,
    "lastRoyaltyPayoutDate" DATE,
    "printPartner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookDistribution" (
    "bookId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookDistribution_pkey" PRIMARY KEY ("bookId","platformId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_externalId_key" ON "Author"("externalId");
CREATE UNIQUE INDEX "Author_email_key" ON "Author"("email");
CREATE UNIQUE INDEX "Author_userId_key" ON "Author"("userId");
CREATE INDEX "Author_userId_idx" ON "Author"("userId");
CREATE UNIQUE INDEX "Book_externalId_key" ON "Book"("externalId");
CREATE INDEX "Book_authorId_idx" ON "Book"("authorId");
CREATE INDEX "Book_publicationStatus_idx" ON "Book"("publicationStatus");
CREATE UNIQUE INDEX "Platform_name_key" ON "Platform"("name");
CREATE INDEX "BookDistribution_platformId_idx" ON "BookDistribution"("platformId");

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Book" ADD CONSTRAINT "Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BookDistribution" ADD CONSTRAINT "BookDistribution_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookDistribution" ADD CONSTRAINT "BookDistribution_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
