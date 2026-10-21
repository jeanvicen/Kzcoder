<p align="center">
  <img src="./kzcoder-logo.jpg" alt="Kzcoder logo" width="220">
</p>

<h1 align="center">Kzcoder</h1>

<p align="center">
  An open-source AI chat application adapted for Kzcoder from Vercel's public Chatbot template.
</p>

<p align="center">
  <a href="https://kzcoder.vercel.app"><strong>Open Kzcoder</strong></a> ·
  <a href="https://chatbot.ai-sdk.dev/docs"><strong>AI SDK Chatbot documentation</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model providers</strong></a> ·
  <a href="#deployment-and-configuration"><strong>Deployment</strong></a> ·
  <a href="#running-locally"><strong>Run locally</strong></a>
</p>

---

## About this project

Kzcoder is an adaptation of the public [Vercel Chatbot](https://github.com/vercel/chatbot) repository, a Next.js and AI SDK application. The upstream project supplies the application code and remains credited to its original authors. Kzcoder branding and this README do not imply that Vercel sponsors or officially partners with Kzcoder.

The upstream source is distributed under the Apache License 2.0; see [`LICENSE`](./LICENSE) for the complete license and notices. Please retain that license and attribution when redistributing the code.

## Features

- **Next.js App Router** — server-rendered React, Server Components, and Server Actions.
- **AI SDK** — a unified interface for text generation, structured output, and tool calls.
- **Chat and generative UI** — streaming conversations and interactive AI experiences.
- **Model routing** — bundled model choices are configured in `lib/ai/models.ts` and use Vercel AI Gateway.
- **Modern accessible UI** — Tailwind CSS, shadcn/ui, and Radix UI primitives.
- **Persistence** — Neon Serverless Postgres stores application data; Vercel Blob supports file storage.
- **Authentication** — Auth.js provides sign-in and session handling.

## Model providers

The app uses [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) for its configured models, including Mistral, Moonshot, DeepSeek, OpenAI, and xAI. The exact model routing is maintained in [`lib/ai/models.ts`](./lib/ai/models.ts).

On Vercel, AI Gateway authentication uses the deployment's OIDC identity; a separate gateway key is not required for the Vercel deployment. For local or other non-Vercel deployments, provide `AI_GATEWAY_API_KEY` in your private environment file. The AI SDK also supports direct model providers; follow their documentation and configure credentials securely if you change the routing.

## Deployment and configuration

The production deployment for this Kzcoder repository is hosted at **[kzcoder.vercel.app](https://kzcoder.vercel.app)** and is connected to the `main` branch of [`jeanvicen/Kzcoder`](https://github.com/jeanvicen/Kzcoder). Commits pushed to `main` trigger the connected Vercel production deployment.

A working deployment requires the project integrations and secrets below. Do not commit credentials or `.env` files.

| Variable / integration | Purpose | Requirement |
| --- | --- | --- |
| `POSTGRES_URL` | Neon Postgres connection string | Required for persistent application data and authentication flows |
| `AUTH_SECRET` | Auth.js session/signing secret | Required; use a cryptographically random value |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob uploads and file storage | Required for file-storage features |
| `REDIS_URL` | Upstash Redis connection | Optional in the application; enables Redis-backed rate limiting/coordination where configured |
| `AI_GATEWAY_API_KEY` | AI Gateway access outside Vercel | Required for non-Vercel deployments; Vercel uses OIDC automatically |

For the Kzcoder Vercel project, connect the free Neon, Upstash Redis, and Vercel Blob integrations from the project's Storage/Integrations settings when available. The integrations should populate their own environment variables; check variable names and environment targets without exposing their values. If a provider changes its free-tier terms, verify them before creating or upgrading a resource.

## Running locally

You need Node.js, Corepack, and pnpm. Copy the variable names from [`.env.example`](./.env.example) into a private `.env.local` file and set the values required for your local setup. Never commit `.env.local` or share secret values.

```bash
corepack enable
pnpm install
pnpm db:migrate
pnpm dev
```

The app is available at [http://localhost:3000](http://localhost:3000). Database-backed features require a configured Postgres database; upload features require Blob-compatible storage. For local AI Gateway access, provide `AI_GATEWAY_API_KEY`.

Useful commands:

```bash
pnpm build       # Run migrations when configured, then build the Next.js app
pnpm db:migrate  # Apply database migrations
pnpm test        # Run the Playwright test suite
pnpm check       # Run repository checks
```

## Project structure

- `app/` — Next.js routes and API handlers
- `components/` — chat, UI, and generative interface components
- `lib/` — AI configuration, database, authentication, and shared utilities
- `public/` — static assets
- `drizzle/` — database schema and migrations

## Attribution and license

This repository contains source code adapted from [Vercel Chatbot](https://github.com/vercel/chatbot), copyright its respective contributors and licensed under Apache-2.0. The upstream [`LICENSE`](./LICENSE) and notices are preserved. Kzcoder-specific branding and documentation do not change the license or ownership of the upstream code.
