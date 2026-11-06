import { prisma } from "@repo/database";
import { auth } from "./index.js";

async function main(): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error(
      "Admin account provisioning is allowed only in development",
    );
  }

  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error(
      "Provide the local admin email: pnpm --filter @repo/auth provision:admin -- <email>",
    );
  }

  const password = process.env.BOOKLEAF_DEMO_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error(
      "BOOKLEAF_DEMO_PASSWORD must contain at least 12 characters",
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  let userId = existingUser?.id;
  if (!userId) {
    const result = await auth.api.signUpEmail({
      body: { name: "BookLeaf Admin", email, password },
    });
    userId = result.user.id;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" },
  });

  console.info(
    JSON.stringify({
      email,
      created: !existingUser,
      role: "ADMIN",
    }),
  );
}

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "Admin provisioning failed",
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
