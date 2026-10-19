import type { Mem0MemoryAction } from "#/types/agent-server/core";
import { MEM0_MEMORY_RESULT_PREFIX } from "#/constants/mem0-memory";
import { callMem0Memory } from "#/api/mem0-memory-bridge";
import { claimClientToolCall } from "#/utils/claim-client-tool-call";
import { postClientToolResult } from "./client-tool-result";

const LEDGER_PREFIX = "agent-canvas-mem0-tool-calls:";

/** Execute an optional Mem0 client tool action without ever exposing its API key. */
export async function handleMem0MemoryAction(
  action: Mem0MemoryAction,
  conversationId: string,
  toolCallId: string,
): Promise<void> {
  if (!claimClientToolCall(`${LEDGER_PREFIX}${conversationId}`, toolCallId)) return;
  let result: unknown;
  try {
    const operation = action.operation;
    if (!["search", "remember", "list", "update", "forget", "history"].includes(operation)) throw new Error("Unsupported memory operation");
    const args: Record<string, unknown> = {};
    if (operation === "search") args.query = action.query;
    if (operation === "remember" || operation === "update") args.text = action.text;
    if (operation === "update" || operation === "forget" || operation === "history") args.memory_id = action.memory_id;
    result = { status: "ok", operation, data: await callMem0Memory(operation, args) };
  } catch (error) {
    result = { status: "error", message: error instanceof Error ? error.message : "Memory operation failed" };
  }
  await postClientToolResult(conversationId, MEM0_MEMORY_RESULT_PREFIX, result).catch((error) => {
    console.warn("[mem0_memory] Failed to report tool result:", error);
  });
}
