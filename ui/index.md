# @construct-space/ui

Vue 3 component library that ships with Construct. **53 components.** CSS-variable themed (light + dark out of the box); no Tailwind to install on the consumer side. Composables (reactive helpers) live in the [SDK](/reference/).

```bash
bun add @construct-space/ui
```

::: tip Bun is required
Construct's tooling is built around [Bun](https://bun.sh). Use it for installing, running, and building space packages. npm / yarn / pnpm are not supported.
:::

## Use it

Just import the components you need:

```vue
<script setup>
import { Button, Card, Modal } from '@construct-space/ui'
</script>

<template>
  <Card title="Hello">
    <Button @click="open = true">Open</Button>
    <Modal v-model:open="open">…</Modal>
  </Card>
</template>
```

A space doesn't own a Vue app instance — the host does — so there's no `createApp(...).use(plugin)` step. Components tree-shake; you only pay for what you import.

The library is unbundled from Tailwind. Styles ship as plain CSS injected at import time; no `tailwind.config.js` work on your side.

## What's in the box

| Group | Examples | Count |
|---|---|---|
| [Inputs & Forms](/ui/components/inputs) | Button, Input, Select, Autocomplete, DatePicker, FormField | 17 |
| [Display](/ui/components/display) | Avatar, Badge, Chip, Card, Icon, Progress, Skeleton | 10 |
| [Overlays](/ui/components/overlays) | Modal, Drawer, Popover, Tooltip, Dropdown, ContextMenu | 9 |
| [Navigation](/ui/components/navigation) | Tabs, Breadcrumbs, Pagination, Tree | 5 |
| [Layout](/ui/components/layout) | SplitPane, ScrollArea, Accordion, PanelSection, PropRow, Group, SidebarLayout | 7 |
| [Data](/ui/components/data) | Table, Timeline | 2 |
| [Feedback](/ui/components/feedback) | Alert | 1 |

## Design rules

- **CSS variables are the theme.** `var(--app-foreground)`, `var(--app-background)`, `var(--app-accent)`, etc. Override at the host to reskin everything. See [Theming](/ui/theming).
- **No JS theme provider needed.** The host writes a class on `<html>`; components read CSS variables. Switching light/dark is a single class swap.
- **Headless where it matters.** Components like `<Popover>`, `<Dropdown>`, `<SplitPane>` use Floating-UI internally — you get correct placement, edge collision, and resize behavior without writing it.
- **No global state stored in the library.** `useToast()` and similar use module-level refs scoped to the page, not Pinia. Drop-in works.

## Pairing with the SDK

The SDK declares what a space *can do*; the UI library is what it *renders with*. Two distinct packages:

| | SDK | UI |
|---|---|---|
| `useAuth()` | ✓ — reads who's signed in | |
| `useNotification()` | ✓ — fires an inbox notification | |
| `<Notification>` card | | ✓ — renders one in the host bell |
| `useToast()` | ✓ — transient "Saved" toasts | |
| `<Modal>`, `<Dropdown>`, `<Button>` | | ✓ — all UI composition |
