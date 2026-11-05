import assert from "node:assert/strict";
import test from "node:test";
import { getWorkerEnvironment } from "./env.js";

test("worker production configuration requires Inngest signing", () => {
  assert.throws(() =>
    getWorkerEnvironment({ NODE_ENV: "production", WORKER_HOST: "127.0.0.1" }),
  );
  assert.equal(
    getWorkerEnvironment({
      NODE_ENV: "production",
      INNGEST_SIGNING_KEY: "test-signing-key",
    }).INNGEST_SIGNING_KEY,
    "test-signing-key",
  );
});

test("worker uses Cloud Run PORT unless WORKER_PORT is explicitly set", () => {
  assert.equal(getWorkerEnvironment({ PORT: "8080" }).WORKER_PORT, 8080);
  assert.equal(
    getWorkerEnvironment({ PORT: "8080", WORKER_PORT: "4001" }).WORKER_PORT,
    4001,
  );
});
