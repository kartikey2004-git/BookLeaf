import { prisma } from "@repo/database";
import { parseServerEnvironment } from "@repo/validation/env";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";

const environment = parseServerEnvironment();
const trustedOrigins = environment.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map(
  (origin) => origin.trim(),
);

export const auth = betterAuth({
  baseURL: environment.BETTER_AUTH_URL,
  secret: environment.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "AUTHOR",
        input: false,
      },
    },
  },
  advanced: {
    useSecureCookies: environment.NODE_ENV === "production",
  },
});

export async function getVerifiedSession(headers: Headers) {
  return auth.api.getSession({ headers });
}

export type Auth = typeof auth;
