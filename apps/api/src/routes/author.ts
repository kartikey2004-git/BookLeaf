import { Router } from "express";
import { z } from "@repo/validation";
import { HttpError } from "../middleware/errors.js";
import {
  createRequireAuthor,
  type SessionResolver,
} from "../middleware/author-auth.js";
import type { AuthorService } from "../modules/author/service.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

const bookIdSchema = z.object({ bookId: z.string().min(1).max(255) });

export function createAuthorRouter(
  getSession: SessionResolver,
  authorService: AuthorService,
): Router {
  const router = Router();
  router.use(createRequireAuthor(getSession, authorService));

  router.get("/author/me", async (request, response, next) => {
    try {
      const profile = await authorService.getProfile(
        request.authorIdentity!.id,
      );
      if (!profile)
        throw new HttpError(404, "NOT_FOUND", "Author profile was not found");
      response.json({ author: profile });
    } catch (error) {
      next(error);
    }
  });

  router.get("/author/books", async (request, response, next) => {
    try {
      const { page, pageSize } = paginationSchema.parse(request.query);
      const result = await authorService.listBooks(
        request.authorIdentity!.id,
        page,
        pageSize,
      );
      response.json({
        books: result.books,
        pagination: { page, pageSize, total: result.total },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/author/books/:bookId", async (request, response, next) => {
    try {
      const { bookId } = bookIdSchema.parse(request.params);
      const book = await authorService.getBook(
        request.authorIdentity!.id,
        bookId,
      );
      if (!book) throw new HttpError(404, "NOT_FOUND", "Book was not found");
      response.json({ book });
    } catch (error) {
      next(error);
    }
  });

  router.get("/author/overview", async (request, response, next) => {
    try {
      response.json({
        overview: await authorService.getOverview(request.authorIdentity!.id),
      });
    } catch (error) {
      next(error);
    }
  });
  return router;
}
