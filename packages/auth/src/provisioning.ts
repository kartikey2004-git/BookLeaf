export type ProvisionableAuthor = {
  id: string;
  externalId: string;
  email: string;
  name: string;
  userId: string | null;
};

export type ProvisioningStore = {
  findUserByEmail(email: string): Promise<{ id: string } | null>;
  createUser(author: ProvisionableAuthor): Promise<{ id: string }>;
  claimAuthorLink(authorId: string, userId: string): Promise<boolean>;
  findAuthor(authorId: string): Promise<ProvisionableAuthor | null>;
};

export type ProvisionResult = "created" | "linked" | "already-linked";

export async function provisionAuthorAccount(
  author: ProvisionableAuthor,
  store: ProvisioningStore,
): Promise<ProvisionResult> {
  if (author.userId) return "already-linked";
  const existingUser = await store.findUserByEmail(author.email);
  const user = existingUser ?? (await store.createUser(author));
  if (await store.claimAuthorLink(author.id, user.id)) {
    return existingUser ? "linked" : "created";
  }
  const currentAuthor = await store.findAuthor(author.id);
  if (currentAuthor?.userId === user.id) return "already-linked";
  throw new Error(
    `Author ${author.externalId} is already linked to another user`,
  );
}
