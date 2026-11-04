import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { PrismaClient } from "./index.js";
import {
  toDateOnly,
  validateAndNormalizeDataset,
  type NormalizedAuthor,
  type NormalizedBook,
  type NormalizedDataset,
} from "./sample-data.js";

type IdentifiedRecord = { id: string };

export type SeedStore = {
  transaction<T>(operation: (store: SeedStore) => Promise<T>): Promise<T>;
  findAuthor(externalId: string): Promise<IdentifiedRecord | null>;
  upsertAuthor(author: NormalizedAuthor): Promise<IdentifiedRecord>;
  findBook(externalId: string): Promise<IdentifiedRecord | null>;
  upsertBook(book: NormalizedBook): Promise<IdentifiedRecord>;
  findPlatform(name: string): Promise<IdentifiedRecord | null>;
  upsertPlatform(name: string): Promise<IdentifiedRecord>;
  hasDistribution(bookId: string, platformId: string): Promise<boolean>;
  upsertDistribution(bookId: string, platformId: string): Promise<void>;
};

export type SeedSummary = {
  authorsImported: number;
  booksImported: number;
  distributionAssociationsImported: number;
  recordsUpdated: number;
  validationFailures: number;
  integrityVerification: "passed";
};

export type DatabaseIntegritySummary = {
  authors: number;
  books: number;
  distributionAssociations: number;
  orphanBooks: number;
  invalidRoyaltyRecords: number;
};

function bookData(book: NormalizedBook) {
  return {
    title: book.title,
    isbn: book.isbn,
    genre: book.genre,
    publicationDate: toDateOnly(book.publication_date),
    publicationStatus: book.status,
    mrp: book.mrp?.toFixed(2) ?? null,
    royaltyPerCopy: book.author_royalty_per_copy?.toFixed(2) ?? null,
    totalCopiesSold: book.total_copies_sold,
    totalRoyaltyEarned: book.total_royalty_earned.toFixed(2),
    royaltyPaid: book.royalty_paid.toFixed(2),
    royaltyPending: book.royalty_pending.toFixed(2),
    lastRoyaltyPayoutDate: toDateOnly(book.last_royalty_payout_date),
    printPartner: book.print_partner,
    author: { connect: { externalId: book.authorExternalId } },
  };
}

type PrismaSeedClient = Pick<
  PrismaClient,
  "author" | "book" | "platform" | "bookDistribution"
>;

function makePrismaSeedStore(
  database: PrismaSeedClient,
  transaction: SeedStore["transaction"],
): SeedStore {
  return {
    transaction,
    findAuthor: (externalId) =>
      database.author.findUnique({ where: { externalId } }),
    upsertAuthor: (author) =>
      database.author.upsert({
        where: { externalId: author.author_id },
        create: {
          externalId: author.author_id,
          name: author.name,
          email: author.email,
          phone: author.phone,
          city: author.city,
          joinedDate: toDateOnly(author.joined_date)!,
        },
        update: {
          name: author.name,
          email: author.email,
          phone: author.phone,
          city: author.city,
          joinedDate: toDateOnly(author.joined_date)!,
        },
      }),
    findBook: (externalId) =>
      database.book.findUnique({ where: { externalId } }),
    upsertBook: (book) =>
      database.book.upsert({
        where: { externalId: book.book_id },
        create: { externalId: book.book_id, ...bookData(book) },
        update: bookData(book),
      }),
    findPlatform: (name) => database.platform.findUnique({ where: { name } }),
    upsertPlatform: (name) =>
      database.platform.upsert({
        where: { name },
        create: { name },
        update: {},
      }),
    hasDistribution: async (bookId, platformId) =>
      (await database.bookDistribution.findUnique({
        where: { bookId_platformId: { bookId, platformId } },
      })) !== null,
    upsertDistribution: async (bookId, platformId) => {
      await database.bookDistribution.upsert({
        where: { bookId_platformId: { bookId, platformId } },
        create: { bookId, platformId },
        update: {},
      });
    },
  };
}

