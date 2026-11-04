import { describe, expect, it } from "vitest";
import {
  provisionAuthorAccount,
  type ProvisionableAuthor,
  type ProvisioningStore,
} from "../provisioning.js";

function createStore(linkedUserId: string | null = null): ProvisioningStore {
  let author: ProvisionableAuthor = {
    id: "author-1",
    externalId: "AUTH001",
    email: "priya@example.com",
    name: "Priya",
    userId: linkedUserId,
  };
  let user: { id: string } | null = null;
  return {
    findUserByEmail: async () => user,
    createUser: async () => (user = { id: "user-1" }),
    claimAuthorLink: async (_authorId, userId) => {
      if (author.userId) return false;
      author = { ...author, userId };
      return true;
    },
    findAuthor: async () => author,
  };
}

const author: ProvisionableAuthor = {
  id: "author-1",
  externalId: "AUTH001",
  email: "priya@example.com",
  name: "Priya",
  userId: null,
};

describe("author account provisioning", () => {
  it("creates then idempotently preserves an author link", async () => {
    const store = createStore();
    expect(await provisionAuthorAccount(author, store)).toBe("created");
    expect(
      await provisionAuthorAccount({ ...author, userId: "user-1" }, store),
    ).toBe("already-linked");
  });

  it("rejects a conflicting author link", async () => {
    const store = createStore("other-user");
    await expect(provisionAuthorAccount(author, store)).rejects.toThrow(
      "already linked to another user",
    );
  });
});
