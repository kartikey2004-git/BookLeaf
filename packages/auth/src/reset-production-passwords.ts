import { randomUUID } from "node:crypto";
import { prisma } from "@repo/database";
import { hashPassword } from "better-auth/crypto";
import { auth } from "./index.js";

const adminEmail = "kartikeybhatnagar247@gmail.com";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set`);
  return value;
}

async function setCredentialPassword(userId: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  const account = await prisma.account.findFirst({
    where: { userId, providerId: "credential" },
    select: { id: true },
  });
  if (account) {
    await prisma.account.update({ where: { id: account.id }, data: { password: passwordHash } });
    return;
  }
  await prisma.account.create({
    data: {
      id: randomUUID(),
      userId,
      providerId: "credential",
      accountId: userId,
      password: passwordHash,
    },
  });
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV !== "production")
    throw new Error("This reset utility requires NODE_ENV=production");
  if (process.env.BOOKLEAF_CONFIRM_PROD_RESET !== "true")
    throw new Error("Set BOOKLEAF_CONFIRM_PROD_RESET=true to continue");

  const adminPassword = required("BOOKLEAF_ADMIN_RESET_PASSWORD");
  const authorPassword = required("BOOKLEAF_DEMO_PASSWORD");
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  });
  const adminId = existingAdmin?.id ?? (
    await auth.api.signUpEmail({
      body: { name: "BookLeaf Admin", email: adminEmail, password: adminPassword },
    })
  ).user.id;
  await prisma.user.update({ where: { id: adminId }, data: { role: "ADMIN" } });
  if (existingAdmin) await setCredentialPassword(adminId, adminPassword);

  const authors = await prisma.author.findMany({
    where: {
      userId: { not: null },
      NOT: { userId: adminId },
    },
    select: { userId: true, email: true },
  });
  let authorsReset = 0;
  for (const author of authors) {
    if (!author.userId) continue;
    await setCredentialPassword(author.userId, authorPassword);
    authorsReset += 1;
  }
  console.info(JSON.stringify({ adminEmail, adminCreated: !existingAdmin, authorsReset }));
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Password reset failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
