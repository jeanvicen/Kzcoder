# Optional Mem0 memory capability

Kzcoder can expose an internal `mem0_memory` client tool to local OpenHands
conversations when the server process is configured with `MEM0_API_KEY`. This
is an optional capability: without the variable the bridge is not mounted and
the tool is not added to new conversations. The existing OpenHands
`agent_context.load_memory` feature and `.openhands/memory/` files are untouched.
There are no user-interface changes.

## Configuration

Set `MEM0_API_KEY` in the environment of the Node process that runs
`ingress.mjs` or `static-server.mjs` (for example, in the private `.env` used by
the local development runner). Do not prefix it with `VITE_`, put it in browser
configuration, or commit it. On public/non-loopback binds, configure the bridge
with the same session key used by the frontend (`--session-api-key` in the
static server or `MEM0_WEB_KEY`/`MARS_WEB_KEY` for ingress). The bridge uses the
existing `X-Session-API-Key`, same-origin and loopback/Host protections.

When enabled, facts and queries sent through this capability are transmitted
from the server to Mem0 Platform (`https://api.mem0.ai`) and are stored under a
per-browser opaque user scope. The key remains server-side. Operations include
semantic search, remembering a fact, listing, updating, forgetting one memory,
and viewing one memory's history. There is deliberately no delete-all operation.
Only the local OpenHands client-tool launch path is wired; other backends,
Electron and direct Vite-only development without the bridge are not enabled.

The agent should use this tool only when relevant, search before relying on
stored personal context, prefer useful durable facts/preferences, and avoid
storing secrets or transient details. The Mem0 store complements rather than
replaces the existing local OpenHands memory.
