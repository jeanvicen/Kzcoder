import { beforeEach, describe, expect, it, vi } from "vitest";

const { callMem0Memory, claimClientToolCall, postClientToolResult } = vi.hoisted(() => ({
  callMem0Memory: vi.fn(),
  claimClientToolCall: vi.fn(),
  postClientToolResult: vi.fn(),
}));

vi.mock("#/api/mem0-memory-bridge", () => ({ callMem0Memory }));
vi.mock("#/utils/claim-client-tool-call", () => ({ claimClientToolCall }));
vi.mock("./client-tool-result", () => ({ postClientToolResult }));

import { MEM0_MEMORY_RESULT_PREFIX } from "#/constants/mem0-memory";
import { handleMem0MemoryAction } from "./mem0-memory-action";

const action = {
  kind: "ClientAction_mem0_memory" as const,
  operation: "search" as const,
  query: "preferred language",
};

describe("handleMem0MemoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    claimClientToolCall.mockReturnValue(true);
    postClientToolResult.mockResolvedValue(undefined);
  });

  it("runs the requested operation and reports its result back to the agent", async () => {
    callMem0Memory.mockResolvedValue({ results: [{ id: "m1" }] });
    await handleMem0MemoryAction(action, "conversation-1", "tool-call-1");

    expect(callMem0Memory).toHaveBeenCalledWith("search", {
      query: "preferred language",
    });
    expect(postClientToolResult).toHaveBeenCalledWith(
      "conversation-1",
      MEM0_MEMORY_RESULT_PREFIX,
      {
        status: "ok",
        operation: "search",
        data: { results: [{ id: "m1" }] },
      },
    );
  });

  it("returns a useful failure to the agent instead of leaving the tool unanswered", async () => {
    callMem0Memory.mockRejectedValue(new Error("Mem0 unavailable"));
    await handleMem0MemoryAction(action, "conversation-1", "tool-call-2");

    expect(postClientToolResult).toHaveBeenCalledWith(
      "conversation-1",
      MEM0_MEMORY_RESULT_PREFIX,
      { status: "error", message: "Mem0 unavailable" },
    );
  });

  it("ignores duplicate tool-call deliveries", async () => {
    claimClientToolCall.mockReturnValue(false);
    await handleMem0MemoryAction(action, "conversation-1", "tool-call-3");

    expect(callMem0Memory).not.toHaveBeenCalled();
    expect(postClientToolResult).not.toHaveBeenCalled();
  });
});
