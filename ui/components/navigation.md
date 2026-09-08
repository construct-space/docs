# Navigation

5 components for moving around: `Tabs`, `Breadcrumbs`, `Pagination`, `Tree`, plus `Tab` (used inside `Tabs`).

## Tabs / Tab

Tab strip with sliding indicator. Two visual variants: underline (`line`) and pill (`segmented`).

```ts
interface TabItem {
  label: string
  value: string
  icon?: string | Component
  disabled?: boolean
}

interface Props {
  modelValue?: string             // active tab value
  items?: TabItem[]
  variant?: 'line' | 'segmented'  // 'line'
}
```

Two ways to render content:

**1. Items array + `<template #{value}>`**

```vue
<Tabs
  v-model="active"
  :items="[
    { value: 'general',  label: 'General', icon: 'i-lucide-settings' },
    { value: 'security', label: 'Security' },
    { value: 'billing',  label: 'Billing' },
  ]"
>
  <template #general>  <GeneralPanel />  </template>
  <template #security> <SecurityPanel /> </template>
  <template #billing>  <BillingPanel />  </template>
</Tabs>
```

**2. `<Tab>` children**

```vue
<Tabs v-model="active" variant="segmented">
  <Tab label="General"  value="general"><GeneralPanel /></Tab>
  <Tab label="Security" value="security"><SecurityPanel /></Tab>
</Tabs>
```

## Breadcrumbs

Standalone trail of links with chevron separators. Render anywhere inside your space's body — headers, side panels, modals.

```ts
interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

interface Props {
  items: BreadcrumbItem[]
}
```

Emits `navigate` when a crumb is clicked.

```vue
<Breadcrumbs
  :items="[
    { label: 'Drive', to: '/',                icon: 'i-lucide-folder' },
    { label: '2026',  to: '/folders/2026' },
    { label: 'Q1' },
  ]"
  @navigate="c => nav.to(c.to!)"
/>
```

## Pagination

Page number nav with ellipsis for long ranges. `total` is the row count; `pageCount` is the page size.

```ts
interface Props {
  modelValue?: number     // current page (1-indexed)
  total?: number          // total row count
  pageCount?: number      // rows per page; default 10
  disabled?: boolean
}
```

```vue
<Pagination v-model="page" :total="rows.length" :page-count="20" />
```

## Tree

File-tree component with expand/collapse, keyboard nav, single or multi selection, indent guides, and optional drag-and-drop.

```ts
interface TreeNode {
  id: string
  label: string
  icon?: string
  children?: TreeNode[]
  expanded?: boolean
  selected?: boolean
  data?: any            // your own row attached to the node
}

interface Props {
  items?: TreeNode[]
  modelValue?: string | string[] | null   // selected id(s)
  multiple?: boolean
  draggable?: boolean
  indentPx?: number     // 16
}
```

Emits: `select`, `expand`, `collapse`, `drop` (with `{ dragged, target, position: 'before' | 'inside' | 'after' }`).

```vue
<Tree
  v-model="selectedId"
  :items="folderTree"
  draggable
  @drop="onDrop"
/>
```

