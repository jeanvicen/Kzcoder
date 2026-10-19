import { getAgentServerHeaders } from "#/api/agent-server-config";

export const MEM0_WEB_HEALTH_PATH = "/mem0/health";
const OPERATION_PATH = "/mem0/operation";
const STORAGE_KEY = "agent-canvas.mem0.user-id.v1";
const TIMEOUT_MS = 1_500;

type Operation = "search" | "remember" | "list" | "update" | "forget" | "history";

function getUserId(): string {
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // Storage may be unavailable in restricted browser contexts. Keep the
    // identity ephemeral rather than failing the chat or persisting elsewhere.
    return crypto.randomUUID();
  }
}

export async function probeMem0WebBridge(
  fetchImpl: typeof fetch = (...params) => fetch(...params),
  timeoutMs = TIMEOUT_MS,
): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(MEM0_WEB_HEALTH_PATH, {
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const body = (await response.json()) as { ok?: unknown; enabled?: unknown };
    return body?.ok === true && body?.enabled === true;
  } catch { return false; }
  finally { clearTimeout(timer); }
}

export async function callMem0Memory(
  operation: Operation,
  args: Record<string, unknown>,
  fetchImpl: typeof fetch = (...params) => fetch(...params),
): Promise<unknown> {
  const response = await fetchImpl(OPERATION_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAgentServerHeaders() },
    body: JSON.stringify({ ...args, operation, user_id: getUserId() }),
  });
  let envelope: { result?: unknown; error?: { message?: string } } = {};
  try {
    envelope = (await response.json()) as typeof envelope;
  } catch {
    /* status below */
  }
  if (!response.ok) throw new Error(envelope.error?.message ?? `Mem0 request failed (${response.status})`);
  return envelope.result;
}
