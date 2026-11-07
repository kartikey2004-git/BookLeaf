import { prisma } from "@repo/database";

export type AuthorIdentity = { id: string; externalId: string; userId: string };

export type AuthorProfile = {
  externalId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joinedDate: string;
};

export type AuthorBook = {
  id: string;
  title: string;
  isbn: string;
  genre: string;
  publicationDate: string | null;
  status: string;
  mrp: string | null;
  royaltyPerCopy: string | null;
  totalCopiesSold: number;
  totalRoyaltyEarned: string;
  royaltyPaid: string;
  royaltyPending: string;
  lastRoyaltyPayoutDate: string | null;
  printPartner: string | null;
  platforms: string[];
};

export type AuthorOverview = {
  totalBooks: number;
  publishedBooks: number;
  booksInProduction: number;
  totalCopiesSold: number;
  totalRoyaltyEarned: string;
  totalRoyaltyPaid: string;
  totalRoyaltyPending: string;
};

export type AuthorService = {
  findIdentity(userId: string): Promise<AuthorIdentity | null>;
  getProfile(authorId: string): Promise<AuthorProfile | null>;
  listBooks(
    authorId: string,
    page: number,
    pageSize: number,
  ): Promise<{ books: AuthorBook[]; total: number }>;
  getBook(authorId: string, bookExternalId: string): Promise<AuthorBook | null>;
  getOverview(authorId: string): Promise<AuthorOverview>;
};

function dateOnly(value: Date | null): string | null {
  return value?.toISOString().slice(0, 10) ?? null;
}

function money(
  value: { toFixed(fractionDigits?: number): string } | null,
): string | null {
  return value?.toFixed(2) ?? null;
}

function requiredMoney(
  value: { toFixed(fractionDigits?: number): string } | null,
): string {
  return money(value) ?? "0.00";
}

export function presentIsbn(isbn: string): string {
  return isbn.trim() && !/[x*]/i.test(isbn) ? isbn : "NOT AVAILABLE";
}

function presentBook(book: {
  externalId: string;
  title: string;
  isbn: string;
  genre: string;
  publicationDate: Date | null;
  publicationStatus: string;
  mrp: { toFixed(fractionDigits?: number): string } | null;
  royaltyPerCopy: { toFixed(fractionDigits?: number): string } | null;
  totalCopiesSold: number;
  totalRoyaltyEarned: { toFixed(fractionDigits?: number): string };
  royaltyPaid: { toFixed(fractionDigits?: number): string };
  royaltyPending: { toFixed(fractionDigits?: number): string };
  lastRoyaltyPayoutDate: Date | null;
  printPartner: string | null;
  distributions: Array<{ platform: { name: string } }>;
}): AuthorBook {
  return {
    id: book.externalId,
    title: book.title,
    isbn: presentIsbn(book.isbn),
    genre: book.genre,
    publicationDate: dateOnly(book.publicationDate),
    status: book.publicationStatus,
    mrp: money(book.mrp),
    royaltyPerCopy: money(book.royaltyPerCopy),
    totalCopiesSold: book.totalCopiesSold,
    totalRoyaltyEarned: book.totalRoyaltyEarned.toFixed(2),
    royaltyPaid: book.royaltyPaid.toFixed(2),
    royaltyPending: book.royaltyPending.toFixed(2),
    lastRoyaltyPayoutDate: dateOnly(book.lastRoyaltyPayoutDate),
    printPartner: book.printPartner,
    platforms: book.distributions.map(
      (distribution) => distribution.platform.name,
    ),
  };
}

const bookSelection = {
  externalId: true,
  title: true,
  isbn: true,
  genre: true,
  publicationDate: true,
  publicationStatus: true,
  mrp: true,
  royaltyPerCopy: true,
  totalCopiesSold: true,
  totalRoyaltyEarned: true,
  royaltyPaid: true,
  royaltyPending: true,
  lastRoyaltyPayoutDate: true,
  printPartner: true,
  distributions: {
    include: { platform: { select: { name: true } } },
    orderBy: { platform: { name: "asc" } },
  },
} as const;

export const prismaAuthorService: AuthorService = {
  async findIdentity(userId) {
    const author = await prisma.author.findUnique({
      where: { userId },
      select: { id: true, externalId: true, userId: true },
    });
    return author?.userId ? { ...author, userId: author.userId } : null;
  },
  async getProfile(authorId) {
    const author = await prisma.author.findUnique({ where: { id: authorId } });
    if (!author) return null;
    return {
      externalId: author.externalId,
      name: author.name,
      email: author.email,
      phone: author.phone,
      city: author.city,
      joinedDate: dateOnly(author.joinedDate)!,
    };
  },
  async listBooks(authorId, page, pageSize) {
    const where = { authorId };
    const [books, total] = await prisma.$transaction([
      prisma.book.findMany({
        where,
        select: bookSelection,
        orderBy: [{ publicationDate: "desc" }, { externalId: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.book.count({ where }),
    ]);
    return { books: books.map(presentBook), total };
  },
  async getBook(authorId, bookExternalId) {
    const book = await prisma.book.findFirst({
      where: { authorId, externalId: bookExternalId },
      select: bookSelection,
    });
    return book ? presentBook(book) : null;
  },
  async getOverview(authorId) {
    const where = { authorId };
    const [totalBooks, publishedBooks, aggregate] = await prisma.$transaction([
      prisma.book.count({ where }),
      prisma.book.count({
        where: { ...where, publicationStatus: "Published & Live" },
      }),
      prisma.book.aggregate({
        where,
        _sum: {
          totalCopiesSold: true,
          totalRoyaltyEarned: true,
          royaltyPaid: true,
          royaltyPending: true,
        },
      }),
    ]);
    return {
      totalBooks,
      publishedBooks,
      booksInProduction: totalBooks - publishedBooks,
      totalCopiesSold: aggregate._sum.totalCopiesSold ?? 0,
      totalRoyaltyEarned: requiredMoney(aggregate._sum.totalRoyaltyEarned),
      totalRoyaltyPaid: requiredMoney(aggregate._sum.royaltyPaid),
      totalRoyaltyPending: requiredMoney(aggregate._sum.royaltyPending),
    };
  },
};
