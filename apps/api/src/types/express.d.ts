import type { RequestId } from "../middleware/request-id.js";

declare global {
  namespace Express {
    interface Request {
      requestId: RequestId;
    }
  }
}

export {};
