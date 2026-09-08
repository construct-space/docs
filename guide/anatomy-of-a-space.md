# Anatomy of a Space

A **Space** is a self-contained module that extends Construct — a notes app, a kanban board, a paint canvas, a Git manager. Spaces are independent packages with their own UI, optional AI agent, and tools, loaded into the host at runtime.

This page covers what's on disk, what ends up in the bundle, and how the CLI gets you from one to the other.

> See the [exploded diagram](/anatomy.html) — host chrome, space content, and space toolbar shown as three layers with the wiring between them.

## Directory layout

```
space-myapp/
├── package.json              # bun project
├── space.manifest.json       # configuration (source of truth)
├── src/
│   └── entry.ts              # auto-generated — DO NOT EDIT
├── pages/
│   ├── index.vue             # path: ""
│   └── editor.vue            # path: "editor"
├── components/               # Vue components used by pages
├── composables/              # local helpers
├── agent/                    # AI agent (optional)
│   ├── config.md             # agent definition (YAML frontmatter + prompt)
│   ├── tools/                # tool definitions (markdown)
│   ├── skills/               # skill definitions
│   └── subagents/            # nested agent specs
├── widgets/                  # dashboard widgets (optional)
├── vite.config.ts
├── tsconfig.json
└── dist/                     # build output (generated)
```

## The manifest

`space.manifest.json` declares what your space is. The full reference is the [`spaceManifestSchema`](https://www.npmjs.com/package/@construct-space/sdk) in the SDK; here are the fields you'll actually use:

```json
{
  "id": "myapp",
  "name": "My App",
  "version": "0.1.0",
  "description": "Short tagline",
  "icon": "i-lucide-box",

  "scopes": ["app", "org"],

  "navigation": {
    "label": "My App",
    "icon": "i-lucide-box",
    "order": 20
  },

  "pages": [
    { "id": "home",   "name": "Home",   "path": "",       "default": true },
    { "id": "editor", "name": "Editor", "path": "editor", "icon": "i-lucide-file-edit" }
  ],

  "permissions": [
    { "key": "folder.create", "label": "Create folders" },
    { "key": "folder.delete", "label": "Delete folders" }
  ],

  "agent": "agent/config.md"
}
```

| Field | What it does |
|---|---|
| `id` | Lowercase, hyphenated. Used everywhere — install dir, IIFE global, namespace. |
| `name`, `version`, `description`, `icon` | Marketing surface. |
| `scopes` | Where the space can be installed: `['app']`, `['org']`, or both. See [Tenancy](/guide/tenancy). |
| `navigation` | How it appears in the host sidebar. |
| `pages` | Vue page components. Empty `path` = the index page. |
| `permissions` | RBAC catalog declared to source-api on install. Only meaningful when `scopes` includes `'org'`. See [Auth & Identity](/reference/composables/auth#useauthorization). |
| `agent` | Path to the agent config file (optional). |

## The CLI

`construct` does everything. The commands you'll use day to day:

```bash
construct scaffold [name]      # new space project (aliases: new, create)
construct dev                  # watch + reload while you edit
construct build                # build the IIFE bundle
construct build --entry-only   # only regenerate src/entry.ts
construct install              # install built space into the host (alias: run)
construct validate             # check space.manifest.json against the schema
construct check                # run vue-tsc + eslint
construct publish              # push to the marketplace
construct login                # authenticate
```

Graph commands live under `construct graph` — see [Graph](/graph/).

## Build output

```
dist/
├── manifest.json             # source manifest + build metadata
├── space-myapp.iife.js       # the bundle
├── space-myapp.css           # compiled styles
└── config.agent              # bundled agent + tools + skills (optional)
```

The IIFE bundle defines one global: `__CONSTRUCT_SPACE_<ID_UPPER>`. For `id: "my-app"` that's `__CONSTRUCT_SPACE_MY_APP`. The host eval's the bundle, reads that global, and renders pages from it.

`config.agent` is the agent directory (`agent/config.md` + `agent/tools/**` + `agent/skills/**` + `agent/subagents/**`) flattened into a single obfuscated blob. The host's agent runtime decodes it at load time.

## Install location

The host installs spaces into the user's app data directory, per profile:

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/Construct/profiles/<profile>/spaces/<id>/` |
| Linux | `~/.local/share/construct/profiles/<profile>/spaces/<id>/` |
| Windows | `%APPDATA%\Construct\profiles\<profile>\spaces\<id>\` |

`construct install` copies `dist/` to the right place and makes anything under `bin/` executable. `construct dev` skips the copy and live-reloads from your working directory.

## Lifecycle in one diagram

```
your code              construct CLI                 host
─────────              ─────────────                 ────
space.manifest.json
  + pages/             construct build
  + components/   →    ├─ generate src/entry.ts
  + agent/             ├─ vite build → dist/space-<id>.iife.js
                       ├─ bundle agent/ → dist/config.agent
                       └─ write dist/manifest.json (with checksum)
                                                     ↓
                       construct install / publish
                                                     ↓
                                                     install dir (per profile)
                                                     ↓
                                                     host loads on demand:
                                                       eval(IIFE) → __CONSTRUCT_SPACE_<ID>
                                                       inject CSS
                                                       load agent runtime
                                                       render the active page
```

## Creating a new space

```bash
construct scaffold my-app     # or: construct new my-app
cd my-app
construct dev                 # iterate
construct check               # lint + type-check
construct build && construct install
construct publish             # when ready
```

That's the whole loop.
