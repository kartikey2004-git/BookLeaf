import { prisma } from "@repo/database";
import { auth } from "./index.js";
import {
  provisionAuthorAccount,
  type ProvisionableAuthor,
} from "./provisioning.js";

function requireDevelopmentPassword(): string {
  if (process.env.NODE_ENV !== "development") {
    throw new Error(
      "Demo account provisioning is allowed only when NODE_ENV=development",
    );
  }
  const password = process.env.BOOKLEAF_DEMO_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error(
      "BOOKLEAF_DEMO_PASSWORD must contain at least 12 characters",
    );
  }
  return password;
}

async function main(): Promise<void> {
  const password = requireDevelopmentPassword();
  const authors = await prisma.author.findMany({
    select: {
      id: true,
      externalId: true,
      email: true,
      name: true,
      userId: true,
    },
    orderBy: { externalId: "asc" },
  });
  const results = { created: 0, linked: 0, alreadyLinked: 0 };

  for (const author of authors satisfies ProvisionableAuthor[]) {
    const result = await provisionAuthorAccount(author, {
      findUserByEmail: (email) =>
        prisma.user.findUnique({ where: { email }, select: { id: true } }),
      createUser: async (candidate) => {
        try {
          const created = await auth.api.signUpEmail({
            body: { name: candidate.name, email: candidate.email, password },
          });
          return { id: created.user.id };
        } catch (error) {
          const concurrentUser = await prisma.user.findUnique({
            where: { email: candidate.email },
            select: { id: true },
          });
          if (concurrentUser) return concurrentUser;
          throw error;
        }
      },
      claimAuthorLink: async (authorId, userId) =>
        (
          await prisma.author.updateMany({
            where: { id: authorId, userId: null },
            data: { userId },
          })
        ).count === 1,
      findAuthor: (authorId) =>
        prisma.author.findUnique({
          where: { id: authorId },
          select: {
            id: true,
            externalId: true,
            email: true,
            name: true,
            userId: true,
          },
        }),
    });
    if (result === "created") results.created += 1;
    if (result === "linked") results.linked += 1;
    if (result === "already-linked") results.alreadyLinked += 1;
  }
  console.info(JSON.stringify(results));
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Demo account provisioning failed",
  );
  process.exitCode = 1;
});
