# Data

Two components for displaying tabular / chronological data.

## Table

Data table with sorting, selection, sticky header, loading skeleton, and empty state.

```ts
interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string           // CSS length
  align?: 'left' | 'center' | 'right'
}

interface Props {
  columns: TableColumn[]
  rows: Record<string, any>[]
  loading?: boolean
  selectable?: boolean | 'single' | 'multi'   // 'single' | 'multi' for checkbox column
  striped?: boolean
  size?: 'compact' | 'comfortable'   // 'comfortable'
  stickyHeader?: boolean             // true
  rowKey?: string | ((row, index) => string | number)   // 'id'
  skeletonRows?: number              // 5 — how many loading rows to render
}
```

### Slots

Per-cell rendering via `#cell-{column.key}` (or `#cell-{column.key}-{row.id}` for one-off overrides). `#empty` for the empty state body, `#header-actions` for a bulk-action bar that appears when rows are selected.

```vue
<Table
  :columns="[
    { key: 'name',    label: 'Name',    sortable: true },
    { key: 'size',    label: 'Size',    align: 'right' },
    { key: 'updated', label: 'Updated', sortable: true, width: '140px' },
    { key: 'actions', label: '',        width: '60px' },
  ]"
  :rows="files"
  :loading="loading"
  selectable="multi"
  striped
  v-model:selected="selectedRows"
>
  <template #cell-size="{ row }">
    {{ bytes(row.size) }}
  </template>

  <template #cell-actions="{ row }">
    <Dropdown :items="rowActions(row)">
      <Button icon="i-lucide-more-horizontal" variant="ghost" size="xs" />
    </Dropdown>
  </template>

  <template #empty>
    <Empty icon="i-lucide-folder-open" title="No files yet" />
  </template>
</Table>
```

## Timeline

Vertical or horizontal sequence of events with status indicators.

```ts
interface TimelineItem {
  id: string
  title: string
  description?: string
  icon?: string
  color?: string
  timestamp?: string | Date
  status?: 'completed' | 'active' | 'pending'
}

interface Props {
  items?: TimelineItem[]
  direction?: 'vertical' | 'horizontal'    // 'vertical'
  size?: 'compact' | 'comfortable'         // 'comfortable'
}
```

```vue
<Timeline :items="[
  { id: '1', title: 'Created folder',     status: 'completed', timestamp: '2026-04-12T09:00' },
  { id: '2', title: 'Shared with team',   status: 'completed', timestamp: '2026-04-12T10:32' },
  { id: '3', title: 'Awaiting approval',  status: 'active',    icon: 'i-lucide-clock' },
  { id: '4', title: 'Publish to org',     status: 'pending' },
]" />
```
