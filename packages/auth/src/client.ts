import { createAuthClient } from "better-auth/react";

const isBrowser =
  typeof (globalThis as { window?: unknown }).window !== "undefined";
const baseURL = isBrowser
  ? undefined
  : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");

export const authClient = createAuthClient({ baseURL });
