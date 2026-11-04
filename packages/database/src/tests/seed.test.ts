import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  assertDatasetIntegrity,
  DatasetIntegrityError,
  validateAndNormalizeDataset,
} from "../sample-data.js";
import { seedDataset, type SeedStore } from "../seed.js";

type Record = { id: string };

function createStore(): SeedStore & { counts: () => [number, number, number] } {
  const authors = new Map<string, Record>();
  const books = new Map<string, Record>();
  const platforms = new Map<string, Record>();
  const distributions = new Map<string, Record>();
  let nextId = 1;
  const record = (): Record => ({ id: String(nextId++) });
  const store: SeedStore = {
    transaction: (operation) => operation(store),
    findAuthor: async (externalId) => authors.get(externalId) ?? null,
    upsertAuthor: async (author) => {
      const current = authors.get(author.author_id) ?? record();
      authors.set(author.author_id, current);
      return current;
    },
    findBook: async (externalId) => books.get(externalId) ?? null,
    upsertBook: async (book) => {
      const current = books.get(book.book_id) ?? record();
      books.set(book.book_id, current);
      return current;
    },
    findPlatform: async (name) => platforms.get(name) ?? null,
    upsertPlatform: async (name) => {
      const current = platforms.get(name) ?? record();
      platforms.set(name, current);
      return current;
    },
    hasDistribution: async (bookId, platformId) => distributions.has(`${bookId}:${platformId}`),
    upsertDistribution: async (bookId, platformId) => {
      const key = `${bookId}:${platformId}`;
      const current = distributions.get(key) ?? record();
      distributions.set(key, current);
    },
  };

  return {
    ...store,
    counts: () => [authors.size, books.size, distributions.size],
  };
}

async function readDataset(): Promise<unknown> {
  const path = fileURLToPath(new URL("../../../../prompts/sample.json", import.meta.url));
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

describe("BookLeaf sample-data seed", () => {
  it("validates and normalizes all source records", async () => {
    const normalized = validateAndNormalizeDataset(await readDataset());
    expect(normalized.authors).toHaveLength(10);
    expect(normalized.books).toHaveLength(18);
    expect(normalized.books.find((book) => book.book_id === "BK001")?.authorExternalId).toBe("AUTH001");
  });

  it("rejects duplicate external identifiers", async () => {
    const data = (await readDataset()) as { authors: Array<{ author_id: string }> };
    data.authors[1]!.author_id = data.authors[0]!.author_id;
    expect(() => validateAndNormalizeDataset(data)).toThrow("Duplicate author external ID");
  });

  it("rejects missing author references and royalty discrepancies", async () => {
    const normalized = validateAndNormalizeDataset(await readDataset());
    normalized.books[0]!.authorExternalId = "MISSING";
    expect(() => assertDatasetIntegrity(normalized)).toThrow(DatasetIntegrityError);

    normalized.books[0]!.authorExternalId = "AUTH001";
    normalized.books[0]!.royalty_pending += 1;
    expect(() => assertDatasetIntegrity(normalized)).toThrow("Royalty reconciliation failed");
  });

  it("is idempotent and preserves author-book and platform mappings", async () => {
    const store = createStore();
    const input = await readDataset();
    const first = await seedDataset(input, store);
    const second = await seedDataset(input, store);

    expect(first).toMatchObject({
      authorsImported: 10,
      booksImported: 18,
      distributionAssociationsImported: 46,
      recordsUpdated: 0,
      integrityVerification: "passed",
    });
    expect(second.recordsUpdated).toBe(74);
    expect(store.counts()).toEqual([10, 18, 46]);
  });

  it("does not remove unrelated records", async () => {
    const store = createStore();
    const normalized = validateAndNormalizeDataset(await readDataset());
    const existingAuthor = normalized.authors[0]!;
    await store.upsertAuthor({
      ...existingAuthor,
      author_id: "USER_AUTH_001",
      email: "unrelated.author@example.com",
    });

    await seedDataset(await readDataset(), store);
    expect(store.counts()).toEqual([11, 18, 46]);
  });
});
