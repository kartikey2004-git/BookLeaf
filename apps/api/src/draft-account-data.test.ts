import { describe, expect, it } from "vitest";
import { buildAccountDataBlock } from "@repo/ai";

const standard = {
  title: "Book", status: "Published & Live", isbn: "978-1", publicationDate: new Date("2025-01-02T00:00:00Z"), mrp: { toFixed: () => "399.00" }, totalCopiesSold: 5,
  totalRoyaltyEarned: { toFixed: () => "1000.00" }, royaltyPaid: { toFixed: () => "0.00" }, royaltyPending: { toFixed: () => "1000.00" }, lastRoyaltyPayoutDate: null, platforms: ["BookLeaf"],
};
describe("buildAccountDataBlock", () => {
  it("formats normal book facts", () => expect(buildAccountDataBlock(standard)).toContain("₹399.00"));
  it("reports zero royalty and low pending rollover", () => expect(buildAccountDataBlock({ ...standard, totalRoyaltyEarned: { toFixed: () => "0.00" }, royaltyPending: { toFixed: () => "850.00" } })).toContain("No royalty has been earned yet."));
  it("renders production null values as unavailable", () => expect(buildAccountDataBlock({ ...standard, status: "In Production", isbn: null, mrp: null, publicationDate: null })).toContain("ISBN: NOT AVAILABLE"));
  it("uses no-account-data text for general tickets", () => expect(buildAccountDataBlock(null)).toContain("No account data available"));
});
