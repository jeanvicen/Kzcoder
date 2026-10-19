import { MEM0_MEMORY_TOOL_NAME } from "#/constants/mem0-memory";
import type { ClientToolSpec } from "./canvas-ui-client-tool";

export const MEM0_MEMORY_CLIENT_TOOL: ClientToolSpec = {
  name: MEM0_MEMORY_TOOL_NAME,
  description: `Use Mem0 as an optional, durable memory store when relevant. Search before relying on prior personal context; remember only useful durable facts/preferences the user has shared, not secrets or transient details. Operations: search(query), remember(text), list, update(memory_id,text), forget(memory_id), history(memory_id). Never claim a memory was saved or deleted unless the result confirms it. The tool is available only when the local server has Mem0 configured.`,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      operation: {
        type: "string",
        enum: ["search", "remember", "list", "update", "forget", "history"],
      },
      query: { type: "string", description: "A concise semantic query; required for search." },
      text: { type: "string", description: "Memory text for remember/update." },
      memory_id: { type: "string", description: "Memory id for update/forget/history." },
    },
    required: ["operation"],
  },
  annotations: {
    title: "Mem0 memory",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  },
};
