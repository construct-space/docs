# Construct Documentation

Official documentation for the Construct Framework, built with VitePress.

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## CapRover

The docs app ships as a static VitePress build served by nginx.

```bash
# From docs/:
caprover deploy --caproverApp docs --default
```

CapRover reads `captain-definition`, builds `Dockerfile`, and serves the
generated `.vitepress/dist` directory on port 80. Set the CapRover health
check path to `/healthz`.

## Structure

```
docs/
├── .vitepress/
│   └── config.ts      # VitePress configuration
├── Dockerfile         # CapRover/nginx production image
├── captain-definition # CapRover deploy descriptor
├── nginx.conf         # static docs server with clean URL fallback
├── guide/             # User guide
│   ├── introduction.md
│   ├── quick-start.md
│   └── ...
├── cli/               # CLI reference
│   ├── installation.md
│   ├── generate.md
│   └── ...
├── api/               # API reference
│   └── ...
└── index.md           # Homepage
```

## Contributing

Contributions to the documentation are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Copyright

Copyright © 2026 Construct. All rights reserved.
