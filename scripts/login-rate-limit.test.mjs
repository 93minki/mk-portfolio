import { strict as assert } from "node:assert";
import { test } from "node:test";
import { clearLoginFailures, getClientKey, isLoginBlocked, recordLoginFailure } from "../app/lib/login-rate-limit.server.ts";

test("limits failures per client in a fixed window and clears them", () => {
  const start = 1000;
  const end = start + 15 * 60 * 1000;
  assert.equal(getClientKey(new Request("https://example.com", { headers: { "CF-Connecting-IP": "192.0.2.1", "X-Forwarded-For": "192.0.2.2" } })), "192.0.2.1");
  assert.equal(getClientKey(new Request("https://example.com", { headers: { "X-Forwarded-For": "192.0.2.2" } })), "unknown");
  for (let i = 0; i < 4; i++) recordLoginFailure("client", start + i);
  assert.equal(isLoginBlocked("client", start + 4), false);
  recordLoginFailure("client", start + 4);
  assert.equal(isLoginBlocked("client", end - 1), true);
  assert.equal(isLoginBlocked("other", end - 1), false);
  assert.equal(isLoginBlocked("client", end), false);
  recordLoginFailure("client", end);
  assert.equal(isLoginBlocked("client", end), false);
  for (let i = 0; i < 4; i++) recordLoginFailure("client", end);
  assert.equal(isLoginBlocked("client", end), true);
  clearLoginFailures("client");
  assert.equal(isLoginBlocked("client", end), false);
});
