/** Server-side Mem0 Platform proxy. The API key is read only from process env. */
import { timingSafeEqual } from "node:crypto";
import { DEFAULT_BIND_HOST, isLoopbackBind } from "./bind-host.mjs";
import { readRequestBody } from "./http-body.mjs";

export const MEM0_WEB_PREFIX = "/mem0";
const HEALTH_PATH = `${MEM0_WEB_PREFIX}/health`;
const OPERATION_PATH = `${MEM0_WEB_PREFIX}/operation`;
const AUTH_HEADER = "x-session-api-key";
const MAX_BODY_BYTES = 32 * 1024;
const MEM0_API = "https://api.mem0.ai";
const OPERATIONS = new Set(["remember", "search", "list", "update", "forget", "history"]);

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload), "Cache-Control": "no-store" });
  res.end(payload);
}
function crossOrigin(req) {
  if (!req.headers.origin) return false;
  try { return new URL(req.headers.origin).host !== req.headers.host; } catch { return true; }
}
function requestHostname(req) {
  try { return new URL(`http://${req.headers.host ?? ""}`).hostname.replace(/^\[|\]$/g, ""); } catch { return ""; }
}
function foreignHost(req, bindHost) {
  if (!isLoopbackBind(bindHost)) return false;
  const hostname = requestHostname(req);
  return !(isLoopbackBind(hostname) || hostname.endsWith(".localhost"));
}
function validUserId(value) { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27,40}$/i.test(value); }
function validMemoryId(value) { return typeof value === "string" && value.length > 0 && value.length <= 200 && !/[/?#]/.test(value); }

export function mountMem0WebBridge({ env = process.env, host = DEFAULT_BIND_HOST, sessionApiKey = null, fetchImpl = fetch, log = (message) => console.warn(`[mem0-web] ${message}`) } = {}) {
  const apiKey = env.MEM0_API_KEY?.trim();
  if (!apiKey) return null;
  const authKey = env.MEM0_WEB_KEY?.trim() || env.MARS_WEB_KEY?.trim() || (typeof sessionApiKey === "string" ? sessionApiKey.trim() : "") || null;
  if (!authKey && !isLoopbackBind(host)) {
    log(`no bridge session key and bind host ${host} is not loopback; not mounting /mem0/*`);
    return null;
  }

  async function request(path, { method = "GET", body } = {}) {
    const response = await fetchImpl(`${MEM0_API}${path}`, {
      method,
      headers: { Authorization: `Token ${apiKey}`, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(20_000),
    });
    let data = null;
    try { data = await response.json(); } catch { /* use generic upstream error */ }
    if (!response.ok) throw Object.assign(new Error(`Mem0 request failed (${response.status})`), { status: response.status });
    return data;
  }

  async function scopedMemory(memoryId, userId) {
    if (!validMemoryId(memoryId)) throw Object.assign(new Error("Invalid memory id"), { status: 400 });
    const memory = await request(`/v1/memories/${encodeURIComponent(memoryId)}/`);
    if (!memory || memory.user_id !== userId) throw Object.assign(new Error("Memory not found in this user scope"), { status: 404 });
    return memory;
  }

  async function execute(input) {
    const { operation, user_id: userId } = input;
    if (!OPERATIONS.has(operation)) throw Object.assign(new Error("Unsupported operation"), { status: 400 });
    if (!validUserId(userId)) throw Object.assign(new Error("Invalid user scope"), { status: 400 });
    if (operation === "remember") {
      const text = input.text?.trim();
      if (!text || text.length > 10_000) throw Object.assign(new Error("Memory text must be 1–10000 characters"), { status: 400 });
      return request("/v3/memories/add/", { method: "POST", body: { messages: [{ role: "user", content: text }], user_id: userId } });
    }
    if (operation === "search") {
      const query = input.query?.trim();
      if (!query || query.length > 2_000) throw Object.assign(new Error("Search query must be 1–2000 characters"), { status: 400 });
      return request("/v3/memories/search/", { method: "POST", body: { query, output_format: "v1.1", filters: { user_id: userId } } });
    }
    if (operation === "list") {
      return request("/v3/memories/?page_size=100", { method: "POST", body: { filters: { user_id: userId } } });
    }
    const memoryId = input.memory_id;
    await scopedMemory(memoryId, userId);
    const encoded = encodeURIComponent(memoryId);
    if (operation === "update") {
      const text = input.text?.trim();
      if (!text || text.length > 10_000) throw Object.assign(new Error("Updated memory text must be 1–10000 characters"), { status: 400 });
      return request(`/v1/memories/${encoded}/`, { method: "PUT", body: { text } });
    }
    if (operation === "forget") return request(`/v1/memories/${encoded}/`, { method: "DELETE" });
    return request(`/v1/memories/${encoded}/history/`);
  }

  return {
    async handleHttp(req, res) {
      const path = (req.url ?? "/").split(/[?#]/)[0];
      if (path !== HEALTH_PATH && path !== OPERATION_PATH) return false;
      if (crossOrigin(req) || foreignHost(req, host)) {
        json(res, 403, { error: { message: "cross-origin request refused" } }); return true;
      }
      if (path === HEALTH_PATH && (req.method === "GET" || req.method === "HEAD")) {
        json(res, 200, { ok: true, enabled: Boolean(apiKey) }); return true;
      }
      if (path !== OPERATION_PATH) { json(res, 405, { error: { message: "method not allowed" } }); return true; }
      if (req.method !== "POST") { json(res, 405, { error: { message: "use POST" } }); return true; }
      if (authKey && (typeof req.headers[AUTH_HEADER] !== "string" || !safeEqual(req.headers[AUTH_HEADER], authKey))) {
        json(res, 401, { error: { message: "unauthorized" } }); return true;
      }
      let input;
      try {
        const bytes = await readRequestBody(req, MAX_BODY_BYTES);
        input = JSON.parse(bytes.toString("utf8"));
      } catch { json(res, 400, { error: { message: "invalid JSON request" } }); return true; }
      try { json(res, 200, { result: await execute(input) }); }
      catch (error) { json(res, Number.isInteger(error?.status) ? error.status : 502, { error: { message: error?.message ?? "Mem0 request failed" } }); }
      return true;
    },
  };
}
