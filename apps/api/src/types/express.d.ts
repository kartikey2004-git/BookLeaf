import type { RequestId } from "../middleware/request-id.js";
import type { AuthorIdentity } from "../modules/author/service.js";

declare global {
  namespace Express {
    interface Request {
      requestId: RequestId;
      authorIdentity?: AuthorIdentity;
      adminIdentity?: { userId: string; role: "ADMIN" };
    }
  }
}

export {};