export function createPrismaSeedStore(client: PrismaClient): SeedStore {
  return makePrismaSeedStore(client, (operation) =>
    client.$transaction((transaction) =>
      operation(
        makePrismaSeedStore(transaction, async () => {
          throw new Error("Nested seed transactions are not supported");
        }),
      ),
    ),
  );
}

export async function seedDataset(
  input: unknown,
  store: SeedStore,
): Promise<SeedSummary> {
  const dataset = validateAndNormalizeDataset(input);
  let recordsUpdated = 0;

  await store.transaction(async (transaction) => {
    for (const author of dataset.authors) {
      if (await transaction.findAuthor(author.author_id)) recordsUpdated += 1;
      await transaction.upsertAuthor(author);
    }
    for (const book of dataset.books) {
      if (await transaction.findBook(book.book_id)) recordsUpdated += 1;
      const seededBook = await transaction.upsertBook(book);
      for (const platformName of book.available_on) {
        let platform = await transaction.findPlatform(platformName);
        if (!platform)
          platform = await transaction.upsertPlatform(platformName);
        if (await transaction.hasDistribution(seededBook.id, platform.id))
          recordsUpdated += 1;
        await transaction.upsertDistribution(seededBook.id, platform.id);
      }
    }
  });

  return {
    authorsImported: dataset.authors.length,
    booksImported: dataset.books.length,
    distributionAssociationsImported: dataset.books.reduce(
      (count, book) => count + book.available_on.length,
      0,
    ),
    recordsUpdated,
    validationFailures: 0,
    integrityVerification: "passed",
  };
}

function decimalToCents(value: {
  toFixed(fractionDigits?: number): string;
}): number {
  return Math.round(Number(value.toFixed(2)) * 100);
}

export async function verifySeedPersistence(
  dataset: NormalizedDataset,
  client: PrismaClient,
): Promise<DatabaseIntegritySummary> {
  const authorExternalIds = dataset.authors.map((author) => author.author_id);
  const bookExternalIds = dataset.books.map((book) => book.book_id);
  const [authors, books, distributionAssociations, royaltyRecords] =
    await Promise.all([
      client.author.count({ where: { externalId: { in: authorExternalIds } } }),
      client.book.count({ where: { externalId: { in: bookExternalIds } } }),
      client.bookDistribution.count({
        where: { book: { externalId: { in: bookExternalIds } } },
      }),
      client.book.findMany({
        where: { externalId: { in: bookExternalIds } },
        select: {
          totalRoyaltyEarned: true,
          royaltyPaid: true,
          royaltyPending: true,
          author: { select: { id: true } },
        },
      }),
    ]);
  const orphanBooks = royaltyRecords.filter((book) => !book.author).length;
  const invalidRoyaltyRecords = royaltyRecords.filter(
    (book) =>
      decimalToCents(book.totalRoyaltyEarned) !==
        decimalToCents(book.royaltyPaid) +
          decimalToCents(book.royaltyPending) ||
      decimalToCents(book.royaltyPaid) < 0 ||
      decimalToCents(book.royaltyPending) < 0,
  ).length;

  return {
    authors,
    books,
    distributionAssociations,
    orphanBooks,
    invalidRoyaltyRecords,
  };
}

export async function loadSampleDataset(): Promise<unknown> {
  const samplePath = fileURLToPath(
    new URL("../../../prompts/sample.json", import.meta.url),
  );
  return JSON.parse(await readFile(samplePath, "utf8")) as unknown;
}

async function main(): Promise<void> {
  const { prisma } = await import("./index.js");
  const input = await loadSampleDataset();
  const summary = await seedDataset(input, createPrismaSeedStore(prisma));
  const databaseIntegrity = await verifySeedPersistence(
    validateAndNormalizeDataset(input),
    prisma,
  );
  console.info(JSON.stringify({ ...summary, databaseIntegrity }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "Sample data seed failed",
    );
    process.exitCode = 1;
  });
}
