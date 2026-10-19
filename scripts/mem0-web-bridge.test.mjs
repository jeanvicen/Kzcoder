import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { mountMem0WebBridge } from "./mem0-web-bridge.mjs";

const USER_ID = "8fb8e06b-9a18-4689-97a5-8d4c8f3dcfd8";
const OTHER_USER_ID = "a1d74ac1-0f2d-4821-9737-a8fb45410a5a";

async function call(bridge, { url, method = "GET", headers = {}, body = "" }) {
  const req = Readable.from([Buffer.from(body)]);
  req.url = url;
  req.method = method;
  req.headers = Object.fromEntries(Object.entries({ host: "127.0.0.1", ...headers }).map(([key, value]) => [key.toLowerCase(), value]));
  let status = 200;
  let payload = "";
  const res = {
    writeHead(code) { status = code; },
    end(value = "") { payload += value; },
  };
  const handled = await bridge.handleHttp(req, res);
  assert.equal(handled, true);
  return { status, body: payload ? JSON.parse(payload) : null };
}

function jsonFetch(log) {
  return async (url, options = {}) => {
    log.push({ url, options });
    let body = null;
    if (options.body) body = JSON.parse(options.body);
    const data = url.endsWith("/v1/memories/owned/")
      ? { id: "owned", user_id: USER_ID }
      : url.endsWith("/v1/memories/other/")
        ? { id: "other", user_id: OTHER_USER_ID }
        : { results: [], input: body };
    return { ok: true, status: 200, json: async () => data };
  };
}

test("bridge is dormant without a key and refuses public unkeyed bind", () => {
  assert.equal(mountMem0WebBridge({ env: {}, host: "127.0.0.1" }), null);
  assert.equal(mountMem0WebBridge({ env: { MEM0_API_KEY: "secret" }, host: "0.0.0.0" }), null);
});

test("bridge reports configured state without returning secrets and rejects cross-origin requests", async () => {
  const log = [];
  const bridge = mountMem0WebBridge({ env: { MEM0_API_KEY: "do-not-leak" }, host: "127.0.0.1", fetchImpl: jsonFetch(log) });
  const health = await call(bridge, { url: "/mem0/health" });
  assert.deepEqual(health.body, { ok: true, enabled: true });
  const denied = await call(bridge, { url: "/mem0/operation", method: "POST", headers: { origin: "https://attacker.example" }, body: "{}" });
  assert.equal(denied.status, 403);
  assert.equal(log.length, 0);
});

test("operations enforce server-side user scope before mutations and filter all user data", async () => {
  const log = [];
  const bridge = mountMem0WebBridge({ env: { MEM0_API_KEY: "server-secret", MEM0_WEB_KEY: "session" }, host: "0.0.0.0", fetchImpl: jsonFetch(log) });
  const invoke = async (payload) => call(bridge, { url: "/mem0/operation", method: "POST", headers: { "X-Session-API-Key": "session" }, body: JSON.stringify({ user_id: USER_ID, ...payload }) });
  assert.equal((await invoke({ operation: "search", query: "prefers tea" })).status, 200);
  assert.deepEqual(log[0].options.headers, { Authorization: "Token server-secret", "Content-Type": "application/json" });
  assert.deepEqual(JSON.parse(log[0].options.body).filters, { user_id: USER_ID });
  assert.equal((await invoke({ operation: "forget", memory_id: "other" })).status, 404);
  assert.equal(log.length, 2, "cross-scope delete must not reach the upstream API");
  assert.equal((await invoke({ operation: "forget", memory_id: "owned" })).status, 200);
  assert.equal(log.length, 4, "only the ownership lookup and scoped deletion are made");
  assert.equal(log[3].options.method, "DELETE");
});

test("keyed bridge rejects missing or incorrect session keys", async () => {
  const bridge = mountMem0WebBridge({ env: { MEM0_API_KEY: "secret", MEM0_WEB_KEY: "right" }, host: "0.0.0.0", fetchImpl: jsonFetch([]) });
  const response = await call(bridge, { url: "/mem0/operation", method: "POST", headers: { "X-Session-API-Key": "wrong" }, body: JSON.stringify({ operation: "list", user_id: USER_ID }) });
  assert.equal(response.status, 401);
});
