<a name="readme-top"></a>

<div align="center">
  <img src="./kzcoder-logo.jpg" alt="Kzcoder logo" width="340">
  <h1 align="center" style="border-bottom: none">Kzcoder</h1>
  <p align="center">
    <strong>The self-hosted developer control center for coding agents and automations.</strong>
  </p>
  <p align="center">
    Run Kzcoder locally or on infrastructure you manage, connect compatible coding-agent environments, and keep development work in one place.
  </p>
</div>

<div align="center">
  <a href="#quickstart">Quickstart</a> |
  <a href="./docs/README.md">Documentation</a> |
  <a href="./docs/SELF_HOSTING.md">Self-hosting</a> |
  <a href="./docs/ACP_AGENTS.md">Agent compatibility</a> |
  <a href="./README.windows.md">Windows setup</a>
</div>

<p align="center">
  <img src="https://assets.openhands.dev/screenshot/automation-preview.png" alt="Kzcoder automations preview" width="100%">
</p>

<hr>

## About Kzcoder

Kzcoder brings coding-agent conversations, project workspaces, backend connections and development automations together in a single self-hosted interface. Run it on your computer, or connect it to local, remote, container, virtual-machine or cloud environments that you control.

| Capability | What it does |
| --- | --- |
| **Self-host your way** | Run Kzcoder locally or on infrastructure you manage. See the [self-hosting guide](./docs/SELF_HOSTING.md). |
| **Switch between backends** | Connect to compatible local or remote coding-agent environments and select the one that fits your task. |
| **Create automations** | Set up recurring or event-triggered development workflows. |
| **Connect your tools** | Use the integrations available to your configured Kzcoder environment. |
| **Choose your models and agents** | Work with compatible model and coding-agent runtimes supported by your setup. |

For questions, feedback or bugs, [open an issue in the Kzcoder repository](https://github.com/jeanvicenc4/Kzcoder/issues).

## Quickstart

You can run Kzcoder on a laptop, a dedicated computer or a server. A self-hosted deployment can keep runtimes and automations available when your everyday computer is offline. Read the [self-hosting guide](./docs/SELF_HOSTING.md) before exposing an instance beyond your own machine.

### Option 1: Run from source

> [!WARNING]
> An agent can access files and tools available to the account and environment running it. Use a workspace you intend to share with the agent.

**Requirements:** Node.js 24 or later, npm, `uv`, and Git.

```sh
git clone https://github.com/jeanvicenc4/Kzcoder.git
cd Kzcoder
npm install
npm run dev
```

When startup completes, open [http://localhost:8000](http://localhost:8000). The development stack starts the local application services together.

### Option 2: Build the Docker image from source

**Requirements:** Docker and the source setup above.

```sh
npm run build:docker -- --tag kzcoder:local
```

This builds a local image using the versions configured in this repository. For safe port publishing, credentials, persistent data and workspace mounts, follow the [self-hosting guide](./docs/SELF_HOSTING.md).

### Option 3: Isolate conversation execution

Kzcoder can run each new conversation in its own Docker container while the main interface remains on the host. This is useful when working on several tasks concurrently.

```sh
OH_CONVERSATION_RUNTIME=docker npm run dev
```

This setting isolates conversation execution; it does not move the entire Kzcoder interface and automation service into the sandbox. Use separate workspaces or worktrees when parallel tasks should not modify the same files. For Windows, see [README.windows.md](./README.windows.md).

## Access and security

Local development listeners use the local machine by default. If you change the bind address, publish a container port, or expose Kzcoder over a network, configure authentication and access controls first. Use isolated workspaces for sensitive projects, protect credentials, and never commit secrets to the repository.

## Architecture

Kzcoder provides the user interface and orchestration for conversations, backend selection and automation. A configured agent runtime performs the coding work in its assigned environment; Kzcoder can connect to more than one compatible runtime and let you switch between them. Runtime placement and permissions depend on the deployment you configure.

<p align="center">
  <img width="1456" height="1258" alt="Kzcoder architecture and workflow" src="https://github.com/user-attachments/assets/cb6de6f5-ac30-4d04-a76a-b5c259f0c163">
</p>

## OpenHands partnership

Kzcoder's technical partnership with OpenHands supports its coding-agent foundation. This is the only external partnership highlighted here; the product, interface, documentation and roadmap remain focused on Kzcoder. Required copyright and license notices are preserved in [LICENSE](./LICENSE).

## More documentation

- [Documentation index](./docs/README.md)
- [Architecture overview](./docs/architecture.md)
- [Development guide](./docs/DEVELOPMENT.md)
- [Self-hosting guide](./docs/SELF_HOSTING.md)
- [Agent compatibility guide](./docs/ACP_AGENTS.md)
- [Windows-specific setup](./README.windows.md)

<p align="right"><a href="#readme-top">Back to top ↑</a></p>
