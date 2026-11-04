import { z } from "@repo/validation";

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const moneySchema = z
  .number()
  .finite()
  .nonnegative()
  .refine((value) => Number.isInteger(value * 100), "must have at most two decimal places");

const bookSchema = z.object({
  book_id: z.string().min(1),
  title: z.string().min(1),
  isbn: z.string().min(1),
  genre: z.string().min(1),
  publication_date: dateOnlySchema.nullable(),
  status: z.string().min(1),
  mrp: moneySchema.nullable(),
  author_royalty_per_copy: moneySchema.nullable(),
  total_copies_sold: z.number().int().nonnegative(),
  total_royalty_earned: moneySchema,
  royalty_paid: moneySchema,
  royalty_pending: moneySchema,
  last_royalty_payout_date: dateOnlySchema.nullable(),
  print_partner: z.string().min(1).nullable(),
  available_on: z.array(z.string().min(1)),
});

const datasetSchema = z.object({
  authors: z.array(
    z.object({
      author_id: z.string().min(1),
      name: z.string().min(1),
      email: z.email(),
      phone: z.string().min(1),
      city: z.string().min(1),
      joined_date: dateOnlySchema,
      books: z.array(bookSchema),
    }),
  ),
});

export type BookLeafDataset = z.infer<typeof datasetSchema>;
export type NormalizedAuthor = Omit<BookLeafDataset["authors"][number], "books">;
export type NormalizedBook = BookLeafDataset["authors"][number]["books"][number] & {
  authorExternalId: string;
};

export type NormalizedDataset = {
  authors: NormalizedAuthor[];
  books: NormalizedBook[];
};

export class DatasetIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatasetIntegrityError";
  }
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function assertUnique(values: string[], label: string): void {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length > 0) {
    throw new DatasetIntegrityError(`Duplicate ${label}: ${duplicates[0]}`);
  }
}

export function validateAndNormalizeDataset(input: unknown): NormalizedDataset {
  const parsed = datasetSchema.parse(input);
  const authors = parsed.authors.map(({ books: _books, ...author }) => author);
  const books = parsed.authors.flatMap((author) =>
    author.books.map((book) => ({ ...book, authorExternalId: author.author_id })),
  );

  assertDatasetIntegrity({ authors, books });

  return { authors, books };
}

export function assertDatasetIntegrity({ authors, books }: NormalizedDataset): void {
  assertUnique(authors.map((author) => author.author_id), "author external ID");
  assertUnique(authors.map((author) => author.email), "author email");
  assertUnique(books.map((book) => book.book_id), "book external ID");

  for (const book of books) {
    if (!authors.some((author) => author.author_id === book.authorExternalId)) {
      throw new DatasetIntegrityError(`Missing author for book ${book.book_id}`);
    }
    if (toCents(book.total_royalty_earned) !== toCents(book.royalty_paid) + toCents(book.royalty_pending)) {
      throw new DatasetIntegrityError(`Royalty reconciliation failed for book ${book.book_id}`);
    }
    if (
      book.author_royalty_per_copy !== null &&
      toCents(book.total_royalty_earned) !==
        toCents(book.author_royalty_per_copy) * book.total_copies_sold
    ) {
      throw new DatasetIntegrityError(`Royalty per-copy reconciliation failed for book ${book.book_id}`);
    }
    if (book.author_royalty_per_copy === null && book.total_copies_sold > 0) {
      throw new DatasetIntegrityError(`Missing royalty per copy for sold book ${book.book_id}`);
    }
    assertUnique(book.available_on, `platform for book ${book.book_id}`);
  }
}

export function toDateOnly(value: string | null): Date | null {
  return value === null ? null : new Date(`${value}T00:00:00.000Z`);
}
