import { describe, expect, it } from "vitest";
import { getEnvironment } from "./env.js";

describe("getEnvironment", () => {
  it("uses the hosting PORT when API_PORT is not configured", () => {
    expect(getEnvironment({ PORT: "8080" }).API_PORT).toBe(8080);
  });

  it("keeps API_PORT as the explicit local override", () => {
    expect(getEnvironment({ PORT: "8080", API_PORT: "4000" }).API_PORT).toBe(
      4000,
    );
  });
});
