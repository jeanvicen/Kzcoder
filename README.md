# Kzcoder

Kzcoder is a self-hosted control center for working with coding agents and automating development tasks. Run it locally, connect it to the agent environment you use, and manage your coding work from one interface.

## OpenHands partnership

Kzcoder's technical partnership with OpenHands supports its coding-agent foundation. The product, brand and documentation here focus on Kzcoder; this is the only external partnership described in this document.

## Requirements

- Node.js 24 or later
- npm
- [uv](https://docs.astral.sh/uv/)
- Git

## Run locally

```bash
git clone https://github.com/jeanvicenc4/Kzcoder.git
cd Kzcoder
npm install
npm run dev
```

When the development server starts, open [http://localhost:8000](http://localhost:8000).

## Development commands

```bash
npm run dev    # Start the local development stack
npm run build  # Build the application
npm test       # Run the test suite
npm run lint   # Type-check and lint the source
```

## Security

Kzcoder runs agent processes in your development environment. An agent may be able to access files and services available to the account or environment running it. Only use agents and configurations you trust. Prefer isolated environments, limit access to sensitive files and credentials, and review network or remote-access settings before exposing services beyond your machine. Never commit secrets to the repository.

## License

Kzcoder is distributed under the MIT License. See [LICENSE](./LICENSE) for the license text and required notices.

## Issues

To report a problem or request an improvement, [open an issue in this repository](https://github.com/jeanvicenc4/Kzcoder/issues).
