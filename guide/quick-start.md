# Quick Start

Build a Space, install it into Construct, and watch the assistant call it. About 5 minutes.

## Prerequisites

- **Construct** (desktop app) — install from the [releases page](https://github.com/construct-space/construct-app/releases)
- **Bun** ≥ 1.0 — `curl -fsSL https://bun.sh/install | bash`
- **The CLI** — `bun install -g @construct-space/cli`

Verify:

```bash
construct --version
```

## 1. Scaffold

```bash
construct create todo
cd space-todo
```

The CLI drops you a minimal Space:

```
space-todo/
├── space.manifest.json
├── package.json            # @construct-space/sdk pinned
├── vite.config.ts          # IIFE build, externalized vue/pinia
├── src/
│   ├── entry.ts            # auto-generated from the manifest
│   ├── pages/index.vue
│   ├── actions.ts          # empty action surface
│   └── models/             # empty
├── agent/config.md
└── widgets/                # empty
```

## 2. Wire a Page

Open `src/pages/index.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Input } from '@construct-space/ui'
import { useToast } from '@construct-space/sdk'

const items = ref<string[]>([])
const draft = ref('')
const toast = useToast()

function add() {
  if (!draft.value.trim()) return
  items.value.push(draft.value.trim())
  draft.value = ''
  toast.success('Added')
}
</script>

<template>
  <Card>
    <h2>Todo</h2>
    <Input v-model="draft" placeholder="Buy groceries…" @keyup.enter="add" />
    <Button @click="add">Add</Button>
    <ul>
      <li v-for="(t, i) in items" :key="i">{{ t }}</li>
    </ul>
  </Card>
</template>
```

This is a working Space already. No router setup, no provide/inject, no module wiring — `@construct-space/sdk` exposes the host's runtime types and the host injects bodies at load.

## 3. Expose Actions to the Agent

`actions.ts` is what the assistant calls. Same shape as a marketplace space:

```ts
import { ref } from 'vue'

const items = ref<string[]>([])

export const actions = {
  listTodos: {
    description: 'List all todos',
    run: () => ({ items: items.value }),
  },
  addTodo: {
    description: 'Add a new todo',
    params: { text: { type: 'string', required: true } },
    run: (p: { text: string }) => {
      items.value.push(p.text)
      return { added: p.text }
    },
  },
  clearTodos: {
    description: 'Remove all todos',
    run: () => {
      const count = items.value.length
      items.value = []
      return { cleared: count }
    },
  },
}
```

Brain auto-discovers this manifest via `space_list_actions` and surfaces every entry as `space_run_action(space:"todo", action:"addTodo", args:{text:"…"})`. Say *"add 'milk' to my todos"* in the assistant — the action runs.

## 4. Build + Install

```bash
construct build      # bundles to dist/ (IIFE, externalized vue/pinia)
construct install    # copies to ~/Library/Application Support/Construct/spaces/todo
```

Reload Construct (Cmd+R). The Space appears in the sidebar.

## 5. Live Iteration

For tight loops, watch mode rebuilds + reinstalls on every save:

```bash
construct dev
```

Edit the page, save, see the change without re-running anything manually.

## What's next

- [Anatomy of a Space](/guide/anatomy-of-a-space) — every file you didn't write yourself, explained
- [Persistent Data](/reference/composables/networking-data) — model your data with `defineModel` + `useData`
- [Per-Resource Access](/guide/access) — make your Space shareable with `useAccess`
- [Composable Reference](/reference/) — the full surface
