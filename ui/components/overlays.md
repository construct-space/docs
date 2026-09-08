# Overlays

9 components for things that float above the page — modals, drawers, popovers, menus. Escape-to-close, click-outside, keyboard nav are wired automatically.

## Modal

Centered dialog with backdrop. Use for confirmations, focused tasks, or forms that shouldn't share screen with anything else.

```ts
interface Props {
  open?: boolean
  title?: string
  description?: string
  fullscreen?: boolean
  preventClose?: boolean              // disables Esc + outside click
  closeOnClickOutside?: boolean       // true
}
```

Slots: `trigger`, `header`, `body` (default), `footer`.

```vue
<Modal v-model:open="showShare" title="Share folder" description="Pick who can access it">
  <SharePanel :folder="folder" />
  <template #footer>
    <Button variant="ghost" @click="showShare = false">Cancel</Button>
    <Button @click="save">Share</Button>
  </template>
</Modal>
```

## Drawer

Slide-out panel from left / right / bottom. Larger than a popover, doesn't take full focus like a modal.

```ts
interface Props {
  open?: boolean
  side?: 'left' | 'right' | 'bottom'   // 'right'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'   // 'md'
  overlay?: boolean       // true — dims the rest of the page
  closable?: boolean      // true — Esc + overlay click close
}
```

Slots: `header`, `default`, `footer`.

```vue
<Drawer v-model:open="showFilters" side="left" size="sm">
  <template #header><h2>Filters</h2></template>
  <FilterPanel />
  <template #footer>
    <Button block @click="apply">Apply</Button>
  </template>
</Drawer>
```

## Slideover

Lightweight slide-from-side panel. Like Drawer but no size variants, no header/footer slots — just a body. Use for inspector panels.

```ts
interface Props {
  open?: boolean
  title?: string
  side?: 'left' | 'right'    // 'right'
  preventClose?: boolean
}
```

```vue
<Slideover v-model:open="showInfo" title="File details">
  <FileMetadata :file="file" />
</Slideover>
```

## ConfirmationModal

Pre-built confirm dialog — title + message + Cancel / Confirm buttons. Use this instead of building a Modal every time you need "Are you sure?".

```ts
interface Props {
  modelValue: boolean
  title?: string                            // 'Confirm Action'
  message: string
  details?: string
  confirmText?: string                      // 'Confirm'
  cancelText?: string                       // 'Cancel'
  confirmColor?: 'primary' | 'error' | 'success' | 'warning' | 'info'   // 'primary'
  loading?: boolean
}
```

Emits `confirm`, `cancel`.

```vue
<ConfirmationModal
  v-model="showDelete"
  title="Delete folder?"
  message="This is permanent."
  details="All 124 files inside will also be deleted."
  confirm-text="Delete"
  confirm-color="error"
  :loading="deleting"
  @confirm="deleteFolder"
/>
```

## Popover

Anchored floating panel. Smaller than a Drawer, wider than a Tooltip. Click-to-open.

```ts
interface Props {
  open?: boolean                            // optional controlled mode
  content?: {
    side?: 'top' | 'bottom' | 'left' | 'right'    // 'bottom'
    align?: 'start' | 'center' | 'end'            // 'center'
    sideOffset?: number                            // 4
  }
}
```

Slots: `default` (trigger), `content` (panel body).

```vue
<Popover :content="{ side: 'bottom', align: 'end' }">
  <Button icon="i-lucide-share">Share</Button>
  <template #content>
    <SharePanel :folder="folder" />
  </template>
</Popover>
```

## Tooltip

Hover-only label. Single line of text by default.

```ts
interface Props {
  text?: string
  content?: {
    side?: 'top' | 'bottom' | 'left' | 'right'    // 'bottom'
    align?: 'start' | 'center' | 'end'
    sideOffset?: number                            // 6
  }
}
```

Slot `default` is the trigger; slot `content` overrides the text.

```vue
<Tooltip text="Mark as read">
  <Button icon="i-lucide-check" variant="ghost" />
</Tooltip>

<Tooltip :content="{ side: 'right' }">
  <Avatar :src="user.avatar" />
  <template #content>
    <strong>{{ user.name }}</strong><br>
    {{ user.email }}
  </template>
</Tooltip>
```

## Dropdown

Generic items-array dropdown. Pass `items[]`; clicking a trigger reveals the list.

```ts
interface DropdownItem {
  label?: string
  icon?: string
  action?: () => void
  separator?: boolean
}

interface Props {
  items?: DropdownItem[]
}
```

Slot `default` is the trigger.

```vue
<Dropdown :items="[
  { label: 'Rename', icon: 'i-lucide-edit',  action: rename },
  { label: 'Move',   icon: 'i-lucide-folder', action: move },
  { separator: true },
  { label: 'Delete', icon: 'i-lucide-trash', action: remove },
]">
  <Button icon="i-lucide-more-horizontal" variant="ghost" />
</Dropdown>
```

## DropdownMenu

Richer version of Dropdown with descriptions, groups (nested arrays), keyboard nav, and Nuxt-UI-compatible item shape.

```ts
interface UDropdownItem {
  label?: string
  icon?: string
  description?: string
  type?: 'separator' | 'label'      // 'label' renders a section heading
  disabled?: boolean
  color?: string
  onSelect?: () => void
}

interface Props {
  items?: UDropdownItem[] | UDropdownItem[][]    // flat or grouped
  content?: { side?, align?, sideOffset? }       // same shape as Popover
}
```

```vue
<DropdownMenu :items="[
  [
    { type: 'label', label: 'Folder actions' },
    { label: 'Rename',     icon: 'i-lucide-edit',   onSelect: rename },
    { label: 'Move to…',   icon: 'i-lucide-folder', onSelect: move },
  ],
  [
    { label: 'Delete', icon: 'i-lucide-trash', color: 'error', onSelect: remove },
  ],
]">
  <Button icon="i-lucide-more-horizontal" variant="ghost" />
</DropdownMenu>
```

## ContextMenu

Right-click menu. Same item shape as DropdownMenu; opens at the pointer instead of anchored to a trigger.

```ts
interface ContextMenuOption {
  label?: string
  icon?: string
  type?: 'separator' | 'label'
  disabled?: boolean
  onSelect?: () => void
}

interface Props {
  items?: ContextMenuOption[] | ContextMenuOption[][]
}
```

Slot `default` is the area that listens for right-click.

```vue
<ContextMenu :items="[
  { label: 'Cut',   icon: 'i-lucide-scissors',   onSelect: cut },
  { label: 'Copy',  icon: 'i-lucide-copy',       onSelect: copy },
  { label: 'Paste', icon: 'i-lucide-clipboard',  onSelect: paste },
  { type: 'separator' },
  { label: 'Delete', icon: 'i-lucide-trash',     onSelect: remove, disabled: !selection },
]">
  <FileGrid :files="files" />
</ContextMenu>
```
